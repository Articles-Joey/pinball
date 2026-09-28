"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Base, Geometry, Subtraction } from "@react-three/csg";
import {
    BallCollider,
    CuboidCollider,
    CylinderCollider,
    RigidBody,
} from "@react-three/rapier";
import {
    CatmullRomCurve3,
    Euler,
    Plane,
    Quaternion,
    Shape,
    Vector3,
} from "three";
import { Star, usePinballArtwork } from "./PinballArtwork";
import { SCENE_OBJECTS } from "./sceneLayout";
import {
    PLAYFIELD_HALF_LENGTH,
    PLAYFIELD_HALF_WIDTH,
    PLAYFIELD_LENGTH,
    PLAYFIELD_WIDTH,
} from "./machineDimensions";

const TILT = (6.5 * Math.PI) / 180;
const LEG_EXTENSION = 0.18;
const FIELD_Y = 1.65 + LEG_EXTENSION;
const BACKBOX_Y = 2.87 + LEG_EXTENSION;
const FIELD_QUATERNION = new Quaternion().setFromEuler(new Euler(TILT, 0, 0));
const INVERSE_FIELD = FIELD_QUATERNION.clone().invert();
const UP = new Vector3(0, 1, 0);
const RED = "#cf2d42";
const NAVY = "#071b38";
const GOLD = "#e6b862";
const WHITE = "#fff1d2";
const LAUNCH_CHARGE_SECONDS = 2.25;
const LAUNCH_POWER_THRESHOLD = 0.2;
const MIN_CHAMBER_PLUNGER_SPEED = 0.6;
const MAX_CHAMBER_PLUNGER_SPEED = 1.9;
const MIN_ARMED_PLUNGER_SPEED = 4.8;
const MAX_ARMED_PLUNGER_SPEED = 9;
const DEFAULT_SHOOTER_LANE_DIVIDER_X = 0.9;
const SHOOTER_LANE_CENTER_X = 1.24;
const PLUNGER_REST_Z = 2.46;
const PLUNGER_STRIKE_Z = 2.29;
const PLUNGER_PULL_DISTANCE = 0.34;
const EDITOR_EDGE_MARGIN = 0.06;

function clampToPlayfield(value, halfSize) {
    return Math.max(
        -halfSize + EDITOR_EDGE_MARGIN,
        Math.min(halfSize - EDITOR_EDGE_MARGIN, value),
    );
}

function worldPoint(x, y, z) {
    return new Vector3(x, y, z)
        .applyQuaternion(FIELD_QUATERNION)
        .add(new Vector3(0, FIELD_Y, 0));
}

function localPoint(point) {
    return new Vector3(point.x, point.y - FIELD_Y, point.z).applyQuaternion(
        INVERSE_FIELD,
    );
}

const EDITOR_PLANE = new Plane().setFromNormalAndCoplanarPoint(
    new Vector3(0, 1, 0).applyQuaternion(FIELD_QUATERNION),
    worldPoint(0, 0.08, 0),
);

