import React, { useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'

const link = `${process.env.NEXT_PUBLIC_CDN}games/Epcot/Store/Property Items/66c4e6743adee4c852c79362/194d3bab-0611-4391-99e9-18f299e5fd71.glb`

export function StoreModelH3H3JimmieLee(props) {

    const group = React.useRef()
    const { scene, animations } = useGLTF(link)
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { nodes, materials } = useGraph(clone)
    const { actions } = useAnimations(animations, group)
    return (
        <group ref={group} {...props} dispose={null} scale={0.63}>
            <group name="Scene">
                <group name="CharacterArmature">
                    <primitive object={nodes.Root} />
                </group>
                <group name="King_Body">
                    <skinnedMesh name="Cube043" geometry={nodes.Cube043.geometry} material={materials.PaletteMaterial001} skeleton={nodes.Cube043.skeleton} />
                    <skinnedMesh name="Cube043_1" geometry={nodes.Cube043_1.geometry} material={materials.PaletteMaterial001} skeleton={nodes.Cube043_1.skeleton} />
                </group>
                <skinnedMesh name="King_Feet" geometry={nodes.King_Feet.geometry} material={materials.PaletteMaterial001} skeleton={nodes.King_Feet.skeleton} />
                <group name="King_Head">
                    <skinnedMesh name="Cube025" geometry={nodes.Cube025.geometry} material={materials.PaletteMaterial001} skeleton={nodes.Cube025.skeleton} />
                    <skinnedMesh name="Cube025_1" geometry={nodes.Cube025_1.geometry} material={materials.PaletteMaterial001} skeleton={nodes.Cube025_1.skeleton} />
                    <skinnedMesh name="Cube025_2" geometry={nodes.Cube025_2.geometry} material={materials.PaletteMaterial001} skeleton={nodes.Cube025_2.skeleton} />
                </group>
                <skinnedMesh name="King_Legs" geometry={nodes.King_Legs.geometry} material={materials.PaletteMaterial001} skeleton={nodes.King_Legs.skeleton} />
            </group>
        </group>
    )

    // const group = useRef()
    // const { nodes, materials, animations } = useGLTF(link)
    // const { actions } = useAnimations(animations, group)

    // return (
    //     <group ref={group} {...props} dispose={null} scale={0.63}>
    //         <group name="Scene">
    //             <group name="CharacterArmature">
    //                 <group name="King_Body">
    //                     <skinnedMesh
    //                         name="Cube043"
    //                         geometry={nodes.Cube043.geometry}
    //                         material={materials.Skin}
    //                         skeleton={nodes.Cube043.skeleton}
    //                     />
    //                     <skinnedMesh
    //                         name="Cube043_1"
    //                         geometry={nodes.Cube043_1.geometry}
    //                         material={materials.Blue}
    //                         skeleton={nodes.Cube043_1.skeleton}
    //                     />
    //                 </group>
    //                 <skinnedMesh
    //                     name="King_Feet"
    //                     geometry={nodes.King_Feet.geometry}
    //                     material={materials.Hair_White}
    //                     skeleton={nodes.King_Feet.skeleton}
    //                 />
    //                 <group name="King_Head">
    //                     <skinnedMesh
    //                         name="Cube025"
    //                         geometry={nodes.Cube025.geometry}
    //                         material={materials.Skin}
    //                         skeleton={nodes.Cube025.skeleton}
    //                     />
    //                     <skinnedMesh
    //                         name="Cube025_1"
    //                         geometry={nodes.Cube025_1.geometry}
    //                         material={materials.Hair_White}
    //                         skeleton={nodes.Cube025_1.skeleton}
    //                     />
    //                     <skinnedMesh
    //                         name="Cube025_2"
    //                         geometry={nodes.Cube025_2.geometry}
    //                         material={materials.Eye}
    //                         skeleton={nodes.Cube025_2.skeleton}
    //                     />
    //                 </group>
    //                 <skinnedMesh
    //                     name="King_Legs"
    //                     geometry={nodes.King_Legs.geometry}
    //                     material={materials.DarkBrown}
    //                     skeleton={nodes.King_Legs.skeleton}
    //                 />
    //                 <primitive object={nodes.Root} />
    //             </group>
    //         </group>
    //     </group>
    // )

}

useGLTF.preload(link)
