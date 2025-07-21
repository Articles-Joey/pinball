import { useGLTF } from '@react-three/drei'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Pinball/H3H3/h3h3-button-standalone-audio.glb`

export function H3StandaloneAudioButton(props) {

    const { nodes, materials } = useGLTF(link)

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder.geometry}
                material={materials.Red}
                position={[0.024, 0.648, 0]}
                scale={[0.854, 0.11, 0.854]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cylinder002.geometry}
                material={materials['Unit Base']}
                position={[0.024, 0.481, 0]}
                scale={[0.601, 0.296, 0.601]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text002.geometry}
                material={nodes.Text002.material}
                position={[-0.214, 0.781, 0.115]}
                scale={0.701}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Text004.geometry}
                material={nodes.Text004.material}
                position={[-0.317, 0.781, 0.384]}
                scale={0.701}
            />
        </group>
    )

}

useGLTF.preload(link)
