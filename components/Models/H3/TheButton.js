import React from 'react'
import { useGLTF } from '@react-three/drei'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Epcot/Store/Property Items/66c4e6743adee4c852c79364/3fd1117f-6c6e-4fb6-a1d7-ae0024cd0bcd.glb`

export function StoreModelH3H3TheButton(props) {

    const { nodes, materials } = useGLTF(link)

    return (
        <group {...props} dispose={null} scale={0.5} position={[0, 0.25, 0]}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube.geometry}
                material={materials['Unit Base']}
                position={[0, 0, 0.384]}
                scale={[2.123, 0.441, 1.386]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder.geometry}
                material={materials.Red}
                position={[-1.145, 0.648, 0]}
                scale={[0.854, 0.11, 0.854]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder001.geometry}
                material={materials.Yellow}
                position={[1.135, 0.648, 0]}
                scale={[0.854, 0.11, 0.854]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text.geometry}
                material={nodes.Text.material}
                position={[-0.887, 0.445, 1.376]}
                scale={0.411}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder002.geometry}
                material={materials['Unit Base']}
                position={[-1.145, 0.481, 0]}
                scale={[0.601, 0.296, 0.601]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder003.geometry}
                material={materials['Unit Base']}
                position={[1.14, 0.481, 0]}
                scale={[0.601, 0.296, 0.601]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text001.geometry}
                material={materials.Red}
                position={[1.148, -0.293, 1.782]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.77}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text002.geometry}
                material={nodes.Text002.material}
                position={[-1.383, 0.781, 0.115]}
                scale={0.701}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text003.geometry}
                material={nodes.Text003.material}
                position={[0.937, 0.781, 0.115]}
                scale={0.701}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text004.geometry}
                material={nodes.Text004.material}
                position={[-1.486, 0.781, 0.384]}
                scale={0.701}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text005.geometry}
                material={nodes.Text005.material}
                position={[0.814, 0.781, 0.384]}
                scale={0.701}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane.geometry}
                material={materials.Red}
                position={[1.552, -0.324, 1.771]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[-0.445, -0.043, -0.012]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Plane001.geometry}
                material={materials.Green}
                position={[0.012, 0.441, 1.435]}
                scale={[-0.969, -0.047, -0.009]}
            />
        </group>
    )

}

useGLTF.preload(link)