function EditablePlacement({ item, editor, children }) {
    const dragOffset = useRef(new Vector3());
    const dragStart = useRef(new Vector3());
    const moved = useRef(false);
    const intersection = useMemo(() => new Vector3(), []);

    const pointOnField = (event) => {
        if (!event.ray.intersectPlane(EDITOR_PLANE, intersection)) return null;
        return localPoint(intersection);
    };

    const pointerDown = (event) => {
        if (!editor?.enabled) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        event.target.setPointerCapture?.(event.pointerId);
        dragOffset.current.set(
            item.position[0] - point.x,
            0,
            item.position[2] - point.z,
        );
        dragStart.current.copy(point);
        moved.current = false;
        editor.select(item.id);
        editor.beginDrag(item.id);
    };

    const pointerMove = (event) => {
        if (!editor?.enabled || editor.draggingId !== item.id) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        if (point.distanceToSquared(dragStart.current) > 0.0004)
            moved.current = true;
        editor.updateObject(item.id, {
            position: [
                clampToPlayfield(
                    point.x + dragOffset.current.x,
                    PLAYFIELD_HALF_WIDTH,
                ),
                item.position[1],
                clampToPlayfield(
                    point.z + dragOffset.current.z,
                    PLAYFIELD_HALF_LENGTH,
                ),
            ],
        });
    };

    const finishDrag = (event) => {
        if (!editor?.enabled || editor.draggingId !== item.id) return;
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        editor.endDrag();
        if (!moved.current && item.logic) editor.runTrigger(item);
    };

    const selected = editor?.enabled && editor.selectedId === item.id;
    const linked = editor?.enabled && editor.linkedIds.includes(item.id);

    return (
        <group
            position={item.position}
            rotation={item.rotation}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
        >
            {children}
            {(selected || linked) && (
                <mesh
                    position={[0, 0.48, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    raycast={() => null}
                >
                    <torusGeometry
                        args={[selected ? 0.24 : 0.2, 0.025, 8, 32]}
                    />
                    <meshBasicMaterial
                        color={selected ? GOLD : "#55d7ff"}
                        depthTest={false}
                    />
                </mesh>
            )}
        </group>
    );
}

function EditableWall({ item, editor }) {
    const dragOffset = useRef(new Vector3());
    const scaleDrag = useRef(null);
    const intersection = useMemo(() => new Vector3(), []);
    const length = Math.max(0.15, item.length || 0.5);
    const width = item.width || 0.055;
    const height = item.height || 0.24;
    const selected = editor?.enabled && editor.selectedId === item.id;

    const pointOnField = (event) => {
        if (!event.ray.intersectPlane(EDITOR_PLANE, intersection)) return null;
        return localPoint(intersection);
    };

    const startMove = (event) => {
        if (!editor?.enabled) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        event.target.setPointerCapture?.(event.pointerId);
        dragOffset.current.set(
            item.position[0] - point.x,
            0,
            item.position[2] - point.z,
        );
        editor.select(item.id);
        editor.beginDrag(item.id);
    };

    const moveWall = (event) => {
        if (!editor?.enabled || editor.draggingId !== item.id) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        editor.updateObject(item.id, {
            position: [
                clampToPlayfield(
                    point.x + dragOffset.current.x,
                    PLAYFIELD_HALF_WIDTH,
                ),
                item.position[1],
                clampToPlayfield(
                    point.z + dragOffset.current.z,
                    PLAYFIELD_HALF_LENGTH,
                ),
            ],
        });
    };

    const finishMove = (event) => {
        if (!editor?.enabled || editor.draggingId !== item.id) return;
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        editor.endDrag();
    };

    const startScale = (event, endSign) => {
        if (!editor?.enabled) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        event.target.setPointerCapture?.(event.pointerId);

        const yaw = item.rotation[1];
        const axis = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        const center = new Vector3(
            item.position[0],
            item.position[1],
            item.position[2],
        );
        const fixedEnd = center
            .clone()
            .addScaledVector(axis, (-endSign * length) / 2);
        scaleDrag.current = { axis, endSign, fixedEnd };
        editor.select(item.id);
        editor.beginDrag(`${item.id}:scale:${endSign}`);
    };

    const scaleWall = (event, endSign) => {
        if (
            !editor?.enabled ||
            editor.draggingId !== `${item.id}:scale:${endSign}` ||
            !scaleDrag.current
        )
            return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;

        const { axis, fixedEnd } = scaleDrag.current;
        const target = new Vector3(
            clampToPlayfield(point.x, PLAYFIELD_HALF_WIDTH),
            item.position[1],
            clampToPlayfield(point.z, PLAYFIELD_HALF_LENGTH),
        );
        const nextLength = Math.min(
            PLAYFIELD_LENGTH * 1.5,
            Math.max(0.15, target.sub(fixedEnd).dot(axis) * endSign),
        );
        const movingEnd = fixedEnd
            .clone()
            .addScaledVector(axis, endSign * nextLength);
        const center = fixedEnd.clone().add(movingEnd).multiplyScalar(0.5);

        editor.updateObject(item.id, {
            position: [center.x, item.position[1], center.z],
            length: nextLength,
        });
    };

    const finishScale = (event, endSign) => {
        if (editor?.draggingId !== `${item.id}:scale:${endSign}`) return;
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        scaleDrag.current = null;
        editor.endDrag();
    };

    return (
        <group
            position={item.position}
            rotation={item.rotation}
            onPointerDown={startMove}
            onPointerMove={moveWall}
            onPointerUp={finishMove}
            onPointerCancel={finishMove}
        >
            <RigidBody
                type="fixed"
                colliders={false}
            >
                <CuboidCollider
                    args={[width / 2, height / 2, length / 2]}
                    position={[0, height / 2, 0]}
                    restitution={0.62}
                    friction={0.08}
                />
                <Box
                    position={[0, height / 2, 0]}
                    size={[width, height, length]}
                    color={item.color || "#c4d3df"}
                    metalness={0.75}
                    roughness={0.2}
                />
            </RigidBody>

            {selected && (
                <>
                    <mesh
                        position={[0, height / 2, 0]}
                        raycast={() => null}
                    >
                        <boxGeometry
                            args={[width + 0.035, height + 0.035, length + 0.02]}
                        />
                        <meshBasicMaterial
                            color={GOLD}
                            wireframe
                            depthTest={false}
                        />
                    </mesh>
                    {[-1, 1].map((endSign) => (
                        <mesh
                            key={endSign}
                            position={[0, height + 0.09, (endSign * length) / 2]}
                            onPointerDown={(event) =>
                                startScale(event, endSign)
                            }
                            onPointerMove={(event) =>
                                scaleWall(event, endSign)
                            }
                            onPointerUp={(event) =>
                                finishScale(event, endSign)
                            }
                            onPointerCancel={(event) =>
                                finishScale(event, endSign)
                            }
                            renderOrder={20}
                        >
                            <sphereGeometry args={[0.105, 18, 14]} />
                            <meshBasicMaterial
                                color={endSign < 0 ? "#55d7ff" : GOLD}
                                transparent
                                opacity={0.25}
                                depthTest={false}
                                depthWrite={false}
                            />
                        </mesh>
                    ))}
                </>
            )}
        </group>
    );
}

function impulse(body, x, z, strength) {
    const direction = new Vector3(x, 0, z)
        .normalize()
        .multiplyScalar(strength)
        .applyQuaternion(FIELD_QUATERNION);
    body.applyImpulse(direction, true);
}

function Box({
    size,
    color = NAVY,
    metalness = 0.15,
    roughness = 0.35,
    ...props
}) {
    return (
        <mesh
            castShadow
            receiveShadow
            {...props}
        >
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                metalness={metalness}
                roughness={roughness}
            />
        </mesh>
    );
}

function Rail({
    from,
    to,
    color = "#c4d3df",
    width = 0.055,
    height = 0.24,
    onHit,
}) {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const length = Math.hypot(dx, dz);
    const position = [(from[0] + to[0]) / 2, height / 2, (from[1] + to[1]) / 2];
    const rotation = [0, Math.atan2(dx, dz), 0];
    return (
        <RigidBody
            type="fixed"
            colliders={false}
            position={position}
            rotation={rotation}
        >
            <CuboidCollider
                args={[width / 2, height / 2, length / 2]}
                restitution={0.62}
                friction={0.08}
                onCollisionEnter={onHit}
            />
            <Box
                size={[width, height, length]}
                color={color}
                metalness={0.75}
                roughness={0.2}
            />
        </RigidBody>
    );
}

function CornerTriangle({ side, color }) {
    const isLeft = side === "left";
    const points = useMemo(
        () =>
            isLeft
                ? [
                      [-0.3, 0.28],
                      [0.3, 0.28],
                      [-0.3, -0.32],
                  ]
                : [
                      [0.3, 0.28],
                      [-0.3, 0.28],
                      [0.3, -0.32],
                  ],
        [isLeft],
    );
    const shape = useMemo(() => {
        const nextShape = new Shape();
        nextShape.moveTo(points[0][0], -points[0][1]);
        points.slice(1).forEach(([x, z]) => nextShape.lineTo(x, -z));
        nextShape.closePath();
        return nextShape;
    }, [points]);

    return (
        <>
            {points.map((from, index) => (
                <Rail
                    key={index}
                    from={from}
                    to={points[(index + 1) % points.length]}
                    width={0.045}
                    height={0.13}
                    color={index === 1 ? WHITE : color}
                />
            ))}
            <mesh
                position={[0, 0.075, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                castShadow
                receiveShadow
            >
                <shapeGeometry args={[shape]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.16}
                    roughness={0.32}
                    metalness={0.14}
                />
            </mesh>
            <Star
                position={[isLeft ? -0.12 : 0.12, 0.086, 0.1]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.105}
                color={WHITE}
            />
        </>
    );
}

function TopPlayfieldArch({ color = NAVY, length = 2.54, width = 0.65 }) {
    const radiusX = Math.max(0.45, length / 2);
    const radiusZ = Math.max(0.18, width);
    const railPoints = useMemo(
        () =>
            Array.from({ length: 41 }, (_, index) => {
                const angle = (index / 40) * Math.PI;
                return new Vector3(
                    radiusX * Math.cos(angle),
                    0.17,
                    -radiusZ * Math.sin(angle),
                );
            }),
        [radiusX, radiusZ],
    );
    const curve = useMemo(
        () => new CatmullRomCurve3(railPoints, false, "centripetal"),
        [railPoints],
    );
    const ribbon = useMemo(() => {
        const shape = new Shape();
        const outer = Array.from({ length: 41 }, (_, index) => {
            const angle = (index / 40) * Math.PI;
            return [
                (radiusX + 0.05) * Math.cos(angle),
                -(radiusZ + 0.05) * Math.sin(angle),
            ];
        });
        const inner = Array.from({ length: 41 }, (_, index) => {
            const angle = Math.PI - (index / 40) * Math.PI;
            return [
                Math.max(0.3, radiusX - 0.12) * Math.cos(angle),
                -Math.max(0.08, radiusZ - 0.15) * Math.sin(angle),
            ];
        });

        shape.moveTo(outer[0][0], -outer[0][1]);
        outer.slice(1).forEach(([x, z]) => shape.lineTo(x, -z));
        inner.forEach(([x, z]) => shape.lineTo(x, -z));
        shape.closePath();
        return shape;
    }, [radiusX, radiusZ]);

    return (
        <>
            <RigidBody
                type="fixed"
                colliders={false}
            >
                {railPoints.slice(0, -1).map((from, index) => {
                    const to = railPoints[index + 1];
                    const dx = to.x - from.x;
                    const dz = to.z - from.z;
                    const length = Math.hypot(dx, dz);
                    return (
                        <CuboidCollider
                            key={index}
                            args={[0.04, 0.13, length / 2]}
                            position={[
                                (from.x + to.x) / 2,
                                0.13,
                                (from.z + to.z) / 2,
                            ]}
                            rotation={[0, Math.atan2(dx, dz), 0]}
                            restitution={0.62}
                            friction={0.08}
                        />
                    );
                })}
                <mesh castShadow>
                    <tubeGeometry args={[curve, 96, 0.04, 10, false]} />
                    <meshStandardMaterial
                        color="#d8e1e9"
                        metalness={0.9}
                        roughness={0.18}
                    />
                </mesh>
            </RigidBody>

            <mesh
                position={[0, 0.045, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <shapeGeometry args={[ribbon]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.2}
                    roughness={0.3}
                />
            </mesh>

            {[-0.43, 0, 0.43].map((amount) => {
                const x = amount * radiusX;
                const z =
                    -(radiusZ - 0.05) *
                    Math.sqrt(
                        Math.max(0, 1 - Math.pow(x / radiusX, 2)),
                    );
                return (
                    <Star
                        key={amount}
                        position={[x, 0.062, z]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={0.07}
                        color={WHITE}
                    />
                );
            })}
        </>
    );
}

function CabinetFlipperButton({ side, controls }) {
    const button = useRef();
    const buttonMaterial = useRef();
    const control = side < 0 ? "left" : "right";

    useFrame((_, dt) => {
        if (!button.current) return;
        const target = controls.current[control] ? 0.035 : 0;
        button.current.position.y +=
            (target - button.current.position.y) * Math.min(1, dt * 28);
        if (buttonMaterial.current) {
            const glow = controls.current[control] ? 0.85 : 0.25;
            buttonMaterial.current.emissiveIntensity +=
                (glow - buttonMaterial.current.emissiveIntensity) *
                Math.min(1, dt * 24);
        }
    });

    const press = (event) => {
        event.stopPropagation();
        event.target.setPointerCapture?.(event.pointerId);
        controls.current[control] = true;
    };
    const release = (event) => {
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        controls.current[control] = false;
    };

    return (
        <group
            name={`${control}-cabinet-flipper-button`}
            position={[side * 1.54, -0.08, 1.98]}
            rotation={[0, 0, side > 0 ? Math.PI / 2 : -Math.PI / 2]}
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={() => {
                controls.current[control] = false;
            }}
        >
            <group ref={button}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.09, 24]} />
                    <meshStandardMaterial
                        ref={buttonMaterial}
                        color={RED}
                        emissive={RED}
                        emissiveIntensity={0.25}
                    />
                </mesh>
                <mesh>
                    <cylinderGeometry args={[0.17, 0.17, 0.16, 20]} />
                    <meshBasicMaterial
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </mesh>
            </group>
        </group>
    );
}

function Cabinet({ controls }) {
    const sideArt = usePinballArtwork("side");
    return (
        <>
            {/* Boolean cavity passes completely through the top, leaving actual side walls and a bottom. */}
            <mesh
                castShadow
                receiveShadow
                position={[0, -0.3, 0]}
            >
                <Geometry>
                    <Base>
                        <boxGeometry args={[3, 1, PLAYFIELD_LENGTH + 0.2]} />
                    </Base>
                    <Subtraction position={[0, 0.35, 0]}>
                        <boxGeometry
                            args={[PLAYFIELD_WIDTH, 1.35, PLAYFIELD_LENGTH]}
                        />
                    </Subtraction>
                </Geometry>
                <meshStandardMaterial
                    color={NAVY}
                    roughness={0.32}
                    metalness={0.22}
                />
            </mesh>
            {[-1, 1].map((side) => (
                <group key={side}>
                    <Box
                        position={[side * 1.46, 0.215, 0]}
                        size={[0.105, 0.07, 5.83]}
                        color="#d8e1e9"
                        metalness={0.9}
                        roughness={0.18}
                    />
                    <mesh
                        position={[side * 1.502, -0.3, 0]}
                        rotation={[0, (side * Math.PI) / 2, 0]}
                    >
                        <planeGeometry args={[5.64, 0.85]} />
                        <meshStandardMaterial
                            map={sideArt}
                            roughness={0.45}
                        />
                    </mesh>
                    <CabinetFlipperButton
                        side={side}
                        controls={controls}
                    />
                </group>
            ))}
            <Box
                position={[0, 0.2, 2.82]}
                size={[3.04, 0.13, 0.19]}
                color="#d8e1e9"
                metalness={0.9}
            />
            <Box
                position={[0, -0.3, 2.912]}
                size={[0.64, 0.52, 0.035]}
                color="#10141c"
                metalness={0.7}
            />
            <Box
                position={[-0.12, -0.25, 2.937]}
                size={[0.07, 0.12, 0.025]}
                color="#bbc2cc"
                metalness={0.9}
            />
            <Box
                position={[0.12, -0.25, 2.937]}
                size={[0.07, 0.12, 0.025]}
                color="#bbc2cc"
                metalness={0.9}
            />
            <Star
                position={[0, -0.44, 2.94]}
                scale={0.075}
            />
        </>
    );
}

function Backbox() {
    const art = usePinballArtwork("backglass");
    return (
        <group position={[0, BACKBOX_Y, -3]}>
            <RoundedBox
                args={[3.25, 1.98, 0.54]}
                radius={0.07}
                smoothness={3}
                castShadow
            >
                <meshStandardMaterial
                    color={NAVY}
                    metalness={0.3}
                    roughness={0.3}
                />
            </RoundedBox>
            <Box
                position={[0, 0.12, 0.28]}
                size={[3.04, 1.56, 0.06]}
                color={GOLD}
                metalness={0.55}
            />
            <mesh position={[0, 0.12, 0.315]}>
                <planeGeometry args={[2.9, 1.44]} />
                <meshStandardMaterial
                    map={art}
                    emissiveMap={art}
                    emissive="white"
                    emissiveIntensity={0.45}
                    roughness={0.5}
                />
            </mesh>
            <Box
                position={[0, -0.78, 0.285]}
                size={[2.94, 0.25, 0.04]}
                color="#050b17"
            />
            {[-1.1, 1.1].map((x) => (
                <mesh
                    key={x}
                    position={[x, -0.78, 0.315]}
                >
                    <circleGeometry args={[0.095, 24]} />
                    <meshStandardMaterial
                        color="#394956"
                        metalness={0.8}
                    />
                </mesh>
            ))}
            {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
                <Star
                    key={x}
                    position={[x, -0.78, 0.32]}
                    scale={0.055}
                />
            ))}
            <Box
                position={[0, 1.015, 0]}
                size={[2.95, 0.035, 0.47]}
                color={RED}
            />
        </group>
    );
}

function LibertyToy({ onToggle, onScore, scenePosition }) {
    const hit = ({ other }) => {
        if (other.rigidBodyObject?.name !== "liberty-ball") return;
        const point = localPoint(other.rigidBody.translation());
        impulse(
            other.rigidBody,
            point.x - scenePosition[0],
            point.z - scenePosition[2],
            0.34,
        );
        onToggle();
        onScore(500);
    };
    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CylinderCollider
                args={[0.34, 0.18]}
                position={[0, 0.34, 0]}
                restitution={0.85}
                onCollisionEnter={hit}
            />
            <group scale={0.75}>
                <Box
                    position={[0, 0.08, 0]}
                    size={[0.32, 0.16, 0.32]}
                    color="#b9a184"
                />
                <mesh
                    position={[0, 0.4, 0]}
                    castShadow
                >
                    <coneGeometry args={[0.14, 0.55, 7]} />
                    <meshStandardMaterial
                        color="#68b8a8"
                        roughness={0.45}
                    />
                </mesh>
                <mesh position={[0, 0.73, 0]}>
                    <sphereGeometry args={[0.1, 12, 12]} />
                    <meshStandardMaterial color="#7dccb9" />
                </mesh>
                {Array.from({ length: 7 }, (_, i) => (
                    <mesh
                        key={i}
                        position={[
                            Math.cos((i * Math.PI) / 6) * 0.13,
                            0.76 + Math.sin((i * Math.PI) / 6) * 0.13,
                            0,
                        ]}
                        rotation={[0, 0, Math.PI / 2 - (i * Math.PI) / 6]}
                    >
                        <coneGeometry args={[0.022, 0.14, 5]} />
                        <meshStandardMaterial color="#7dccb9" />
                    </mesh>
                ))}
                <Box
                    position={[0.16, 0.66, 0]}
                    rotation={[0, 0, -0.3]}
                    size={[0.055, 0.42, 0.06]}
                    color="#7dccb9"
                />
                <mesh position={[0.22, 0.94, 0]}>
                    <coneGeometry args={[0.065, 0.19, 7]} />
                    <meshStandardMaterial
                        color={GOLD}
                        emissive="#f88918"
                        emissiveIntensity={1.5}
                    />
                </mesh>
                <Box
                    position={[-0.12, 0.52, 0.06]}
                    rotation={[0, 0, 0.2]}
                    size={[0.13, 0.18, 0.05]}
                    color="#599f94"
                />
            </group>
        </RigidBody>
    );
}

function Bumper({ color, onScore, scenePosition }) {
    const cap = useRef();
    const flash = useRef(0);
    const hit = ({ other }) => {
        if (other.rigidBodyObject?.name !== "liberty-ball") return;
        const p = localPoint(other.rigidBody.translation());
        impulse(
            other.rigidBody,
            p.x - scenePosition[0],
            p.z - scenePosition[2],
            0.43,
        );
        flash.current = 1;
        onScore(100);
    };
    useFrame((_, dt) => {
        flash.current = Math.max(0, flash.current - dt * 4);
        if (cap.current)
            cap.current.emissiveIntensity = 0.5 + flash.current * 2.5;
    });
    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CylinderCollider
                args={[0.12, 0.175]}
                position={[0, 0.12, 0]}
                restitution={1}
                onCollisionEnter={hit}
            />
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.22, 0.235, 0.075, 32]} />
                <meshStandardMaterial
                    color={WHITE}
                    metalness={0.25}
                />
            </mesh>
            <mesh
                position={[0, 0.15, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.135, 0.15, 0.18, 24]} />
                <meshStandardMaterial
                    color="#bbc7cf"
                    metalness={0.9}
                    roughness={0.15}
                />
            </mesh>
            <mesh
                position={[0, 0.255, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.22, 0.2, 0.075, 32]} />
                <meshStandardMaterial
                    ref={cap}
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    roughness={0.22}
                />
            </mesh>
            <Star
                position={[0, 0.3, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.105}
                color={WHITE}
            />
        </RigidBody>
    );
}

