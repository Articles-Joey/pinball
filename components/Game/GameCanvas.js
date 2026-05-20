import * as THREE from "three"
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, RoundedBox, Environment, useTexture, useAspect, OrbitControls } from "@react-three/drei"
import { Physics, useSphere, useBox, usePlane, Debug } from "@react-three/cannon"
import { usePinballGameStore } from "@/hooks/usePinballGameStore"

import { StoreModelH3H3SigmaBrain } from "@/components/Models/H3/SigmaBrain"

import { degToRad, lerp } from "three/src/math/MathUtils"
import { H3StandaloneAudioButton } from "@/components/Models/H3/StandaloneAudioButton"
import { H3StandaloneVideoButton } from "@/components/Models/H3/StandaloneVideoButton"
import { ModelKennyNLFoodBurgerCheeseDouble } from "@/components/Models/burger-cheese-double"
import { StoreModelH3H3MeatMountain } from "@/components/Models/H3/MeatMountain"
import { ModelSkyboxSpace } from "../Models/Space/Skybox"
import { ModelPlanetEarth } from "../Models/Space/Earth"
import { ModelPlanetJupiter } from "../Models/Space/Jupiter"
import { Ball } from "./Ball"
import { FlipperLeft } from "./FlipperLeft"
import { FlipperRight } from "./FlipperRight"
import { Spring } from "./Spring"
import { ModelAsteroid } from "../Models/Space/Asteroid"
import { useStore } from "@/hooks/useStore"

const link = `${process.env.NEXT_PUBLIC_CDN}`

function BallAndCollisions({
    args = [1.2, 32, 32],
    v = new THREE.Vector3()
}) {

    const cam = useRef()

    // const [ref, api] = useSphere(() => ({ args: [1.2, 32, 32], mass: 1, material: { restitution: 0.95 } }))

    const {
        ballsLeft,
        setBallsLeft,
        removeBall
    } = usePinballGameStore()

    usePlane(() => ({
        position: [0, -15, 0],
        rotation: [-Math.PI / 2, 0, 0],
        onCollide: () => {
            // console.log("ballsLeft", ballsLeft)
            // removeBall()
            // api.position.set(0, 0, 0)
            // api.velocity.set(0, 0, 0)
        }
    }))

    // usePlane(() => ({ position: [-15, 0, 0], rotation: [-Math.PI / 2, Math.PI / 2, 0] }))
    // usePlane(() => ({ position: [15, 0, 0], rotation: [Math.PI / 2, -Math.PI / 2, 0] }))

    useEffect(
        () => {
            // api.position.subscribe((p) => (cam.current.position.lerp(v.set(p[0], p[1], 24 + Math.max(0, p[1]) / 2), 0.05), cam.current.lookAt(0, 0, 0)))
        },
        [],
    )
    return (
        <>
            {/* <PerspectiveCamera
                ref={cam}
                makeDefault
                position={[
                    0,
                    0,
                    // 12
                    10
                ]}
                fov={100}
            /> */}

            <OrbitControls

            />

            {/* <mesh ref={ref}>
                <sphereGeometry args={args} />
                <meshPhysicalMaterial map={useTexture(`${link}cross.jpg`)} transmission={1} roughness={0} thickness={10} envMapIntensity={1} />
            </mesh> */}
        </>
    )
}

const Block = forwardRef(({ shake = 0, args = [1, 1.5, 4], vec = new THREE.Vector3(), ...props }, ref) => {

    const group = useRef()

    const {
        score,
        setScore,
        addScore
    } = usePinballGameStore()

    const [block, api] = useBox(() => ({
        args,
        ...props,
        onCollide: (e) => {
            console.log("HIT!")
            addScore(10)
                (shake += e.contact.impactVelocity / 12.5)
        }
    }))

    useFrame(() => group.current.position.lerp(vec.set(0, (shake = THREE.MathUtils.lerp(shake, 0, 0.1)), 0), 0.2))

    useImperativeHandle(ref, () => api, [api])

    return (
        <group ref={group}>
            <RoundedBox ref={block} args={args} radius={0.4} smoothness={10}>
                <meshPhysicalMaterial transmission={1} roughness={0} thickness={3} envMapIntensity={4} />
            </RoundedBox>
        </group>
    )
})
Block.displayName = "TestBlock"

