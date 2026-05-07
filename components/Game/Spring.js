import * as THREE from "three"
import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useCompoundBody } from "@react-three/cannon"
import { usePinballGameStore } from "@/hooks/usePinballGameStore"
import { degToRad, lerp } from "three/src/math/MathUtils"

import { StoreModelH3H3SigmaBrain } from "@/components/Models/H3/SigmaBrain"
import { ModelKennyNLFoodBurgerCheeseDouble } from "@/components/Models/burger-cheese-double"
import { ModelJToastieBasicSpaceship } from "@/components/Models/Basic Spaceship"
import { ballWorldPosition } from "./ballPositionRef"

const PARTICLE_COUNT = 40

function SpringParticles({ triggerRef, spawnPositionRef }) {
    const pointsRef = useRef()
    const lastTrigger = useRef(0)

    const positions = useMemo(() => {
        const arr = new Float32Array(PARTICLE_COUNT * 3)
        for (let i = 0; i < PARTICLE_COUNT; i++) arr[i * 3 + 1] = -100
        return arr
    }, [])

    const colors = useMemo(() => {
        const arr = new Float32Array(PARTICLE_COUNT * 3)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const c = Math.floor(Math.random() * 3)
            if (c === 0) { arr[i * 3] = 0.9; arr[i * 3 + 1] = 0.1; arr[i * 3 + 2] = 0.2 }
            else if (c === 1) { arr[i * 3] = 1; arr[i * 3 + 1] = 1; arr[i * 3 + 2] = 1 }
            else { arr[i * 3] = 0.1; arr[i * 3 + 1] = 0.2; arr[i * 3 + 2] = 0.9 }
        }
        return arr
    }, [])

    const velocities = useMemo(() => {
        const v = []
        for (let i = 0; i < PARTICLE_COUNT; i++) v.push(new THREE.Vector3())
        return v
    }, [])

    const lifetimes = useMemo(() => new Float32Array(PARTICLE_COUNT), [])

    useEffect(() => {
        if (!pointsRef.current) return
        const geo = pointsRef.current.geometry
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }, [])

    useFrame((_, delta) => {
        if (!pointsRef.current) return
        const posAttr = pointsRef.current.geometry.attributes.position
        if (!posAttr) return

        // Trigger burst when counter increments
        if (triggerRef.current > lastTrigger.current) {
            lastTrigger.current = triggerRef.current
            const sp = spawnPositionRef.current
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                posAttr.array[i * 3] = sp[0]
                posAttr.array[i * 3 + 1] = sp[1]
                posAttr.array[i * 3 + 2] = sp[2]

                const angle = Math.random() * Math.PI * 2
                const speed = 3 + Math.random() * 6
                velocities[i].set(
                    Math.cos(angle) * speed * 0.6,
                    Math.abs(Math.sin(angle)) * speed + 2,
                    (Math.random() - 0.5) * speed * 0.3
                )
                lifetimes[i] = 0.6 + Math.random() * 0.6
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (lifetimes[i] <= 0) continue

            lifetimes[i] -= delta
            const v = velocities[i]
            v.y -= 9.8 * delta

            posAttr.array[i * 3] += v.x * delta
            posAttr.array[i * 3 + 1] += v.y * delta
            posAttr.array[i * 3 + 2] += v.z * delta

            if (lifetimes[i] <= 0) {
                posAttr.array[i * 3 + 1] = -100
            }
        }

        posAttr.needsUpdate = true
    })

    return (
        <points ref={pointsRef} frustumCulled={false}>
            <bufferGeometry />
            <pointsMaterial
                size={0.4}
                vertexColors
                transparent
                opacity={0.95}
                depthWrite={false}
                sizeAttenuation={true}
            />
        </points>
    )
}

export function Spring({ position, keyboard }) {

    const {
        machine,
        spring,
    } = usePinballGameStore()

    const boxArgs = [1.4, 0.3, 1]
    const cylinderArgs = [0.1, 0.1, 2]
    const [ref, api] = useCompoundBody(
        () => ({
            mass: 0,
            position,
            // rotation: [],
            shapes: [
                { args: boxArgs, type: 'Box', material: 'object' },
                {
                    args: cylinderArgs,
                    position: [0, -1, 0],
                    // rotation: [-Math.PI / 2, 0, 0],
                    type: 'Cylinder'
                }
            ]
        }),
        useRef()
    )
    const targetPosition = useRef()
    const speed = useRef()
    const wasPressed = useRef(false)
    const particleTrigger = useRef(0)
    const particleSpawnPos = useRef([0, 0, 0])

    useEffect(() => {
        const unsubscribe = api.position.subscribe((v) => {
            api.position.set(v[0], lerp(v[1], targetPosition.current, speed.current), v[2])
        })
        return unsubscribe
    }, [])

    useFrame((_, delta) => {
        const pressed = keyboard['Space'] || spring
        if (pressed) {
            targetPosition.current = -3
            speed.current = delta * 5
            wasPressed.current = true
        } else {
            targetPosition.current = 1
            speed.current = delta * 10
            // Trigger particles on release (the launch moment)
            if (wasPressed.current) {
                wasPressed.current = false
                if (machine === 'USA Pinball') {
                    particleSpawnPos.current = [...ballWorldPosition]
                    particleTrigger.current += 1
                }
            }
        }
    })

    return (
        <group>
            <mesh ref={ref} name="spring" position={position} castShadow>

                <boxGeometry args={boxArgs} />
                <meshNormalMaterial />

                <mesh position={[0, -1, 0]} castShadow>
                    <cylinderGeometry args={cylinderArgs} />
                    <meshNormalMaterial />
                </mesh>

                <group
                // rotation={[degToRad(180), 0, 0]}
                >
                    {machine == "H3H3 Pinball" &&
                        <StoreModelH3H3SigmaBrain
                            position={[0, -1.75, 0]}
                            rotation={[0, degToRad(125), 0]}
                        />
                    }
                    {machine == "USA Pinball" &&
                        <ModelKennyNLFoodBurgerCheeseDouble
                            position={[0, -1, 0]}
                            scale={3}
                        // rotation={[degToRad(-90), 0, 0]}
                        />
                    }
                    {machine == "Space Pinball" &&
                        <ModelJToastieBasicSpaceship
                            position={[0, -2.5, 0]}
                            scale={0.4}
                        // rotation={[degToRad(-90), 0, 0]}
                        />
                    }
                </group>

            </mesh>

            {machine == "USA Pinball" &&
                <SpringParticles triggerRef={particleTrigger} spawnPositionRef={particleSpawnPos} />
            }
        </group>
    )
}