function Flipper({ side, controls, sceneRotation, editorEnabled }) {
    const body = useRef();
    const visual = useRef();
    const direction = side === "left" ? 1 : -1;
    const restingAngle = -0.3 * direction;
    const angle = useRef(restingAngle);
    const rotation = useMemo(() => new Quaternion(), []);
    const actionRotation = useMemo(() => new Quaternion(), []);
    const baseRotation = useMemo(
        () => new Quaternion().setFromEuler(new Euler(...sceneRotation)),
        [sceneRotation[0], sceneRotation[1], sceneRotation[2]],
    );
    useFrame((_, dt) => {
        const target = (controls.current[side] ? 0.6 : -0.3) * direction;
        angle.current += (target - angle.current) * Math.min(1, dt * 35);
        actionRotation.setFromAxisAngle(UP, angle.current);
        rotation
            .copy(FIELD_QUATERNION)
            .multiply(baseRotation)
            .multiply(actionRotation);
        if (editorEnabled) {
            if (visual.current)
                visual.current.rotation.y = angle.current - restingAngle;
        } else {
            body.current?.setNextKinematicRotation(rotation);
            if (visual.current) visual.current.rotation.y = 0;
        }
    });
    const hit = ({ other }) => {
        if (
            controls.current[side] &&
            other.rigidBodyObject?.name === "liberty-ball"
        )
            impulse(other.rigidBody, direction * 0.28, -1, 0.42);
    };
    return (
        <RigidBody
            ref={body}
            type="kinematicPosition"
            colliders={false}
            rotation={[0, angle.current, 0]}
        >
            <CuboidCollider
                position={[direction * 0.195, 0, 0]}
                args={[0.205, 0.0525, 0.06]}
                restitution={0.35}
                onCollisionEnter={hit}
            />
            <BallCollider
                args={[0.06]}
                position={[direction * 0.43, 0, 0]}
                onCollisionEnter={hit}
            />
            <group ref={visual}>
                <RoundedBox
                    position={[direction * 0.195, 0, 0]}
                    args={[0.48, 0.105, 0.135]}
                    radius={0.052}
                    smoothness={3}
                    castShadow
                >
                    <meshStandardMaterial
                        color={RED}
                        roughness={0.35}
                    />
                </RoundedBox>
                <RoundedBox
                    position={[direction * 0.19, 0.047, 0]}
                    args={[0.42, 0.035, 0.09]}
                    radius={0.018}
                    smoothness={2}
                >
                    <meshStandardMaterial
                        color={WHITE}
                        roughness={0.3}
                    />
                </RoundedBox>
                <mesh position={[0, 0.074, 0]}>
                    <cylinderGeometry args={[0.039, 0.039, 0.012, 16]} />
                    <meshStandardMaterial
                        color={GOLD}
                        metalness={0.8}
                    />
                </mesh>
            </group>
        </RigidBody>
    );
}