function Paddle({ args = [5, 1.5, 4] }) {
    const api = useRef()
    useFrame((state) => (api.current.position.set(state.mouse.x * 10, -5, 0), api.current.rotation.set(0, 0, (state.mouse.x * Math.PI) / 4)))
    return <Block ref={api} args={args} material={{ restitution: 1.3 }} />
}

function H3PinballObjects() {

    const {
        machine
    } = usePinballGameStore()

    if (machine == "H3H3 Pinball")

        return (
            <group
                position={[0, 7, 0]}
                rotation={[0, Math.PI / 1.4, 0]}
                scale={4}
            >

                <StoreModelH3H3SigmaBrain

                />
            </group>
        )
}

function MovingBlock({ offset = 0, position: [x, y, z], ...props }) {
    const api = useRef()

    // useFrame((state) => api.current.position.set(x + (Math.sin(offset + state.clock.elapsedTime) * state.viewport.width) / 4, y, z))

    useFrame((state) => {
        // Oscillate between -100 and 100
        const range = 10; // Half the oscillation range
        api.current.position.set(
            x + Math.sin(offset + state.clock.elapsedTime) * range,
            y,
            z
        );
    });

    return <Block ref={api} args={[3, 1.5, 4]} material={{ restitution: 1.1 }} {...props} />
}

const Background = (props) => {

    const {
        machine
    } = usePinballGameStore()

    const spaceTexture = useTexture(`${link}games/Pinball/Backgrounds/space-background.jpg`)
    const usaTexture = useTexture(`${link}games/Pinball/Backgrounds/usa-flag-background.webp`)
    const h3h3Texture = useTexture(`${link}games/Pinball/Backgrounds/h3h3-background-1.jpg`)
    const articlesTexture = useTexture(`${link}games/Pinball/Backgrounds/articles-background.jpg`)

    if (machine == "Space Pinball") {
        return <ModelSkyboxSpace
            scale={50}
        />
    }

    return (

        <mesh scale={useAspect(2500, (3800 / 2), 1.5)} {...props}>
            <planeGeometry />

            {machine == "USA Pinball" && <meshBasicMaterial map={usaTexture} />}
            {machine == "H3H3 Pinball" && <meshBasicMaterial map={h3h3Texture} />}
            {machine == "Space Pinball" && <meshBasicMaterial map={spaceTexture} />}
            {machine == "Articles Pinball" && <meshBasicMaterial map={articlesTexture} />}

        </mesh>

    )
}

