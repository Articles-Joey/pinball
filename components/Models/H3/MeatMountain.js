import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

import { Box3, Mesh, Vector3 } from 'three';

const link = `${process.env.NEXT_PUBLIC_CDN}games/Epcot/Store/Property Items/66c4e6743adee4c852c79363/dfd0ab5a-4f94-442e-942e-4d3844d458fc.glb`

export function StoreModelH3H3MeatMountain(props) {

    const { nodes, materials } = useGLTF(link)

    const boundingBox = useMemo(() => {
        const geometry = nodes.Cube_Material_Glass_0.geometry;
        const box = new Box3().setFromObject(new Mesh(geometry));
        const size = box.getSize(new Vector3());
        // props.setBoundingBox(size)
        return size;
    }, [nodes.Cube_Material_Glass_0.geometry]);

    const width = boundingBox.x;
    const height = boundingBox.y;
    const depth = boundingBox.z;

    return (
        <group {...props} dispose={null}>
            <group position={[0, -0.544, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.843]}>
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <group
                        position={[0.004, 0.471, 0.032]}
                        rotation={[0, -0.043, 0]}
                        scale={[0.169, 0.169, 0.145]}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_6001.geometry}
                            material={materials['Material.004']}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_7001.geometry}
                            material={materials['Material.009']}
                        />
                    </group>
                    <group
                        position={[0.002, 0.696, -0.05]}
                        rotation={[0, -0.043, 0]}
                        scale={[0.504, 0.504, 0.432]}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_19.geometry}
                            material={materials['Material.006']}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_20.geometry}
                            material={materials['Material.010']}
                        />
                    </group>
                    <group
                        position={[0.11, -0.144, -2.222]}
                        rotation={[0, -0.043, 0]}
                        scale={[0.504, 0.504, 0.432]}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_24.geometry}
                            material={materials['Material.003']}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_25.geometry}
                            material={materials['Material.011']}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Object_26.geometry}
                            material={materials['Material.012']}
                        />
                    </group>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_11.geometry}
                        material={materials['Material.013']}
                        position={[0.197, 0.522, 0.057]}
                        rotation={[-0.016, -0.154, -0.08]}
                        scale={[0.459, 0.316, 0.396]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_13.geometry}
                        material={materials['Material.013']}
                        position={[0.196, 0.473, 0.077]}
                        rotation={[-0.066, -0.199, -0.081]}
                        scale={[0.458, 0.316, 0.398]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_9001.geometry}
                        material={materials['Material.013']}
                        position={[0.189, 0.186, -0.059]}
                        rotation={[0, -0.043, 0]}
                        scale={[0.46, 0.316, 0.395]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_4.geometry}
                        material={materials['Material.006']}
                        position={[0, 0, -0.032]}
                        scale={[1, 1, 0.857]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_15.geometry}
                        material={materials['Material.002']}
                        position={[-0.011, 0.227, -0.074]}
                        rotation={[0, 0.196, 0]}
                        scale={[0.501, 0.504, 0.435]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_17.geometry}
                        material={materials['Material.008']}
                        position={[0.112, 0.833, -0.074]}
                        rotation={[0, -0.043, 0]}
                        scale={[0.504, 0.504, 0.432]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Object_22.geometry}
                        material={materials['Material.005']}
                        position={[0.169, 0.492, -0.093]}
                        rotation={[0, -0.043, 0]}
                        scale={[0.504, 0.504, 0.432]}
                    />
                </group>
            </group>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube001.geometry}
                material={materials['Material.010']}
                position={[0, -0.346, 0]}
                scale={1.095}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube002.geometry}
                material={materials['Material.003']}
                position={[0, -0.719, 1.107]}
                scale={[0.598, 0.598, 0.027]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube003.geometry}
                material={materials.Black}
                position={[0, -0.338, 0]}
                scale={1.026}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text.geometry}
                material={materials.Black}
                position={[-0.501, -1.155, 1.134]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.111}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text001.geometry}
                material={materials.Black}
                position={[-0.257, -1.262, 1.134]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.111}
            />
            <group scale={0.01}>
                <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Cube_Material_Glass_0.geometry}
                        material={materials.Material_Glass}
                        position={[0, 0, -0.261]}
                        scale={[1, 1, 0.707]}
                    />
                </group>
            </group>
        </group>
    )

}

useGLTF.preload(link)
