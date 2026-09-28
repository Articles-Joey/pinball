"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import SceneEditor from "./SceneEditor";
import { SCENE_OBJECTS } from "./sceneLayout";
import Link from "next/link";

const NewGameCanvas = dynamic(() => import("./NewGameCanvas"), { ssr: false });

const controlButtonSx = {
    minWidth: { xs: 92, sm: 124 },
    minHeight: { xs: 54, sm: 60 },
    border: "1px solid rgba(255,255,255,.3)",
    borderRadius: 2,
    color: "white",
    fontWeight: 900,
    letterSpacing: ".08em",
    backdropFilter: "blur(12px)",
    background:
        "linear-gradient(180deg, rgba(25,55,104,.9), rgba(7,19,42,.92))",
    boxShadow: "0 10px 30px rgba(0,0,0,.36)",
    touchAction: "none",
    userSelect: "none",
    "&:hover": {
        background:
            "linear-gradient(180deg, rgba(36,78,145,.95), rgba(10,28,61,.96))",
    },
    "&:active": { transform: "translateY(2px)", background: "#b31942" },
};

const LEFT_GUTTER_VISUAL_Z_OFFSET = 0.27;

export default function NewGameExperience() {
    const controls = useRef({
        left: false,
        right: false,
        launch: false,
        reset: 0,
    });
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [balls, setBalls] = useState(3);
    const [sceneObjects, setSceneObjects] = useState(() =>
        JSON.parse(JSON.stringify(SCENE_OBJECTS)),
    );
    const [editorEnabled, setEditorEnabled] = useState(false);
    const [selectedId, setSelectedId] = useState(SCENE_OBJECTS[0]?.id || null);
    const [draggingId, setDraggingId] = useState(null);
    const [physicsRevision, setPhysicsRevision] = useState(0);
    const [gutterFlapsFlipped, setGutterFlapsFlipped] = useState(false);
    const [launchPower, setLaunchPower] = useState(0);
    const [spawnBallMode, setSpawnBallMode] = useState(false);
    const [testBalls, setTestBalls] = useState([]);
    const testBallId = useRef(0);
    const savedSceneObjects = useRef(
        JSON.parse(JSON.stringify(SCENE_OBJECTS)),
    );

    const setControl = useCallback((name, pressed) => {
        controls.current[name] = pressed;
    }, []);
    const handleScore = useCallback(
        (points) => setScore((current) => current + points),
        [],
    );
    const handleDrain = useCallback(
        () => setBalls((current) => Math.max(0, current - 1)),
        [],
    );
    const toggleGutterFlaps = useCallback(() => {
        setGutterFlapsFlipped((flipped) => !flipped);
    }, []);
    const resetGame = useCallback(() => {
        controls.current.reset += 1;
        setScore(0);
        setBalls(3);
        setHighScore(0);
        setGutterFlapsFlipped(false);
        setLaunchPower(0);
    }, []);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
        }
    }, [score, highScore]);

    const updateSceneObject = useCallback((id, patch) => {
        setSceneObjects((current) => {
            const target = current.find((object) => object.id === id);
            if (target?.type === "gutterFlap" && patch.position) {
                const sharedVisualZ =
                    target.side === "left"
                        ? patch.position[2] + LEFT_GUTTER_VISUAL_Z_OFFSET
                        : patch.position[2];

                return current.map((object) => {
                    if (object.type !== "gutterFlap")
                        return object.id === id
                            ? { ...object, ...patch }
                            : object;

                    const nextZ =
                        object.side === "left"
                            ? sharedVisualZ - LEFT_GUTTER_VISUAL_Z_OFFSET
                            : sharedVisualZ;
                    if (object.id === id) {
                        return {
                            ...object,
                            ...patch,
                            position: [
                                patch.position[0],
                                patch.position[1],
                                nextZ,
                            ],
                        };
                    }
                    return {
                        ...object,
                        position: [
                            object.position[0],
                            object.position[1],
                            nextZ,
                        ],
                    };
                });
            }

            return current.map((object) =>
                object.id === id ? { ...object, ...patch } : object,
            );
        });
    }, []);

    const selectEditorObject = useCallback((id) => {
        setSelectedId(id || null);
        if (id) setSpawnBallMode(false);
    }, []);

    const changeSpawnBallMode = useCallback((enabled) => {
        setSpawnBallMode(enabled);
        if (enabled) setSelectedId(null);
    }, []);

    const spawnTestBall = useCallback((position) => {
        const id = `editor-ball-${++testBallId.current}`;
        setTestBalls((current) => [
            ...current.slice(-15),
            { id, position },
        ]);
    }, []);

    const removeTestBall = useCallback((id) => {
        setTestBalls((current) =>
            current.filter((testBall) => testBall.id !== id),
        );
    }, []);

    const clearTestBalls = useCallback(() => {
        setTestBalls([]);
    }, []);

    const rememberSavedLayout = useCallback((objects) => {
        savedSceneObjects.current = JSON.parse(JSON.stringify(objects));
    }, []);

    const resetSceneObjectPosition = useCallback((id) => {
        const savedObject = savedSceneObjects.current.find(
            (object) => object.id === id,
        );
        if (!savedObject) return;

        setDraggingId(null);
        setSceneObjects((current) =>
            current.map((object) => {
                if (savedObject.type === "gutterFlap") {
                    if (object.type !== "gutterFlap") return object;
                    const savedGutter = savedSceneObjects.current.find(
                        (candidate) =>
                            candidate.type === "gutterFlap" &&
                            candidate.side === object.side,
                    );
                    return savedGutter
                        ? {
                              ...object,
                              position: [...savedGutter.position],
                          }
                        : object;
                }
                return object.id === id
                    ? { ...object, position: [...savedObject.position] }
                    : object;
            }),
        );
        setPhysicsRevision((revision) => revision + 1);
    }, []);

    const finishEditorDrag = useCallback(() => {
        setDraggingId(null);
        if (testBalls.length)
            setPhysicsRevision((revision) => revision + 1);
    }, [testBalls.length]);

    const runLogicTrigger = useCallback(
        (object) => {
            if (!object?.logic) return;
            setSelectedId(object.id);
            if (
                object.logic.trigger === "toggle" &&
                object.logic.targets.some((target) =>
                    target.startsWith("gutter-flap-"),
                )
            ) {
                toggleGutterFlaps();
            }
        },
        [toggleGutterFlaps],
    );

    const toggleEditor = useCallback(() => {
        if (editorEnabled) {
            setDraggingId(null);
            setSpawnBallMode(false);
            setTestBalls([]);
            setPhysicsRevision((revision) => revision + 1);
        } else {
            setSelectedId(null);
            setSpawnBallMode(false);
        }
        controls.current.left = false;
        controls.current.right = false;
        controls.current.launch = false;
        setEditorEnabled(!editorEnabled);
    }, [editorEnabled]);

    const editor = useMemo(() => {
        const selected = sceneObjects.find(
            (object) => object.id === selectedId,
        );
        return {
            enabled: editorEnabled,
            selectedId,
            draggingId,
            spawnBallMode,
            physicsTesting: editorEnabled && testBalls.length > 0,
            testBalls,
            linkedIds: selected?.logic?.targets || [],
            select: selectEditorObject,
            beginDrag: setDraggingId,
            endDrag: finishEditorDrag,
            updateObject: updateSceneObject,
            runTrigger: runLogicTrigger,
            setSpawnBallMode: changeSpawnBallMode,
            spawnTestBall,
            removeTestBall,
        };
    }, [
        changeSpawnBallMode,
        draggingId,
        editorEnabled,
        finishEditorDrag,
        removeTestBall,
        runLogicTrigger,
        sceneObjects,
        selectedId,
        selectEditorObject,
        spawnBallMode,
        spawnTestBall,
        testBalls,
        updateSceneObject,
    ]);

    const holdProps = (control) => ({
        onPointerDown: (event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setControl(control, true);
        },
        onPointerUp: (event) => {
            event.currentTarget.releasePointerCapture?.(event.pointerId);
            setControl(control, false);
        },
        onPointerCancel: () => setControl(control, false),
        onContextMenu: (event) => event.preventDefault(),
    });

    return (
        <Box
            component="main"
            sx={{
                position: "relative",
                width: "100vw",
                height: "100dvh",
                minHeight: 560,
                overflow: "hidden",
                bgcolor: "#030712",
            }}
        >
            <NewGameCanvas
                controls={controls}
                onScore={handleScore}
                onDrain={handleDrain}
                sceneObjects={sceneObjects}
                editor={editor}
                physicsRevision={physicsRevision}
                gutterFlapsFlipped={gutterFlapsFlipped}
                onToggleGutterFlaps={toggleGutterFlaps}
                onLaunchPowerChange={setLaunchPower}
            />

            <SceneEditor
                enabled={editorEnabled}
                objects={sceneObjects}
                selectedId={selectedId}
                onToggle={toggleEditor}
                onSelect={selectEditorObject}
                onUpdate={updateSceneObject}
                onRunTrigger={runLogicTrigger}
                onResetPosition={resetSceneObjectPosition}
                onSaved={rememberSavedLayout}
                spawnBallMode={spawnBallMode}
                testBallCount={testBalls.length}
                onSpawnBallModeChange={changeSpawnBallMode}
                onClearTestBalls={clearTestBalls}
            />

            <Stack
                direction="row"
                spacing={2}
                sx={{
                    position: "absolute",
                    inset: { xs: 12, sm: 20, md: 28 },
                    // bottom: "auto",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    pointerEvents: "none",
                }}
            >
                <Box
                    sx={{
                        textShadow: "0 2px 16px #000",
                        pointerEvents: "initial",
                    }}
                >
                    <Box>
                        <Link href="/">
                            <Typography
                                variant="overline"
                                sx={{
                                    color: "#ef3340",
                                    fontWeight: 900,
                                    letterSpacing: ".2em",
                                    mr: 2,
                                }}
                            >
                                Go Back
                            </Typography>
                        </Link>
                        <Typography
                            variant="overline"
                            sx={{
                                color: "#ef3340",
                                fontWeight: 900,
                                letterSpacing: ".2em",
                            }}
                        >
                            Liberty Arcade
                        </Typography>
                    </Box>

                    <Typography
                        component="h1"
                        sx={{
                            mt: -0.5,
                            color: "white",
                            fontSize: { xs: "1.15rem", sm: "1.65rem" },
                            fontWeight: 900,
                            letterSpacing: ".04em",
                        }}
                    >
                        STARS &amp; STRIPES PINBALL
                    </Typography>
                </Box>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ alignItems: "flex-end" }}
                >
                    <Chip
                        label={`High Score ${highScore.toLocaleString("en-US")}`}
                        sx={{
                            color: "#fff",
                            // bgcolor: "rgba(7,19,42,.82)",
                            bgcolor: "rgba(179,25,66,.82)",
                            border: "1px solid rgba(255,255,255,.25)",
                            fontWeight: 900,
                            backdropFilter: "blur(10px)",
                        }}
                    />

                    <Chip
                        label={`Score ${score.toLocaleString("en-US")}`}
                        sx={{
                            color: "#000000",
                            bgcolor: "rgba(255, 255, 255, 0.82)",
                            border: "1px solid rgba(255,255,255,.25)",
                            fontWeight: 900,
                            backdropFilter: "blur(10px)",
                        }}
                    />

                    <Chip
                        label={`Balls ${balls}`}
                        sx={{
                            color: balls ? "#fff" : "#ffb4b4",
                            bgcolor: "rgba(25, 35, 179, 0.82)",
                            border: "1px solid rgba(255,255,255,.25)",
                            fontWeight: 900,
                            backdropFilter: "blur(10px)",
                        }}
                    />
                </Stack>
            </Stack>

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    position: "absolute",
                    left: { xs: 10, sm: 20 },
                    right: { xs: 10, sm: 20 },
                    bottom: { xs: 10, sm: 18 },
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    pointerEvents: "none",
                    display: editorEnabled ? "none" : "flex",
                }}
            >
                <Button
                    {...holdProps("left")}
                    sx={{ ...controlButtonSx, pointerEvents: "auto" }}
                >
                    Left
                </Button>

                <Stack
                    spacing={1}
                    sx={{ alignItems: "center", pointerEvents: "auto" }}
                >
                    <Box
                        sx={{
                            width: { xs: 112, sm: 150 },
                            px: 1,
                            py: 0.75,
                            borderRadius: 1.5,
                            border: "1px solid rgba(255,255,255,.22)",
                            bgcolor: "rgba(3,10,24,.78)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 0.5,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255,255,255,.7)",
                                    fontWeight: 800,
                                }}
                            >
                                LAUNCH POWER
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: "white", fontWeight: 900 }}
                            >
                                {Math.round(launchPower * 100)}%
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                position: "relative",
                                height: 7,
                                overflow: "hidden",
                                borderRadius: 999,
                                bgcolor: "rgba(255,255,255,.14)",
                            }}
                        >
                            <Box
                                sx={{
                                    width: `${launchPower * 100}%`,
                                    height: "100%",
                                    borderRadius: "inherit",
                                    background:
                                        "linear-gradient(90deg, #2469b8 0%, #fff1d2 52%, #cf2d42 100%)",
                                    transition: "width 40ms linear",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    left: "20%",
                                    width: 2,
                                    bgcolor: "#fff",
                                    boxShadow: "0 0 5px rgba(255,255,255,.9)",
                                }}
                            />
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mt: 0.35,
                                color:
                                    launchPower > 0.2
                                        ? "#8ff0ad"
                                        : "rgba(255,255,255,.52)",
                                fontSize: ".62rem",
                                fontWeight: 900,
                            }}
                        >
                            {launchPower === 0
                                ? "HOLD TO CHARGE"
                                : launchPower > 0.2
                                  ? "ARMED"
                                  : "LOW POWER · RETURNS"}
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<RestartAltRoundedIcon />}
                        onClick={resetGame}
                        sx={{
                            color: "rgba(255,255,255,.8)",
                            bgcolor: "rgba(0,0,0,.34)",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        New ball
                    </Button>
                    <Button
                        {...holdProps("launch")}
                        startIcon={<RocketLaunchRoundedIcon />}
                        sx={{
                            ...controlButtonSx,
                            minWidth: { xs: 112, sm: 150 },
                            background:
                                "linear-gradient(180deg, rgba(190,35,67,.95), rgba(108,9,30,.96))",
                            pointerEvents: "auto",
                        }}
                    >
                        Hold / Launch
                    </Button>
                </Stack>

                <Button
                    {...holdProps("right")}
                    sx={{ ...controlButtonSx, pointerEvents: "auto" }}
                >
                    Right
                </Button>
            </Stack>

            <Typography
                variant="caption"
                sx={{
                    display: editorEnabled
                        ? "none"
                        : { xs: "none", md: "block" },
                    position: "absolute",
                    left: "50%",
                    bottom: 185,
                    transform: "translateX(-50%)",
                    color: "rgba(255,255,255,.65)",
                    letterSpacing: ".08em",
                    textShadow: "0 2px 8px #000",
                    pointerEvents: "none",
                }}
            >
                A / D or ← / → to flip · hold Space, then release to launch · R
                to reset
            </Typography>
        </Box>
    );
}
