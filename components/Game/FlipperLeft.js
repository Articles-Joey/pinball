import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useCompoundBody } from "@react-three/cannon"
import { usePinballGameStore } from "@/hooks/usePinballGameStore"
import { degToRad, lerp } from "three/src/math/MathUtils"

export function FlipperLeft({ position, keyboard }) {

    const {
        leftPaddle
    } = usePinballGameStore()

    const cylinderArgs = [0.25, 0.25, 1]
    const boxArgs = [2, 0.5, 0.25]
    const [ref, { rotation }] = useCompoundBody(
        () => ({
            mass: 0,
            position,
            rotation: [degToRad(90), 0, 0],
            shapes: [
                { args: cylinderArgs, type: 'Cylinder' },
                { args: boxArgs, position: [1, 0, 0], type: 'Box' }
            ]
        }),
        useRef()
    )
    const targetRotation = useRef()
    useEffect(() => {
        const unsubscribe = rotation.subscribe((v) => {
            rotation.set(v[0], lerp(v[1], targetRotation.current, 0.8), v[2])
        })
        return unsubscribe
    }, [])

    useFrame(() => {
        (leftPaddle || keyboard['ArrowLeft'] || keyboard['KeyA']) ? (targetRotation.current = 0.2) : (targetRotation.current = -0.2)
    })

    return (
        <mesh ref={ref} castShadow>
            <cylinderGeometry args={cylinderArgs} />
            <meshNormalMaterial />
            <mesh position={[1, 0, 0]} castShadow>
                <boxGeometry args={boxArgs} />
                <meshNormalMaterial />
            </mesh>
        </mesh>
    )
}