function Slingshot({ side, onScore }) {
    const direction = side === "left" ? 1 : -1;
    const hit = ({ other }) => {
        if (other.rigidBodyObject?.name !== "liberty-ball") return;
        impulse(other.rigidBody, direction, -0.55, 0.24);
        onScore(25);
    };
    return (
        <>
            <Rail
                from={[-direction * 0.12, -0.35]}
                to={[direction * 0.23, 0.4]}
                color={WHITE}
                width={0.1}
                onHit={hit}
            />
            {/* <Box
                position={[-direction * 0.025, 0.21, 0]}
                rotation={[0, direction * 0.44, 0]}
                size={[0.23, 0.06, 0.72]}
                color={side === "left" ? RED : "#2469b8"}
            /> */}
            {/* <Star
                position={[0, 0.245, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.09}
            /> */}
        </>
    );
}

function Post({ color, onScore }) {
    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CylinderCollider
                args={[0.1, 0.068]}
                position={[0, 0.1, 0]}
                restitution={0.82}
                friction={0.04}
                onCollisionEnter={({ other }) => {
                    if (other.rigidBodyObject?.name === "liberty-ball")
                        onScore(15);
                }}
            />
            <mesh
                position={[0, 0.095, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.068, 0.082, 0.19, 18]} />
                <meshStandardMaterial
                    color="#d6e0e8"
                    metalness={0.82}
                    roughness={0.2}
                />
            </mesh>
            <mesh position={[0, 0.205, 0]}>
                <sphereGeometry args={[0.085, 16, 12]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.4}
                    roughness={0.25}
                />
            </mesh>
        </RigidBody>
    );
}

