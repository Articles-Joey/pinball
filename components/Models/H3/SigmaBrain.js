import React from 'react'
import { useGLTF } from '@react-three/drei'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Epcot/Store/Property Items/66c4e6743adee4c852c79365/8f7d5ff3-28ca-45bf-a0fb-05e580c59bc8.glb`

export function StoreModelH3H3SigmaBrain(props) {

    const { nodes, materials } = useGLTF(link)

    return (
        <group {...props} dispose={null}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes._tubs_caffeine_free__tubs_gametub_backup.geometry}
            material={materials['lambert5.001']}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.2}
          />
        </group>
      )

}

useGLTF.preload(link)
