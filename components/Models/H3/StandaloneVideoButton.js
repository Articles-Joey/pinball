import { useGLTF } from '@react-three/drei'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Pinball/H3H3/h3h3-button-standalone-video.glb`

export function H3StandaloneVideoButton(props) {

    const { nodes, materials } = useGLTF(link)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder001.geometry}
                material={materials.Yellow}
                position={[0.014, 0.648, 0]}
                scale={[0.854, 0.11, 0.854]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder003.geometry}
                material={materials['Unit Base']}
                position={[0.018, 0.481, 0]}
                scale={[0.601, 0.296, 0.601]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text003.geometry}
                material={nodes.Text003.material}
                position={[-0.185, 0.781, 0.115]}
                scale={0.701}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text005.geometry}
                material={nodes.Text005.material}
                position={[-0.308, 0.781, 0.384]}
                scale={0.701}
            />
        </group>
    )

}

useGLTF.preload(link)