function GutterFlap({ side, flipped }) {
    const visual = useRef();
    const isLeft = side === "left";
    const flapWidth = 0.27;
    const pivotX = isLeft ? -flapWidth / 2 : flapWidth / 2;
    const startAngle = isLeft ? Math.PI : 0;
    const openAngle = (80 * Math.PI) / 180;
    const triggeredAngle = isLeft
        ? startAngle + openAngle
        : -openAngle;
    const angle = useRef(flipped ? triggeredAngle : startAngle);

    useFrame((_, dt) => {
        const target = flipped ? triggeredAngle : startAngle;
        angle.current += (target - angle.current) * Math.min(1, dt * 12);
        if (visual.current) visual.current.rotation.z = angle.current;
    });

    return (
        <RigidBody
            type="fixed"
            colliders={false}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
            {!flipped && (
                <CuboidCollider
                    args={[0.125, 0.025, 0.055]}
                    position={isLeft ? [-flapWidth, 0, 0] : [0, 0, 0]}
                    rotation={isLeft ? [0, 0, Math.PI] : [0, 0, 0]}
                    restitution={0.72}
                    friction={0.05}
                />
            )}
            <group
                ref={visual}
                position={[pivotX, 0, 0]}
                rotation={[0, 0, angle.current]}
            >
                <group position={[-pivotX, 0, 0]}>
                    <RoundedBox
                        args={[flapWidth, 0.055, 0.12]}
                        radius={0.025}
                        smoothness={2}
                        castShadow
                    >
                        <meshStandardMaterial
                            color={isLeft ? RED : "#2469b8"}
                            emissive={isLeft ? RED : "#2469b8"}
                            emissiveIntensity={flipped ? 0.12 : 0.5}
                            roughness={0.3}
                        />
                    </RoundedBox>
                    <Box
                        position={[0, 0.035, 0]}
                        size={[0.05, 0.02, 0.14]}
                        color={WHITE}
                    />
                </group>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.035, 0.035, 0.14, 18]} />
                    <meshStandardMaterial
                        color={GOLD}
                        metalness={0.82}
                        roughness={0.2}
                    />
                </mesh>
            </group>
        </RigidBody>
    );
}