const GameCanvas = () => {

    const {
        machine
    } = usePinballGameStore()

    const debugMode = useStore(state => state.debugMode)

    function useKeyboard() {
        const keyMap = useRef({})

        useEffect(() => {
            const onDocumentKey = (e) => {
                keyMap.current[e.code] = e.type === 'keydown'
            }
            document.addEventListener('keydown', onDocumentKey)
            document.addEventListener('keyup', onDocumentKey)
            return () => {
                document.removeEventListener('keydown', onDocumentKey)
                document.removeEventListener('keyup', onDocumentKey)
            }
        }, [])

        return keyMap.current
    }

    const keyboard = useKeyboard()

    return (
        <Canvas dpr={1.5} camera={{ position: [0, 4, 38], fov: 50 }}>

            {machine == "Space Pinball" &&
                <>
                    <ModelAsteroid
                        position={[-22, 0, 0]}
                        scale={1}
                    />
                    <ModelAsteroid
                        position={[-22, -15, 0]}
                        scale={1}
                    />

                    <ModelAsteroid
                        position={[22, 0, 0]}
                        scale={1}
                    />
                    <ModelAsteroid
                        position={[22, -15, 0]}
                        scale={1}
                    />
                </>
            }

            <Physics
                // iterations={5}
                gravity={[0, -3, -9.8]}
            >

                <Debug
                    color="red"
                    scale={debugMode ? 1 : 0}
                >

                    <HiddenCasing
                        position={[0, 0, -1]}
                        args={[100, 100, 1]}
                    />
                    <HiddenCasing
                        position={[0, 0, 1]}
                        args={[100, 100, 1]}
                        frontGlass
                    />

                    <Ball position={[8.15, 2, 0]} />

                    {machine == "H3H3 Pinball" &&
                        <group position={[-4, -5, 0]}>

                            {[...Array(5)].map((item, item_i) => {
                                return (
                                    <StoreModelH3H3MeatMountain
                                        key={item_i}
                                        scale={1}
                                        position={[(item_i * 2), 0, 0]}
                                    />
                                )
                            })}

                        </group>
                    }

                    {/* <StoreModelH3H3SigmaBrain
                        position={[0, 2, 0]}
                        rotation={[degToRad(90), 0, 0]}
                    /> */}

                    <group
                    // rotation={[degToRad(90), 0, 0]}
                    // position={[0, 0, 3]}
                    >
                        <Spring position={[8.15, 0.5, 0]} keyboard={keyboard} />

                        <FlipperLeft
                            position={[-3.2, -2, 0]}
                            keyboard={keyboard}
                        // rotation={[degToRad(180), 0, 0]}
                        />
                        <FlipperRight
                            position={[3.2, -2, 0]}
                            keyboard={keyboard}
                        // rotation={[degToRad(90), 0, 0]}
                        />
                    </group>

                    <group
                    // rotation={[degToRad(90), 0, 0]}
                    >

                        {/* Top Triangle Bumpers */}
                        <Bumper position={[0, 13, 0]} variation={1} />
                        <Bumper position={[-3, 12, 0]} variation={2} />
                        <Bumper position={[3, 12, 0]} variation={1} />

                        {/* Upper Mid Bumpers */}
                        <Bumper position={[-5, 10, 0]} variation={2} />
                        <Bumper position={[0, 10, 0]} variation={1} />
                        <Bumper position={[5, 10, 0]} variation={2} />

                        {/* Mid Bumpers */}
                        <Bumper position={[-2.5, 7, 0]} variation={1} />
                        <Bumper position={[2.5, 7, 0]} variation={2} />
                        <Bumper position={[0, 5, 0]} variation={1} />

                        {/* Lower Bumpers */}
                        <Bumper position={[-5.5, 5, 0]} variation={2} />
                        <Bumper position={[5.5, 5, 0]} variation={1} />

                        {/* Left Paddle Area */}
                        <Wall args={[0.25, 4, 1]} position={[-4.2, 0.2, 0]} rotation={[0, 0, Math.PI / 8]} />
                        <Wall args={[0.25, 4, 1]} position={[-6, 0.2, 0]} rotation={[0, 0, Math.PI / 8]} />

                        {/* Right Paddle Area */}
                        <Wall args={[0.25, 4, 1]} position={[4.2, 0.2, 0]} rotation={[0, 0, -Math.PI / 8]} />
                        <Wall args={[0.25, 4, 1]} position={[6, 0.2, 0]} rotation={[0, 0, -Math.PI / 8]} />

                        {/* Slingshot Walls */}
                        <Wall args={[0.25, 2.5, 1]} position={[-4.8, 2.5, 0]} rotation={[0, 0, Math.PI / 6]} />
                        <Wall args={[0.25, 2.5, 1]} position={[4.8, 2.5, 0]} rotation={[0, 0, -Math.PI / 6]} />

                        {/* Center Lane Guide */}
                        <Wall args={[0.25, 1.2, 1]} position={[0, -1, 0]} />

                        {/* Mid Deflectors */}
                        <Wall args={[0.25, 2, 1]} position={[-4.5, 7.5, 0]} rotation={[0, 0, Math.PI / 5]} />
                        <Wall args={[0.25, 2, 1]} position={[4.5, 7.5, 0]} rotation={[0, 0, -Math.PI / 5]} />

                        {/* Upper Lane Dividers */}
                        <Wall args={[0.25, 2, 1]} position={[-2, 14.5, 0]} />
                        <Wall args={[0.25, 2, 1]} position={[2, 14.5, 0]} />

                        {/* Left Boundary Wall */}
                        <Wall args={[0.25, 15, 1]} position={[-7.28, 1.5, 0]} />

                        {/* Launch Chamber */}
                        <Wall args={[0.25, 15, 1]} position={[7.3, 1.5, 0]} />
                        <Wall args={[0.25, 16, 1]} position={[9, 1.5, 0]} />

                        {/* Left and Right roof angles */}
                        <Wall args={[0.25, 7, 1]} position={[-7.6, 12, 0]} rotation={[0, 0, -Math.PI / 7]} />
                        <Wall args={[0.25, 7, 1]} position={[7.6, 12, 0]} rotation={[0, 0, Math.PI / 7]} />

                        {/* Roof */}
                        <Wall
                            args={[13, 0.25, 1]}
                            position={[0, 15.5, 0]}
                            rotation={[0, 0, 0]}
                        />

                    </group>

                    <BallAndCollisions />

                    {/* <Paddle /> */}

                    {/* {Array.from({ length: 6 }, (_, i) => <MovingBlock key={i} position={[0, 1 + i * 4.5, 0]} offset={10000 * i} />) */}

                    {/* <Block args={[10, 1.5, 4]} position={[-11, -7, 0]} rotation={[0, 0, -0.7]} material={{ restitution: 1.2 }} />
                    <Block args={[10, 1.5, 4]} position={[11, -7, 0]} rotation={[0, 0, 0.7]} material={{ restitution: 1.2 }} /> */}

                    {/* <H3PinballObjects /> */}

                    <Environment preset="warehouse" />

                    <Background position={[0, 0, -5]} />

                </Debug>

            </Physics>

        </Canvas>
    )
}

