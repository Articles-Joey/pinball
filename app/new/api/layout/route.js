import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
    "liberty",
    "bumper",
    "post",
    "slingshot",
    "gutterFlap",
    "flipper",
]);
const ID_PATTERN = /^[a-z0-9-]{1,80}$/;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function vector(value, name) {
    if (!Array.isArray(value) || value.length !== 3)
        throw new Error(`${name} must contain three numbers`);
    const result = value.map(Number);
    if (
        result.some((entry) => !Number.isFinite(entry) || Math.abs(entry) > 100)
    ) {
        throw new Error(`${name} contains an invalid value`);
    }
    return result.map((entry) => Math.round(entry * 10000) / 10000);
}

function normalizeObject(object) {
    if (!object || typeof object !== "object")
        throw new Error("Every scene entry must be an object");
    if (!ID_PATTERN.test(object.id))
        throw new Error(`Invalid object id: ${object.id}`);
    if (!ALLOWED_TYPES.has(object.type))
        throw new Error(`Invalid object type: ${object.type}`);

    const result = {
        id: object.id,
        type: object.type,
        label: String(object.label || object.id).slice(0, 100),
        position: vector(object.position, `${object.id}.position`),
        rotation: vector(object.rotation, `${object.id}.rotation`),
    };

    if (object.color !== undefined) {
        if (!COLOR_PATTERN.test(object.color))
            throw new Error(`Invalid color on ${object.id}`);
        result.color = object.color;
    }
    if (object.side !== undefined) {
        if (!["left", "right"].includes(object.side))
            throw new Error(`Invalid side on ${object.id}`);
        result.side = object.side;
    }
    if (object.logic !== undefined) {
        if (
            object.logic?.trigger !== "toggle" ||
            !Array.isArray(object.logic.targets)
        ) {
            throw new Error(`Invalid logic definition on ${object.id}`);
        }
        result.logic = {
            trigger: "toggle",
            targets: object.logic.targets.map((target) => {
                if (!ID_PATTERN.test(target))
                    throw new Error(`Invalid linked target on ${object.id}`);
                return target;
            }),
        };
    }
    return result;
}

export async function POST(request) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "The scene editor is only available in development." },
            { status: 404 },
        );
    }

    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
        return NextResponse.json(
            { error: "Cross-origin layout writes are not allowed." },
            { status: 403 },
        );
    }

    try {
        const payload = await request.json();
        if (
            !Array.isArray(payload.objects) ||
            payload.objects.length === 0 ||
            payload.objects.length > 100
        ) {
            throw new Error(
                "objects must be a non-empty array with no more than 100 entries",
            );
        }

        const objects = payload.objects.map(normalizeObject);
        const ids = new Set(objects.map((object) => object.id));
        if (ids.size !== objects.length)
            throw new Error("Scene object ids must be unique");
        for (const object of objects) {
            for (const target of object.logic?.targets || []) {
                if (!ids.has(target))
                    throw new Error(
                        `${object.id} links to missing target ${target}`,
                    );
            }
        }

        const source = `export const SCENE_OBJECTS = ${JSON.stringify(objects, null, 4)}\n`;
        const target = path.join(
            process.cwd(),
            "app",
            "new",
            "components",
            "sceneLayout.js",
        );
        await writeFile(target, source, "utf8");

        return NextResponse.json({ saved: true, count: objects.length });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Invalid layout" },
            { status: 400 },
        );
    }
}