function Plunger({ controls, charge, onLaunchPowerChange }) {
    const body = useRef();
    const phase = useRef("ready");
    const positionZ = useRef(PLUNGER_REST_Z);
    const strikeSpeed = useRef(MIN_CHAMBER_PLUNGER_SPEED);
    const previousLaunch = useRef(false);
    const previousReset = useRef(controls.current.reset);
    const reportedPower = useRef(-1);

    const reportPower = useCallback(
        (power, force = false) => {
            if (!force && Math.abs(power - reportedPower.current) < 0.02)
                return;
            reportedPower.current = power;
            onLaunchPowerChange?.(power);
        },
        [onLaunchPowerChange],
    );

    useFrame((_, dt) => {
        if (!body.current) return;
        const input = controls.current;

        if (input.reset !== previousReset.current) {
            previousReset.current = input.reset;
            phase.current = "ready";
            positionZ.current = PLUNGER_REST_Z;
            charge.current = 0;
            reportPower(0, true);
        }

        if (input.launch && phase.current !== "firing" && phase.current !== "returning") {
            phase.current = "charging";
            charge.current = Math.min(
                1,
                charge.current + dt / LAUNCH_CHARGE_SECONDS,
            );
            positionZ.current =
                PLUNGER_REST_Z + charge.current * PLUNGER_PULL_DISTANCE;
            reportPower(charge.current);
        }

        if (previousLaunch.current && !input.launch && phase.current === "charging") {
            if (charge.current <= LAUNCH_POWER_THRESHOLD) {
                const chamberPower = charge.current / LAUNCH_POWER_THRESHOLD;
                strikeSpeed.current =
                    MIN_CHAMBER_PLUNGER_SPEED +
                    (MAX_CHAMBER_PLUNGER_SPEED - MIN_CHAMBER_PLUNGER_SPEED) *
                        Math.pow(chamberPower, 1.08);
            } else {
                const armedPower =
                    (charge.current - LAUNCH_POWER_THRESHOLD) /
                    (1 - LAUNCH_POWER_THRESHOLD);
                strikeSpeed.current =
                    MIN_ARMED_PLUNGER_SPEED +
                    (MAX_ARMED_PLUNGER_SPEED - MIN_ARMED_PLUNGER_SPEED) *
                        Math.pow(armedPower, 1.12);
            }
            phase.current = "firing";
            charge.current = 0;
            reportPower(0, true);
        }

        if (phase.current === "firing") {
            positionZ.current = Math.max(
                PLUNGER_STRIKE_Z,
                positionZ.current - strikeSpeed.current * dt,
            );
            if (positionZ.current <= PLUNGER_STRIKE_Z + 0.0001) {
                phase.current = "returning";
            }
        } else if (phase.current === "returning") {
            positionZ.current = Math.min(
                PLUNGER_REST_Z,
                positionZ.current + 1.4 * dt,
            );
            if (positionZ.current >= PLUNGER_REST_Z - 0.0001) {
                phase.current = "ready";
            }
        }

        body.current.setNextKinematicTranslation(
            worldPoint(SHOOTER_LANE_CENTER_X, 0.12, positionZ.current),
        );
        previousLaunch.current = input.launch;
    });

    return (
        <>
            <RigidBody
                ref={body}
                name="physical-plunger"
                type="kinematicPosition"
                colliders={false}
                position={[SHOOTER_LANE_CENTER_X, 0.12, PLUNGER_REST_Z]}
            >
                <CuboidCollider
                    args={[0.09, 0.075, 0.055]}
                    restitution={0.12}
                    friction={0.08}
                />
                <RoundedBox
                    args={[0.18, 0.14, 0.11]}
                    radius={0.035}
                    smoothness={3}
                    castShadow
                >
                    <meshStandardMaterial color={RED} roughness={0.26} />
                </RoundedBox>
                <mesh position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.027, 0.027, 0.62, 16]} />
                    <meshStandardMaterial color="#d2e0ed" metalness={1} roughness={0.14} />
                </mesh>
                <mesh position={[0, 0, 0.64]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.115, 0.09, 0.1, 24]} />
                    <meshStandardMaterial color={RED} roughness={0.22} />
                </mesh>
            </RigidBody>

            <group position={[SHOOTER_LANE_CENTER_X, 0.12, 2.72]}>
                {Array.from({ length: 9 }, (_, i) => (
                    <mesh key={i} position={[0, 0, i * 0.026]}>
                        <torusGeometry args={[0.055, 0.01, 6, 16]} />
                        <meshStandardMaterial color="#b5bfcc" metalness={0.85} roughness={0.2} />
                    </mesh>
                ))}
            </group>
        </>
    );
}

