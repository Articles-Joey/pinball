import * as THREE from "three"
import { forwardRef, memo, use, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, RoundedBox, Environment, useTexture, useAspect, OrbitControls, Sky } from "@react-three/drei"
import { Physics, useSphere, useBox, usePlane, useCompoundBody, useContactMaterial, Debug } from "@react-three/cannon"
import { usePinballGameStore } from "@/hooks/usePinballGameStore"

import { StoreModelH3H3SigmaBrain } from "@/components/Models/H3/SigmaBrain"

import { degToRad, lerp } from "three/src/math/MathUtils"
import { H3StandaloneAudioButton } from "@/components/Models/H3/StandaloneAudioButton"
import { H3StandaloneVideoButton } from "@/components/Models/H3/StandaloneVideoButton"
import { ModelKennyNLFoodBurgerCheeseDouble } from "@/components/Models/burger-cheese-double"
import { ModelJToastieBasicSpaceship } from "@/components/Models/Basic Spaceship"
import { StoreModelH3H3MeatMountain } from "@/components/Models/H3/MeatMountain"

import LowPolyPinballMachine from "@/components/Models/LowPolyPinballMachine"

import { useHotkeys } from 'react-hotkeys-hook';


const SLIDE_COUNT = 30;
const SLIDE_WIDTH = 2; // must match spacing in original code
const SLIDE_START = 0;
const SLIDE_END = SLIDE_WIDTH * SLIDE_COUNT;

function SlidingPinballMachines() {

    const [positions, setPositions] = useState(() => Array.from({ length: SLIDE_COUNT }, (_, i) => SLIDE_WIDTH * i));
    const groupRef = useRef();

    useFrame((_, delta) => {
        setPositions(prev => {
            // Move all positions left by speed*delta
            const speed = 1.5; // units per second
            let newPositions = prev.map(x => x - speed * delta);
            // If any go past left bound, recycle to right
            newPositions = newPositions.map(x => (x < -SLIDE_WIDTH ? x + SLIDE_END : x));
            return newPositions;
        });
    });

    return (
        <group ref={groupRef} position={[-2.5, -1, 0]}>
            {positions.map((x, i) => (
                <group key={i} position={[x, 0, 0]}>

                    <LowPolyPinballMachine
                        key={i}
                        scale={0.1}
                    />

                    <WallAndFloor />

                </group>
            ))}
        </group>
    );
}

function WallAndFloor() {

    const randomColorGameFloor = useMemo(() => {
        const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        return randomHex();
    }, []);

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/Assassin/wall-tile.webp`

    const texture = useTexture({
        map: `${base_link}`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    texture.map.repeat.set(15, 30);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    const randomLightColor = useMemo(() => {
        const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        return randomHex();
    }, []);

    return (
        <group>

            {/* Light */}
            <pointLight
                intensity={3}
                color={randomLightColor}
                position={[-2, 2, 0]}
            />

            {/* Floor */}
            <mesh
                rotation={[degToRad(-90), 0, 0]}
            >
                <planeGeometry args={[2, 10]} />
                <meshStandardMaterial color={randomColorGameFloor} />
            </mesh>

            {/* Wall */}
            <mesh
                rotation={[degToRad(0), 0, 0]}
                position={[0, 2.5, -3]}
            >
                <planeGeometry args={[2, 5]} />
                <meshStandardMaterial {...texture} />
                {/* <meshStandardMaterial color={randomColorGameFloor} /> */}
            </mesh>

        </group>
    )

}

const LandingSceneCanvas = () => {
    const [reloadableKey, setReloadableKey] = useState(0)

    useHotkeys('r', () => {
        setReloadableKey((prev) => prev + 1)
    })

    return (
        <Canvas
            key={reloadableKey}
            camera={{
                position: [-3, 1, 3],
                fov: 50,
            }}
        >
            <Sky
                {...{
                    sunPosition: [0, -0.5, 0],
                    turbidity: 20,
                    rayleigh: 0.1,
                    mieCoefficient: 0.05,
                    mieDirectionalG: 0.99,
                    inclination: 0.8,
                    azimuth: 0.25,
                    exposure: 0.2
                }}
            />

            <SlidingPinballMachines />
            {/* <LowPolyPinballMachine
                position={[0, -1, 0]}
                scale={0.1}
            /> */}

            <ambientLight intensity={0.1} />
            {/* <directionalLight position={[10, 10, 5]} intensity={10}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            /> */}

        </Canvas>
    )
}

export default memo(LandingSceneCanvas)