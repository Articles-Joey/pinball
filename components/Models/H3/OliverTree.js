import React from 'react'
import { useGLTF } from '@react-three/drei'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Epcot/Store/Property Items/66cf52513adee4c852c793bd/7aa002c4-fb94-4b18-a313-6589f98dcb11.glb`

export function StoreModelH3H3OliverTree(props) {

    const { nodes, materials } = useGLTF(link)

    return (
        <group {...props} dispose={null} position={[-0.25, 1.2, -1.9]}>
          <group rotation={[-Math.PI / 2, 0, 0]} scale={0.002}>
            <group rotation={[Math.PI / 2, 0, 0]}>
              <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube002_Material003_0.geometry}
                material={materials['Material.003']}
                position={[141.629, -132.765, 960.087]}
                rotation={[-1.564, 0, 0.002]}
                scale={100}
              />
            </group>
          </group>
        </group>
      )

}

useGLTF.preload(link)