export default memo(GameCanvas)

function Bumper(props) {

    const machine = usePinballGameStore(state => state.machine)

    const {
        addScore
    } = usePinballGameStore(state => ({
        addScore: state.addScore,
    }));

    const targetScale = useRef(1)
    const [ref] = useSphere(() => ({
        args: [0.5],
        mass: 0,
        rotation: [degToRad(90), 0, 0],
        onCollide: () => {
            targetScale.current = 1.2
            addScore(10)
        },
        ...props
    }))

    useFrame((_, delta) => {
        ref.current.scale.x = ref.current.scale.z = targetScale.current
        targetScale.current = lerp(targetScale.current, 1, delta * 10)
    })

    return (
        <mesh ref={ref} name={'bumper'} castShadow>

            <cylinderGeometry args={[0.5, 0.5, 0.25]} />
            <meshNormalMaterial />

            {machine == "H3H3 Pinball" &&
                <>
                    {props.variation == 1 &&
                        <H3StandaloneAudioButton
                            scale={0.6}
                        />
                    }

                    {props.variation == 2 &&
                        <H3StandaloneVideoButton
                            scale={0.6}
                        />
                    }
                </>
            }

            {machine == "Space Pinball" &&
                <>
                    {props.variation == 1 &&
                        <ModelPlanetEarth
                            scale={0.0015}
                            position={[0, -0.25, 0]}
                        />
                    }

                    {props.variation == 2 &&
                        <ModelPlanetJupiter
                            scale={0.005}
                            position={[0, -0.25, 0]}
                        />
                    }
                </>
            }

            {machine == "USA Pinball" &&
                <>
                    {props.variation == 1 &&
                        <ModelKennyNLFoodBurgerCheeseDouble
                            scale={2.75}
                            position={[-0, -0, 0.4]}
                            rotation={[0, degToRad(-90), degToRad(90)]}
                        />
                    }

                    {props.variation == 2 &&
                        <ModelKennyNLFoodBurgerCheeseDouble
                            scale={2.75}
                            position={[-0, -0, 0.4]}
                            rotation={[0, degToRad(-90), degToRad(90)]}
                        />
                    }
                </>
            }

        </mesh>
    )
}

function Wall({ args, ...props }) {
    const [ref] = useBox(() => ({
        args,
        mass: 0,
        // rotation: [degToRad(90), 0, 0],
        material: 'object',
        ...props
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshNormalMaterial />
        </mesh>
    )
}

function HiddenCasing({ args, ...props }) {
    const [ref] = useBox(() => ({ args, mass: 0, material: 'object', ...props }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshNormalMaterial
                transparent={true}
                opacity={0}
            />
        </mesh>
    )
}