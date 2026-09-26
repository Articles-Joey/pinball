"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Preload } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import PinballMachine from "./PinballMachine";
import ScaleReference from "./ScaleReference";

function PlayerCamera({ editor }) {
    const camera = useThree((state) => state.camera);

    useEffect(() => {
        camera.position.set(0, 1.8, 7.4);
        camera.lookAt(0, 1.75, -0.4);
        camera.updateProjectionMatrix();
    }, [camera]);

    return (
        <OrbitControls
            target={[0, 1.75, -0.4]}
            enabled={!editor?.enabled}
            enablePan
            minDistance={2}
            maxDistance={35}
        />
    );
}

function KeyboardControls({ controls }) {
    useEffect(() => {
        const updateKey = (event, pressed) => {
            if (
                [
                    "ArrowLeft",
                    "ArrowRight",
                    "Space",
                    "KeyA",
                    "KeyD",
                    "KeyR",
                ].includes(event.code)
            ) {
                event.preventDefault();
            }

            if (event.code === "ArrowLeft" || event.code === "KeyA")
                controls.current.left = pressed;
            if (event.code === "ArrowRight" || event.code === "KeyD")
                controls.current.right = pressed;
            if (event.code === "Space") controls.current.launch = pressed;
            if (event.code === "KeyR" && pressed && !event.repeat)
                controls.current.reset += 1;
        };

        const onKeyDown = (event) => updateKey(event, true);
        const onKeyUp = (event) => updateKey(event, false);
        const releaseAll = () => {
            controls.current.left = false;
            controls.current.right = false;
            controls.current.launch = false;
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", releaseAll);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", releaseAll);
        };
    }, [controls]);

    return null;
}

export default function NewGameCanvas({
    controls,
    onScore,
    onDrain,
    sceneObjects,
    editor,
    physicsRevision,
    gutterFlapsFlipped,
    onToggleGutterFlaps,
    onLaunchPowerChange,
}) {
    return (
        <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [0, 1.8, 7.4], fov: 44, near: 0.1, far: 100 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            style={{ position: "absolute", inset: 0, touchAction: "none" }}
            onPointerMissed={() => editor?.enabled && editor.select(null)}
        >
            <color
                attach="background"
                args={["#030712"]}
            />
            <fog
                attach="fog"
                args={["#030712", 10, 23]}
            />

            <ambientLight intensity={0.55} />
            <hemisphereLight args={["#b9d7ff", "#111827", 1.4]} />
            <spotLight
                castShadow
                position={[4.5, 8, 6]}
                angle={0.48}
                penumbra={0.75}
                intensity={90}
                color="#fff5df"
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight
                position={[-4, 4, 1]}
                intensity={18}
                color="#2878ff"
                distance={10}
            />
            <pointLight
                position={[4, 3, -1]}
                intensity={14}
                color="#ef3340"
                distance={9}
            />

            <Suspense fallback={null}>
                <ScaleReference />
                <ScaleReference position={[2.12, 0, 2.62]} />
                <Physics
                    key={physicsRevision}
                    gravity={[0, -9.81, 0]}
                    timeStep="vary"
                    paused={editor?.enabled}
                >
                    <PinballMachine
                        controls={controls}
                        onScore={onScore}
                        onDrain={onDrain}
                        sceneObjects={sceneObjects}
                        editor={editor}
                        gutterFlapsFlipped={gutterFlapsFlipped}
                        onToggleGutterFlaps={onToggleGutterFlaps}
                        onLaunchPowerChange={onLaunchPowerChange}
                    />
                </Physics>

                <ContactShadows
                    position={[0, -0.04, -0.4]}
                    opacity={0.7}
                    scale={12}
                    blur={2.4}
                    far={8}
                    color="#00030c"
                />
                <Preload all />
            </Suspense>

            <KeyboardControls controls={controls} />
            <PlayerCamera editor={editor} />
        </Canvas>
    );
}
