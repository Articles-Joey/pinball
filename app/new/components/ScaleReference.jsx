"use client";

import { useEffect, useRef } from "react";
import { ModelSciFiWoman } from "@/components/Models/SciFi";

export default function ScaleReference({
    position = [-2.12, 0, 2.62],
    scale = 2,
}) {
    const group = useRef();

    useEffect(() => {
        group.current?.traverse((object) => {
            if (!object.isMesh && !object.isSkinnedMesh) return;
            object.castShadow = true;
            object.receiveShadow = true;
        });
    }, []);

    return (
        <group
            ref={group}
            name="human-scale-reference"
            position={position}
            scale={scale}
        >
            <ModelSciFiWoman />
            <mesh
                position={[0, 0.008, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <ringGeometry args={[0.31, 0.36, 40]} />
                <meshStandardMaterial
                    color="#55d7ff"
                    emissive="#1a7da0"
                    emissiveIntensity={0.8}
                    roughness={0.35}
                />
            </mesh>
        </group>
    );
}
