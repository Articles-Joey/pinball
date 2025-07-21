import React from 'react'
import { useGLTF } from '@react-three/drei'

import { useGraph } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Epcot/Store/Property Items/66cf7622d540c9c70e00bced/c4cb6644-a12b-4f15-bf38-14fe563ec17c.glb`

export function StoreModelH3H3VapeNationWithWatch(props) {

    const { scene } = useGLTF(link)
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { nodes, materials } = useGraph(clone)

    return (
        <group {...props} dispose={null}>
            <primitive object={nodes.Bone} />
            <primitive object={nodes.Bone_1} />
            <primitive object={nodes.Bone_2} />
            <primitive object={nodes.Bone_3} />
            <mesh geometry={nodes.Cylinder.geometry} material={materials.PaletteMaterial001} position={[-0.106, 1.242, -3.035]} scale={[1.798, 0.324, 1.585]} />
            <skinnedMesh geometry={nodes.mesh004.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh004.skeleton} position={[-3.067, 5.94, -0.054]} rotation={[1.114, 0.052, 2.895]} />
            <skinnedMesh geometry={nodes.mesh005.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh005.skeleton} position={[-3.067, 5.94, -0.054]} rotation={[1.114, 0.052, 2.895]} />
            <skinnedMesh geometry={nodes.mesh006.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh006.skeleton} position={[-3.067, 5.94, -0.054]} rotation={[1.114, 0.052, 2.895]} />
            <skinnedMesh geometry={nodes.mesh007.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh007.skeleton} position={[-3.067, 5.94, -0.054]} rotation={[1.114, 0.052, 2.895]} />
            <skinnedMesh geometry={nodes.mesh.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh.skeleton} position={[0, 5.575, 0]} rotation={[-1.095, 0.013, -0.118]} />
            <skinnedMesh geometry={nodes.mesh001.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh001.skeleton} position={[0, 5.575, 0]} rotation={[-1.095, 0.013, -0.118]} />
            <skinnedMesh geometry={nodes.mesh002.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh002.skeleton} position={[0, 5.575, 0]} rotation={[-1.095, 0.013, -0.118]} />
            <skinnedMesh geometry={nodes.mesh003.geometry} material={materials.PaletteMaterial001} skeleton={nodes.mesh003.skeleton} position={[0, 5.575, 0]} rotation={[-1.095, 0.013, -0.118]} />
        </group>
    )

    // const { nodes, materials } = useGLTF(link)

    // return (
    //     <group {...props} dispose={null}>
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder.geometry}
    //             material={materials['Material.002']}
    //             position={[-0.106, 1.242, -3.035]}
    //             scale={[1.798, 0.324, 1.585]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder001.geometry}
    //             material={materials['Material.003']}
    //             position={[-0.454, 1.199, -2.398]}
    //             scale={[2.072, 0.373, 1.826]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder002.geometry}
    //             material={materials['Material.001']}
    //             position={[0.03, 1.009, -4.642]}
    //             scale={[1.807, 0.326, 1.593]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder003.geometry}
    //             material={materials['Material #46.002']}
    //             position={[-0.106, 1.242, -3.035]}
    //             scale={[1.809, 0.326, 1.595]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder004.geometry}
    //             material={materials['Material.004']}
    //             position={[-3.393, 10.321, -3.003]}
    //             rotation={[0.016, 0.144, 3.14]}
    //             scale={[1.798, 0.324, 1.585]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder005.geometry}
    //             material={materials['Material.005']}
    //             position={[-2.518, 10.266, -2.029]}
    //             rotation={[0.016, 0.144, 3.14]}
    //             scale={[2.477, 0.446, 2.183]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder006.geometry}
    //             material={materials['Material.006']}
    //             position={[-3.489, 10.538, -4.6]}
    //             rotation={[0.016, 0.144, 3.14]}
    //             scale={[2.161, 0.389, 1.904]}
    //         />
    //         <mesh
    //             castShadow
    //             receiveShadow
    //             geometry={nodes.Cylinder007.geometry}
    //             material={materials['Material #46.001']}
    //             position={[-3.393, 10.321, -3.003]}
    //             rotation={[0.016, 0.144, 3.14]}
    //             scale={[1.809, 0.326, 1.595]}
    //         />
    //         <group position={[-3.067, 5.94, -0.054]} rotation={[1.114, 0.052, 2.895]}>
    //             <skinnedMesh
    //                 geometry={nodes.mesh004.geometry}
    //                 material={materials['Material #46.003']}
    //                 skeleton={nodes.mesh004.skeleton}
    //             />
    //             <skinnedMesh
    //                 geometry={nodes.mesh005.geometry}
    //                 material={materials['Material #46.003']}
    //                 skeleton={nodes.mesh005.skeleton}
    //             />
    //             <primitive object={nodes.Bone} />
    //         </group>
    //         <group position={[-3.067, 5.94, -0.054]} rotation={[1.114, 0.052, 2.895]}>
    //             <skinnedMesh
    //                 geometry={nodes.mesh006.geometry}
    //                 material={materials['Material #46.003']}
    //                 skeleton={nodes.mesh006.skeleton}
    //             />
    //             <skinnedMesh
    //                 geometry={nodes.mesh007.geometry}
    //                 material={materials['Material #46.003']}
    //                 skeleton={nodes.mesh007.skeleton}
    //             />
    //             <primitive object={nodes.Bone_1} />
    //         </group>
    //         <group position={[0, 5.575, 0]} rotation={[-1.095, 0.013, -0.118]}>
    //             <skinnedMesh
    //                 geometry={nodes.mesh.geometry}
    //                 material={materials['Material #46']}
    //                 skeleton={nodes.mesh.skeleton}
    //             />
    //             <skinnedMesh
    //                 geometry={nodes.mesh001.geometry}
    //                 material={materials['Material #46']}
    //                 skeleton={nodes.mesh001.skeleton}
    //             />
    //             <primitive object={nodes.Bone_2} />
    //         </group>
    //         <group position={[0, 5.575, 0]} rotation={[-1.095, 0.013, -0.118]}>
    //             <skinnedMesh
    //                 geometry={nodes.mesh002.geometry}
    //                 material={materials['Material #46']}
    //                 skeleton={nodes.mesh002.skeleton}
    //             />
    //             <skinnedMesh
    //                 geometry={nodes.mesh003.geometry}
    //                 material={materials['Material #46']}
    //                 skeleton={nodes.mesh003.skeleton}
    //             />
    //             <primitive object={nodes.Bone_3} />
    //         </group>
    //     </group>
    // )

}

useGLTF.preload(link)