function Ball({
    controls,
    onDrain,
    shooterDividerX = DEFAULT_SHOOTER_LANE_DIVIDER_X,
}) {
    const ball = useRef();
    const previousReset = useRef(controls.current.reset);
    const awaitingServe = useRef(false);
    const respawnAt = useRef(0);
    const spawn = useMemo(
        () => worldPoint(SHOOTER_LANE_CENTER_X, 0.12, 2.25),
        [],
    );
    const serve = useCallback(() => {
        ball.current.setTranslation(spawn, true);
        ball.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        ball.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        awaitingServe.current = false;
    }, [spawn]);
    useFrame((state, dt) => {
        if (!ball.current) return;
        const input = controls.current;
        if (input.reset !== previousReset.current) {
            previousReset.current = input.reset;
            serve();
        }
        const p = localPoint(ball.current.translation());
        if (
            !awaitingServe.current &&
            ((p.z > 2.42 && p.x < shooterDividerX) ||
                p.y < -0.8 ||
                Math.abs(p.x) > 2 ||
                Math.abs(p.z) > 3.4)
        ) {
            awaitingServe.current = true;
            respawnAt.current = state.clock.elapsedTime + 0.8;
            onDrain?.();
        }
        if (
            awaitingServe.current &&
            state.clock.elapsedTime >= respawnAt.current
        )
            serve();
    });
    return (
        <RigidBody
            ref={ball}
            name="liberty-ball"
            position={spawn.toArray()}
            colliders={false}
            ccd
            canSleep={false}
            linearDamping={0.075}
            angularDamping={0.12}
        >
            <BallCollider
                args={[0.09]}
                mass={0.08}
                restitution={0.38}
                friction={0.12}
            />
            <mesh castShadow>
                <sphereGeometry args={[0.09, 24, 24]} />
                <meshStandardMaterial
                    color="#e4ecf3"
                    metalness={1}
                    roughness={0.13}
                />
            </mesh>
        </RigidBody>
    );
}

function EditorTestBall({ id, position, onRemove }) {
    const body = useRef();
    const removed = useRef(false);
    const spawn = useMemo(
        () => worldPoint(position[0], position[1], position[2]),
        [position[0], position[1], position[2]],
    );

    useFrame(() => {
        if (!body.current || removed.current) return;
        const point = localPoint(body.current.translation());
        if (
            point.y < -0.8 ||
            Math.abs(point.x) > PLAYFIELD_HALF_WIDTH + 0.8 ||
            Math.abs(point.z) > PLAYFIELD_HALF_LENGTH + 0.8
        ) {
            removed.current = true;
            onRemove(id);
        }
    });

    return (
        <RigidBody
            ref={body}
            name="liberty-ball"
            position={spawn.toArray()}
            colliders={false}
            ccd
            canSleep={false}
            linearDamping={0.075}
            angularDamping={0.12}
        >
            <BallCollider
                args={[0.09]}
                mass={0.08}
                restitution={0.38}
                friction={0.12}
            />
            <mesh castShadow>
                <sphereGeometry args={[0.09, 24, 24]} />
                <meshStandardMaterial
                    color={GOLD}
                    emissive="#7a4e08"
                    emissiveIntensity={0.35}
                    metalness={0.9}
                    roughness={0.16}
                />
            </mesh>
        </RigidBody>
    );
}

