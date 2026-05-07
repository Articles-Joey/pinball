import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useSphere, useContactMaterial } from "@react-three/cannon"
import { usePinballGameStore } from "@/hooks/usePinballGameStore"
import { ModelPlanetNeptune } from "../Models/Space/Neptune"
import { ballWorldPosition } from "./ballPositionRef"

export function Ball(props) {

    const {
        removeBall,
        machine,
    } = usePinballGameStore(state => ({
        removeBall: state.removeBall,
        machine: state.machine,
    }));

    const ballPosition = useRef([...props.position])

    useContactMaterial('object', 'slippery', {
        friction: 0,
        restitution: 0.5,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 1
    })

    const [ref, { position, velocity, angularVelocity }] = useSphere(() => ({
        args: [0.5],
        mass: 1,
        material: 'slippery',
        onCollide: (c) => {
            if (c.body.name === 'bumper') {
                const cn = c.contact.contactNormal
                velocity.set(cn[0] * 10, cn[1] * 10, cn[2] * 10)
            }
        },
        ...props
    }))

    useEffect(() => {
        const unsubPos = position.subscribe((v) => {
            ballPosition.current[0] = v[0]
            ballPosition.current[1] = v[1]
            ballPosition.current[2] = v[2]

            ballWorldPosition[0] = v[0]
            ballWorldPosition[1] = v[1]
            ballWorldPosition[2] = v[2]

            if (v[1] < -3) {
                velocity.set(0, 0, 0)
                angularVelocity.set(0, 0, 0)
                removeBall()
                position.set(...props.position)
            }
        })
        return unsubPos
    }, [position, velocity])

    return (
        <mesh ref={ref} castShadow>

            {machine !== "Space Pinball" &&
                <>
                    <sphereGeometry args={[0.5]} />
                    <meshStandardMaterial />
                </>}

            {machine == "USA Pinball" &&
                <></>
            }

            {machine == "Space Pinball" &&
                <ModelPlanetNeptune
                    scale={0.016}
                    position={[0.025, -0.46, -0.125]}
                />
            }

        </mesh>
    )
}