function EditorBallSpawner({ editor }) {
    if (!editor?.enabled || !editor.spawnBallMode) return null;

    const spawn = (event) => {
        event.stopPropagation();
        const point = localPoint(event.point);
        editor.spawnTestBall([
            clampToPlayfield(point.x, PLAYFIELD_HALF_WIDTH),
            0.16,
            clampToPlayfield(point.z, PLAYFIELD_HALF_LENGTH),
        ]);
    };

    return (
        <mesh
            position={[0, 0.62, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerDown={spawn}
        >
            <planeGeometry args={[PLAYFIELD_WIDTH, PLAYFIELD_LENGTH]} />
            <meshBasicMaterial
                color="#55d7ff"
                transparent
                opacity={0.035}
                depthWrite={false}
            />
        </mesh>
    );
}

function EditableSceneObject({
    item,
    editor,
    controls,
    gutterFlapsFlipped,
    onScore,
    onToggleFlaps,
}) {
    if (item.type === "wall") {
        return (
            <EditableWall
                item={item}
                editor={editor}
            />
        );
    }

    let object = null;

    if (item.type === "liberty") {
        object = (
            <LibertyToy
                scenePosition={item.position}
                onToggle={onToggleFlaps}
                onScore={onScore}
            />
        );
    } else if (item.type === "bumper") {
        object = (
            <Bumper
                scenePosition={item.position}
                color={item.color}
                onScore={onScore}
            />
        );
    } else if (item.type === "post") {
        object = (
            <Post
                color={item.color}
                onScore={onScore}
            />
        );
    } else if (item.type === "slingshot") {
        object = (
            <Slingshot
                side={item.side}
                onScore={onScore}
            />
        );
    } else if (item.type === "gutterFlap") {
        object = (
            <GutterFlap
                side={item.side}
                flipped={gutterFlapsFlipped}
            />
        );
    } else if (item.type === "flipper") {
        object = (
            <Flipper
                side={item.side}
                controls={controls}
                sceneRotation={item.rotation}
                editorEnabled={editor?.enabled}
            />
        );
    } else if (item.type === "cornerTriangle") {
        object = (
            <CornerTriangle
                side={item.side}
                color={item.color}
            />
        );
    } else if (item.type === "topArch") {
        object = (
            <TopPlayfieldArch
                color={item.color}
                length={item.length}
                width={item.width}
            />
        );
    }

    if (!object) return null;
    return (
        <EditablePlacement
            item={item}
            editor={editor}
        >
            {object}
        </EditablePlacement>
    );
}

/** Render inside a Rapier Physics provider. Front of cabinet faces +Z. */
export default function PinballMachine({
    controls,
    onScore,
    onDrain,
    sceneObjects = SCENE_OBJECTS,
    editor,
    gutterFlapsFlipped = false,
    onToggleGutterFlaps,
    onLaunchPowerChange,
}) {
    const fallbackControls = useRef({
        left: false,
        right: false,
        launch: false,
        reset: 0,
    });
    const input = controls || fallbackControls;
    const charge = useRef(0);
    const playfieldArt = usePinballArtwork("playfield");
    const score = useCallback((points) => onScore?.(points), [onScore]);
    const toggleGutterFlaps = useCallback(
        () => onToggleGutterFlaps?.(),
        [onToggleGutterFlaps],
    );
    const shooterDividerX =
        sceneObjects.find((item) => item.id === "wall-shooter-divider")
            ?.position?.[0] ?? DEFAULT_SHOOTER_LANE_DIVIDER_X;

    return (
        <group>
            {/* Legs stay vertical while the cabinet and playfield share their authentic 6.5° rake. */}
            {[-1.24, 1.24].flatMap((x) =>
                [-2.35, 2.35].map((z) => {
                    const top = FIELD_Y - 0.55 - Math.sin(TILT) * z;
                    return (
                        <group key={`${x}-${z}`}>
                            <Box
                                position={[x, top / 2, z]}
                                size={[0.115, top, 0.115]}
                                color="#b8c6d3"
                                metalness={0.9}
                                roughness={0.22}
                            />
                            <mesh position={[x, 0.03, z]}>
                                <cylinderGeometry
                                    args={[0.12, 0.13, 0.06, 20]}
                                />
                                <meshStandardMaterial
                                    color="#2e3741"
                                    metalness={0.7}
                                />
                            </mesh>
                        </group>
                    );
                }),
            )}

            <Backbox />

            <group
                position={[0, FIELD_Y, 0]}
                rotation={[TILT, 0, 0]}
            >
                <Cabinet controls={input} />
                <RigidBody
                    type="fixed"
                    colliders={false}
                >
                    {/* Explicit wall colliders preserve the CSG cavity; a convex hull would seal it. */}
                    <CuboidCollider
                        args={[PLAYFIELD_HALF_WIDTH, 0.055, 2.49]}
                        position={[0, -0.055, -0.21]}
                        friction={0.11}
                        restitution={0.15}
                    />
                    <CuboidCollider
                        args={[0.16, 0.055, 0.27]}
                        position={[SHOOTER_LANE_CENTER_X, -0.055, 2.48]}
                        friction={0.1}
                    />
                    <CuboidCollider
                        args={[0.07, 0.24, 2.9]}
                        position={[-1.43, 0.03, 0]}
                        restitution={0.55}
                    />
                    <CuboidCollider
                        args={[0.07, 0.24, 2.9]}
                        position={[1.43, 0.03, 0]}
                        restitution={0.55}
                    />
                    <CuboidCollider
                        args={[PLAYFIELD_HALF_WIDTH, 0.24, 0.07]}
                        position={[0, 0.03, -PLAYFIELD_HALF_LENGTH - 0.03]}
                        restitution={0.55}
                    />
                    <CuboidCollider
                        args={[
                            PLAYFIELD_HALF_WIDTH,
                            0.025,
                            PLAYFIELD_HALF_LENGTH,
                        ]}
                        position={[0, 0.48, 0]}
                        restitution={0.05}
                    />
                    <mesh
                        position={[0, -0.018, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        receiveShadow
                    >
                        <planeGeometry
                            args={[PLAYFIELD_WIDTH, PLAYFIELD_LENGTH]}
                        />
                        <meshStandardMaterial
                            map={playfieldArt}
                            roughness={0.32}
                            metalness={0.08}
                        />
                    </mesh>
                </RigidBody>
                {sceneObjects.map((item) => (
                    <EditableSceneObject
                        key={item.id}
                        item={item}
                        editor={editor}
                        controls={input}
                        gutterFlapsFlipped={gutterFlapsFlipped}
                        onScore={score}
                        onToggleFlaps={toggleGutterFlaps}
                    />
                ))}
                {Array.from({ length: 5 }, (_, i) => (
                    <mesh
                        key={i}
                        position={[-0.13, 0.004, 0.05 + i * 0.25]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <circleGeometry args={[0.055, 20]} />
                        <meshStandardMaterial
                            color={i % 2 ? RED : GOLD}
                            emissive={i % 2 ? RED : GOLD}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                ))}
                <Box
                    position={[-0.2, 0.04, 2.59]}
                    size={[2.18, 0.1, 0.39]}
                    color={NAVY}
                />
                {[-0.8, -0.4, 0, 0.4].map((x) => (
                    <Star
                        key={x}
                        position={[x, 0.096, 2.6]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={0.09}
                    />
                ))}
                <Plunger
                    controls={input}
                    charge={charge}
                    onLaunchPowerChange={onLaunchPowerChange}
                />
                <EditorBallSpawner editor={editor} />
            </group>
            {!editor?.enabled && (
                <Ball
                    controls={input}
                    onDrain={onDrain}
                    shooterDividerX={shooterDividerX}
                />
            )}
            {editor?.enabled &&
                editor.testBalls.map((testBall) => (
                    <EditorTestBall
                        key={testBall.id}
                        id={testBall.id}
                        position={testBall.position}
                        onRemove={editor.removeTestBall}
                    />
                ))}
        </group>
    );
}
