"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Base, Geometry, Subtraction } from "@react-three/csg";
import {
    BallCollider,
    CuboidCollider,
    CylinderCollider,
    RigidBody,
} from "@react-three/rapier";
import { Euler, Plane, Quaternion, Vector3 } from "three";
import { Star, usePinballArtwork } from "./PinballArtwork";
import { SCENE_OBJECTS } from "./sceneLayout";

const TILT = (6.5 * Math.PI) / 180;
const LEG_EXTENSION = 0.18;
const FIELD_Y = 1.65 + LEG_EXTENSION;
const BACKBOX_Y = 2.77 + LEG_EXTENSION;
const FIELD_QUATERNION = new Quaternion().setFromEuler(new Euler(TILT, 0, 0));
const INVERSE_FIELD = FIELD_QUATERNION.clone().invert();
const UP = new Vector3(0, 1, 0);
const RED = "#cf2d42";
const NAVY = "#071b38";
const GOLD = "#e6b862";
const WHITE = "#fff1d2";
const LAUNCH_CHARGE_SECONDS = 2.25;
const LAUNCH_POWER_THRESHOLD = 0.2;
const MIN_LAUNCH_SPEED = 6.6;
const MAX_LAUNCH_SPEED = 12.2;

function worldPoint(x, y, z) {
    return new Vector3(x, y, z)
        .applyQuaternion(FIELD_QUATERNION)
        .add(new Vector3(0, FIELD_Y, 0));
}

function localPoint(point) {
    return new Vector3(point.x, point.y - FIELD_Y, point.z).applyQuaternion(
        INVERSE_FIELD,
    );
}

const EDITOR_PLANE = new Plane().setFromNormalAndCoplanarPoint(
    new Vector3(0, 1, 0).applyQuaternion(FIELD_QUATERNION),
    worldPoint(0, 0.08, 0),
);

function EditablePlacement({ item, editor, children }) {
    const dragOffset = useRef(new Vector3());
    const dragStart = useRef(new Vector3());
    const moved = useRef(false);
    const intersection = useMemo(() => new Vector3(), []);

    const pointOnField = (event) => {
        if (!event.ray.intersectPlane(EDITOR_PLANE, intersection)) return null;
        return localPoint(intersection);
    };

    const pointerDown = (event) => {
        if (!editor?.enabled) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        event.target.setPointerCapture?.(event.pointerId);
        dragOffset.current.set(
            item.position[0] - point.x,
            0,
            item.position[2] - point.z,
        );
        dragStart.current.copy(point);
        moved.current = false;
        editor.select(item.id);
        editor.beginDrag(item.id);
    };

    const pointerMove = (event) => {
        if (!editor?.enabled || editor.draggingId !== item.id) return;
        event.stopPropagation();
        const point = pointOnField(event);
        if (!point) return;
        if (point.distanceToSquared(dragStart.current) > 0.0004)
            moved.current = true;
        editor.updateObject(item.id, {
            position: [
                Math.max(-1.28, Math.min(1.28, point.x + dragOffset.current.x)),
                item.position[1],
                Math.max(-2.6, Math.min(2.4, point.z + dragOffset.current.z)),
            ],
        });
    };

    const finishDrag = (event) => {
        if (!editor?.enabled || editor.draggingId !== item.id) return;
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        editor.endDrag();
        if (!moved.current && item.logic) editor.runTrigger(item);
    };

    const selected = editor?.enabled && editor.selectedId === item.id;
    const linked = editor?.enabled && editor.linkedIds.includes(item.id);

    return (
        <group
            position={item.position}
            rotation={item.rotation}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
        >
            {children}
            {(selected || linked) && (
                <mesh
                    position={[0, 0.48, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    raycast={() => null}
                >
                    <torusGeometry
                        args={[selected ? 0.24 : 0.2, 0.025, 8, 32]}
                    />
                    <meshBasicMaterial
                        color={selected ? GOLD : "#55d7ff"}
                        depthTest={false}
                    />
                </mesh>
            )}
        </group>
    );
}

function impulse(body, x, z, strength) {
    const direction = new Vector3(x, 0, z)
        .normalize()
        .multiplyScalar(strength)
        .applyQuaternion(FIELD_QUATERNION);
    body.applyImpulse(direction, true);
}

function Box({
    size,
    color = NAVY,
    metalness = 0.15,
    roughness = 0.35,
    ...props
}) {
    return (
        <mesh
            castShadow
            receiveShadow
            {...props}
        >
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                metalness={metalness}
                roughness={roughness}
            />
        </mesh>
    );
}

function Rail({
    from,
    to,
    color = "#c4d3df",
    width = 0.055,
    height = 0.24,
    onHit,
}) {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const length = Math.hypot(dx, dz);
    const position = [(from[0] + to[0]) / 2, height / 2, (from[1] + to[1]) / 2];
    const rotation = [0, Math.atan2(dx, dz), 0];
    return (
        <RigidBody
            type="fixed"
            colliders={false}
            position={position}
            rotation={rotation}
        >
            <CuboidCollider
                args={[width / 2, height / 2, length / 2]}
                restitution={0.62}
                friction={0.08}
                onCollisionEnter={onHit}
            />
            <Box
                size={[width, height, length]}
                color={color}
                metalness={0.75}
                roughness={0.2}
            />
        </RigidBody>
    );
}

function CabinetFlipperButton({ side, controls }) {
    const button = useRef();
    const buttonMaterial = useRef();
    const control = side < 0 ? "left" : "right";

    useFrame((_, dt) => {
        if (!button.current) return;
        const target = controls.current[control] ? 0.035 : 0;
        button.current.position.y +=
            (target - button.current.position.y) * Math.min(1, dt * 28);
        if (buttonMaterial.current) {
            const glow = controls.current[control] ? 0.85 : 0.25;
            buttonMaterial.current.emissiveIntensity +=
                (glow - buttonMaterial.current.emissiveIntensity) *
                Math.min(1, dt * 24);
        }
    });

    const press = (event) => {
        event.stopPropagation();
        event.target.setPointerCapture?.(event.pointerId);
        controls.current[control] = true;
    };
    const release = (event) => {
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        controls.current[control] = false;
    };

    return (
        <group
            name={`${control}-cabinet-flipper-button`}
            position={[side * 1.54, -0.08, 1.98]}
            rotation={[0, 0, side > 0 ? Math.PI / 2 : -Math.PI / 2]}
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={() => {
                controls.current[control] = false;
            }}
        >
            <group ref={button}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.09, 24]} />
                    <meshStandardMaterial
                        ref={buttonMaterial}
                        color={RED}
                        emissive={RED}
                        emissiveIntensity={0.25}
                    />
                </mesh>
                <mesh>
                    <cylinderGeometry args={[0.17, 0.17, 0.16, 20]} />
                    <meshBasicMaterial
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </mesh>
            </group>
        </group>
    );
}

function Cabinet({ controls }) {
    const sideArt = usePinballArtwork("side");
    return (
        <>
            {/* Boolean cavity passes completely through the top, leaving actual side walls and a bottom. */}
            <mesh
                castShadow
                receiveShadow
                position={[0, -0.3, 0]}
            >
                <Geometry>
                    <Base>
                        <boxGeometry args={[3, 1, 5.8]} />
                    </Base>
                    <Subtraction position={[0, 0.35, 0]}>
                        <boxGeometry args={[2.72, 1.35, 5.52]} />
                    </Subtraction>
                </Geometry>
                <meshStandardMaterial
                    color={NAVY}
                    roughness={0.32}
                    metalness={0.22}
                />
            </mesh>
            {[-1, 1].map((side) => (
                <group key={side}>
                    <Box
                        position={[side * 1.46, 0.215, 0]}
                        size={[0.105, 0.07, 5.83]}
                        color="#d8e1e9"
                        metalness={0.9}
                        roughness={0.18}
                    />
                    <mesh
                        position={[side * 1.502, -0.3, 0]}
                        rotation={[0, (side * Math.PI) / 2, 0]}
                    >
                        <planeGeometry args={[5.64, 0.85]} />
                        <meshStandardMaterial
                            map={sideArt}
                            roughness={0.45}
                        />
                    </mesh>
                    <CabinetFlipperButton
                        side={side}
                        controls={controls}
                    />
                </group>
            ))}
            <Box
                position={[0, 0.2, 2.82]}
                size={[3.04, 0.13, 0.19]}
                color="#d8e1e9"
                metalness={0.9}
            />
            <Box
                position={[0, -0.3, 2.912]}
                size={[0.64, 0.52, 0.035]}
                color="#10141c"
                metalness={0.7}
            />
            <Box
                position={[-0.12, -0.25, 2.937]}
                size={[0.07, 0.12, 0.025]}
                color="#bbc2cc"
                metalness={0.9}
            />
            <Box
                position={[0.12, -0.25, 2.937]}
                size={[0.07, 0.12, 0.025]}
                color="#bbc2cc"
                metalness={0.9}
            />
            <Star
                position={[0, -0.44, 2.94]}
                scale={0.075}
            />
        </>
    );
}

function Backbox() {
    const art = usePinballArtwork("backglass");
    return (
        <group position={[0, BACKBOX_Y, -2.66]}>
            <RoundedBox
                args={[3.25, 1.98, 0.54]}
                radius={0.07}
                smoothness={3}
                castShadow
            >
                <meshStandardMaterial
                    color={NAVY}
                    metalness={0.3}
                    roughness={0.3}
                />
            </RoundedBox>
            <Box
                position={[0, 0.12, 0.28]}
                size={[3.04, 1.56, 0.06]}
                color={GOLD}
                metalness={0.55}
            />
            <mesh position={[0, 0.12, 0.315]}>
                <planeGeometry args={[2.9, 1.44]} />
                <meshStandardMaterial
                    map={art}
                    emissiveMap={art}
                    emissive="white"
                    emissiveIntensity={0.45}
                    roughness={0.5}
                />
            </mesh>
            <Box
                position={[0, -0.78, 0.285]}
                size={[2.94, 0.25, 0.04]}
                color="#050b17"
            />
            {[-1.1, 1.1].map((x) => (
                <mesh
                    key={x}
                    position={[x, -0.78, 0.315]}
                >
                    <circleGeometry args={[0.095, 24]} />
                    <meshStandardMaterial
                        color="#394956"
                        metalness={0.8}
                    />
                </mesh>
            ))}
            {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
                <Star
                    key={x}
                    position={[x, -0.78, 0.32]}
                    scale={0.055}
                />
            ))}
            <Box
                position={[0, 1.015, 0]}
                size={[2.95, 0.035, 0.47]}
                color={RED}
            />
        </group>
    );
}

function LibertyToy({ onToggle, onScore, scenePosition }) {
    const hit = ({ other }) => {
        if (other.rigidBodyObject?.name !== "liberty-ball") return;
        const point = localPoint(other.rigidBody.translation());
        impulse(
            other.rigidBody,
            point.x - scenePosition[0],
            point.z - scenePosition[2],
            0.34,
        );
        onToggle();
        onScore(500);
    };
    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CylinderCollider
                args={[0.34, 0.18]}
                position={[0, 0.34, 0]}
                restitution={0.85}
                onCollisionEnter={hit}
            />
            <group scale={0.75}>
                <Box
                    position={[0, 0.08, 0]}
                    size={[0.32, 0.16, 0.32]}
                    color="#b9a184"
                />
                <mesh
                    position={[0, 0.4, 0]}
                    castShadow
                >
                    <coneGeometry args={[0.14, 0.55, 7]} />
                    <meshStandardMaterial
                        color="#68b8a8"
                        roughness={0.45}
                    />
                </mesh>
                <mesh position={[0, 0.73, 0]}>
                    <sphereGeometry args={[0.1, 12, 12]} />
                    <meshStandardMaterial color="#7dccb9" />
                </mesh>
                {Array.from({ length: 7 }, (_, i) => (
                    <mesh
                        key={i}
                        position={[
                            Math.cos((i * Math.PI) / 6) * 0.13,
                            0.76 + Math.sin((i * Math.PI) / 6) * 0.13,
                            0,
                        ]}
                        rotation={[0, 0, Math.PI / 2 - (i * Math.PI) / 6]}
                    >
                        <coneGeometry args={[0.022, 0.14, 5]} />
                        <meshStandardMaterial color="#7dccb9" />
                    </mesh>
                ))}
                <Box
                    position={[0.16, 0.66, 0]}
                    rotation={[0, 0, -0.3]}
                    size={[0.055, 0.42, 0.06]}
                    color="#7dccb9"
                />
                <mesh position={[0.22, 0.94, 0]}>
                    <coneGeometry args={[0.065, 0.19, 7]} />
                    <meshStandardMaterial
                        color={GOLD}
                        emissive="#f88918"
                        emissiveIntensity={1.5}
                    />
                </mesh>
                <Box
                    position={[-0.12, 0.52, 0.06]}
                    rotation={[0, 0, 0.2]}
                    size={[0.13, 0.18, 0.05]}
                    color="#599f94"
                />
            </group>
        </RigidBody>
    );
}

function Bumper({ color, onScore, scenePosition }) {
    const cap = useRef();
    const flash = useRef(0);
    const hit = ({ other }) => {
        if (other.rigidBodyObject?.name !== "liberty-ball") return;
        const p = localPoint(other.rigidBody.translation());
        impulse(
            other.rigidBody,
            p.x - scenePosition[0],
            p.z - scenePosition[2],
            0.43,
        );
        flash.current = 1;
        onScore(100);
    };
    useFrame((_, dt) => {
        flash.current = Math.max(0, flash.current - dt * 4);
        if (cap.current)
            cap.current.emissiveIntensity = 0.5 + flash.current * 2.5;
    });
    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CylinderCollider
                args={[0.12, 0.175]}
                position={[0, 0.12, 0]}
                restitution={1}
                onCollisionEnter={hit}
            />
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.22, 0.235, 0.075, 32]} />
                <meshStandardMaterial
                    color={WHITE}
                    metalness={0.25}
                />
            </mesh>
            <mesh
                position={[0, 0.15, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.135, 0.15, 0.18, 24]} />
                <meshStandardMaterial
                    color="#bbc7cf"
                    metalness={0.9}
                    roughness={0.15}
                />
            </mesh>
            <mesh
                position={[0, 0.255, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.22, 0.2, 0.075, 32]} />
                <meshStandardMaterial
                    ref={cap}
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    roughness={0.22}
                />
            </mesh>
            <Star
                position={[0, 0.3, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.105}
                color={WHITE}
            />
        </RigidBody>
    );
}

function Flipper({ side, controls, sceneRotation, editorEnabled }) {
    const body = useRef();
    const visual = useRef();
    const direction = side === "left" ? 1 : -1;
    const restingAngle = -0.3 * direction;
    const angle = useRef(restingAngle);
    const rotation = useMemo(() => new Quaternion(), []);
    const actionRotation = useMemo(() => new Quaternion(), []);
    const baseRotation = useMemo(
        () => new Quaternion().setFromEuler(new Euler(...sceneRotation)),
        [sceneRotation[0], sceneRotation[1], sceneRotation[2]],
    );
    useFrame((_, dt) => {
        const target = (controls.current[side] ? 0.6 : -0.3) * direction;
        angle.current += (target - angle.current) * Math.min(1, dt * 35);
        actionRotation.setFromAxisAngle(UP, angle.current);
        rotation
            .copy(FIELD_QUATERNION)
            .multiply(baseRotation)
            .multiply(actionRotation);
        if (editorEnabled) {
            if (visual.current)
                visual.current.rotation.y = angle.current - restingAngle;
        } else {
            body.current?.setNextKinematicRotation(rotation);
            if (visual.current) visual.current.rotation.y = 0;
        }
    });
    const hit = ({ other }) => {
        if (
            controls.current[side] &&
            other.rigidBodyObject?.name === "liberty-ball"
        )
            impulse(other.rigidBody, direction * 0.28, -1, 0.42);
    };
    return (
        <RigidBody
            ref={body}
            type="kinematicPosition"
            colliders={false}
            rotation={[0, angle.current, 0]}
        >
            <CuboidCollider
                position={[direction * 0.28, 0, 0]}
                args={[0.3, 0.075, 0.075]}
                restitution={0.35}
                onCollisionEnter={hit}
            />
            <BallCollider
                args={[0.08]}
                position={[direction * 0.56, 0, 0]}
                onCollisionEnter={hit}
            />
            <group ref={visual}>
                <RoundedBox
                    position={[direction * 0.27, 0, 0]}
                    args={[0.65, 0.14, 0.17]}
                    radius={0.065}
                    smoothness={3}
                    castShadow
                >
                    <meshStandardMaterial
                        color={RED}
                        roughness={0.35}
                    />
                </RoundedBox>
                <RoundedBox
                    position={[direction * 0.26, 0.06, 0]}
                    args={[0.58, 0.05, 0.12]}
                    radius={0.025}
                    smoothness={2}
                >
                    <meshStandardMaterial
                        color={WHITE}
                        roughness={0.3}
                    />
                </RoundedBox>
                <mesh position={[0, 0.097, 0]}>
                    <cylinderGeometry args={[0.047, 0.047, 0.015, 16]} />
                    <meshStandardMaterial
                        color={GOLD}
                        metalness={0.8}
                    />
                </mesh>
            </group>
        </RigidBody>
    );
}

function Slingshot({ side, onScore }) {
    const direction = side === "left" ? 1 : -1;
    const hit = ({ other }) => {
        if (other.rigidBodyObject?.name !== "liberty-ball") return;
        impulse(other.rigidBody, direction, -0.55, 0.24);
        onScore(25);
    };
    return (
        <>
            <Rail
                from={[-direction * 0.12, -0.35]}
                to={[direction * 0.23, 0.4]}
                color={WHITE}
                width={0.1}
                onHit={hit}
            />
            <Box
                position={[-direction * 0.025, 0.21, 0]}
                rotation={[0, direction * 0.44, 0]}
                size={[0.23, 0.06, 0.72]}
                color={side === "left" ? RED : "#2469b8"}
            />
            <Star
                position={[0, 0.245, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.09}
            />
        </>
    );
}

function Post({ color, onScore }) {
    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CylinderCollider
                args={[0.1, 0.068]}
                position={[0, 0.1, 0]}
                restitution={0.82}
                friction={0.04}
                onCollisionEnter={({ other }) => {
                    if (other.rigidBodyObject?.name === "liberty-ball")
                        onScore(15);
                }}
            />
            <mesh
                position={[0, 0.095, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.068, 0.082, 0.19, 18]} />
                <meshStandardMaterial
                    color="#d6e0e8"
                    metalness={0.82}
                    roughness={0.2}
                />
            </mesh>
            <mesh position={[0, 0.205, 0]}>
                <sphereGeometry args={[0.085, 16, 12]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.4}
                    roughness={0.25}
                />
            </mesh>
        </RigidBody>
    );
}

function GutterFlap({ side, flipped }) {
    const visual = useRef();
    const isLeft = side === "left";
    const angle = useRef(flipped ? (isLeft ? Math.PI / 2 : -Math.PI / 2) : 0);

    useFrame((_, dt) => {
        const target = flipped ? (isLeft ? Math.PI / 2 : -Math.PI / 2) : 0;
        angle.current += (target - angle.current) * Math.min(1, dt * 12);
        if (visual.current) visual.current.rotation.z = angle.current;
    });

    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            {!flipped && (
                <CuboidCollider
                    args={[isLeft ? 0.165 : 0.125, 0.025, 0.055]}
                    restitution={0.72}
                    friction={0.05}
                />
            )}
            <group ref={visual}>
                <RoundedBox
                    args={[isLeft ? 0.35 : 0.27, 0.055, 0.12]}
                    radius={0.025}
                    smoothness={2}
                    castShadow
                >
                    <meshStandardMaterial
                        color={isLeft ? RED : "#2469b8"}
                        emissive={isLeft ? RED : "#2469b8"}
                        emissiveIntensity={flipped ? 0.12 : 0.5}
                        roughness={0.3}
                    />
                </RoundedBox>
                <Box
                    position={[0, 0.035, 0]}
                    size={[0.05, 0.02, 0.14]}
                    color={WHITE}
                />
            </group>
        </RigidBody>
    );
}

function Plunger({ charge }) {
    const rod = useRef();
    useFrame(() => {
        if (rod.current) rod.current.position.z = charge.current * 0.38;
    });
    return (
        <group position={[1.17, 0.1, 2.6]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.26, 24]} />
                <meshStandardMaterial
                    color="#b8c9d3"
                    metalness={0.85}
                    roughness={0.22}
                />
            </mesh>
            <group ref={rod}>
                <mesh
                    position={[0, 0, 0.28]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.027, 0.027, 0.6, 16]} />
                    <meshStandardMaterial
                        color="#d2e0ed"
                        metalness={1}
                        roughness={0.14}
                    />
                </mesh>
                <mesh
                    position={[0, 0, 0.59]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.115, 0.09, 0.1, 24]} />
                    <meshStandardMaterial
                        color={RED}
                        roughness={0.22}
                    />
                </mesh>
            </group>
            {Array.from({ length: 9 }, (_, i) => (
                <mesh
                    key={i}
                    position={[0, 0, -0.02 + i * 0.022]}
                >
                    <torusGeometry args={[0.051, 0.01, 6, 16]} />
                    <meshStandardMaterial
                        color="#b5bfcc"
                        metalness={0.85}
                        roughness={0.2}
                    />
                </mesh>
            ))}
        </group>
    );
}

function Ball({ controls, charge, onDrain, onLaunchPowerChange }) {
    const ball = useRef();
    const previousLaunch = useRef(false);
    const previousReset = useRef(controls.current.reset);
    const awaitingServe = useRef(false);
    const respawnAt = useRef(0);
    const reportedPower = useRef(-1);
    const spawn = useMemo(() => worldPoint(1.17, 0.12, 2.25), []);
    const reportPower = useCallback(
        (power, force = false) => {
            if (!force && Math.abs(power - reportedPower.current) < 0.02)
                return;
            reportedPower.current = power;
            onLaunchPowerChange?.(power);
        },
        [onLaunchPowerChange],
    );
    const serve = useCallback(() => {
        ball.current.setTranslation(spawn, true);
        ball.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        ball.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        awaitingServe.current = false;
        charge.current = 0;
        reportPower(0, true);
    }, [spawn, charge, reportPower]);
    useFrame((state, dt) => {
        if (!ball.current) return;
        const input = controls.current;
        if (input.reset !== previousReset.current) {
            previousReset.current = input.reset;
            serve();
        }
        const p = localPoint(ball.current.translation());
        if (
            !awaitingServe.current &&
            ((p.z > 2.42 && p.x < 1.08) ||
                p.y < -0.8 ||
                Math.abs(p.x) > 2 ||
                Math.abs(p.z) > 3.4)
        ) {
            awaitingServe.current = true;
            respawnAt.current = state.clock.elapsedTime + 0.8;
            onDrain?.();
        }
        if (
            awaitingServe.current &&
            state.clock.elapsedTime >= respawnAt.current
        )
            serve();
        const inShooter = p.x > 1.08 && p.z > 1.95 && !awaitingServe.current;
        if (input.launch && inShooter) {
            charge.current = Math.min(
                1,
                charge.current + dt / LAUNCH_CHARGE_SECONDS,
            );
            reportPower(charge.current);
        }
        if (previousLaunch.current && !input.launch) {
            if (inShooter && charge.current > LAUNCH_POWER_THRESHOLD) {
                const armedPower =
                    (charge.current - LAUNCH_POWER_THRESHOLD) /
                    (1 - LAUNCH_POWER_THRESHOLD);
                const powerCurve = Math.pow(armedPower, 1.12);
                const launchSpeed =
                    MIN_LAUNCH_SPEED +
                    (MAX_LAUNCH_SPEED - MIN_LAUNCH_SPEED) * powerCurve;
                const velocity = new Vector3(
                    0,
                    0,
                    -launchSpeed,
                ).applyQuaternion(FIELD_QUATERNION);
                ball.current.setLinvel(velocity, true);
            } else if (inShooter) {
                ball.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            }
            charge.current = 0;
            reportPower(0, true);
        }
        previousLaunch.current = input.launch;
        // The playfield glass limits hops. This speed cap keeps high-energy bumper contacts stable.
        const velocity = ball.current.linvel();
        const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
        if (speed > 15)
            ball.current.setLinvel(
                {
                    x: (velocity.x * 15) / speed,
                    y: (velocity.y * 15) / speed,
                    z: (velocity.z * 15) / speed,
                },
                true,
            );
    });
    return (
        <RigidBody
            ref={ball}
            name="liberty-ball"
            position={spawn.toArray()}
            colliders={false}
            ccd
            canSleep={false}
            linearDamping={0.075}
            angularDamping={0.12}
        >
            <BallCollider
                args={[0.09]}
                mass={0.08}
                restitution={0.38}
                friction={0.12}
            />
            <mesh castShadow>
                <sphereGeometry args={[0.09, 24, 24]} />
                <meshStandardMaterial
                    color="#e4ecf3"
                    metalness={1}
                    roughness={0.13}
                />
            </mesh>
        </RigidBody>
    );
}

function EditableSceneObject({
    item,
    editor,
    controls,
    gutterFlapsFlipped,
    onScore,
    onToggleFlaps,
}) {
    let object = null;

    if (item.type === "liberty") {
        object = (
            <LibertyToy
                scenePosition={item.position}
                onToggle={onToggleFlaps}
                onScore={onScore}
            />
        );
    } else if (item.type === "bumper") {
        object = (
            <Bumper
                scenePosition={item.position}
                color={item.color}
                onScore={onScore}
            />
        );
    } else if (item.type === "post") {
        object = (
            <Post
                color={item.color}
                onScore={onScore}
            />
        );
    } else if (item.type === "slingshot") {
        object = (
            <Slingshot
                side={item.side}
                onScore={onScore}
            />
        );
    } else if (item.type === "gutterFlap") {
        object = (
            <GutterFlap
                side={item.side}
                flipped={gutterFlapsFlipped}
            />
        );
    } else if (item.type === "flipper") {
        object = (
            <Flipper
                side={item.side}
                controls={controls}
                sceneRotation={item.rotation}
                editorEnabled={editor?.enabled}
            />
        );
    }

    if (!object) return null;
    return (
        <EditablePlacement
            item={item}
            editor={editor}
        >
            {object}
        </EditablePlacement>
    );
}

/** Render inside a Rapier Physics provider. Front of cabinet faces +Z. */
export default function PinballMachine({
    controls,
    onScore,
    onDrain,
    sceneObjects = SCENE_OBJECTS,
    editor,
    gutterFlapsFlipped = false,
    onToggleGutterFlaps,
    onLaunchPowerChange,
}) {
    const fallbackControls = useRef({
        left: false,
        right: false,
        launch: false,
        reset: 0,
    });
    const input = controls || fallbackControls;
    const charge = useRef(0);
    const playfieldArt = usePinballArtwork("playfield");
    const score = useCallback((points) => onScore?.(points), [onScore]);
    const toggleGutterFlaps = useCallback(
        () => onToggleGutterFlaps?.(),
        [onToggleGutterFlaps],
    );

    return (
        <group>
            {/* Legs stay vertical while the cabinet and playfield share their authentic 6.5° rake. */}
            {[-1.24, 1.24].flatMap((x) =>
                [-2.35, 2.35].map((z) => {
                    const top = FIELD_Y - 0.55 - Math.sin(TILT) * z;
                    return (
                        <group key={`${x}-${z}`}>
                            <Box
                                position={[x, top / 2, z]}
                                size={[0.115, top, 0.115]}
                                color="#b8c6d3"
                                metalness={0.9}
                                roughness={0.22}
                            />
                            <mesh position={[x, 0.03, z]}>
                                <cylinderGeometry
                                    args={[0.12, 0.13, 0.06, 20]}
                                />
                                <meshStandardMaterial
                                    color="#2e3741"
                                    metalness={0.7}
                                />
                            </mesh>
                        </group>
                    );
                }),
            )}
            <Backbox />
            <group
                position={[0, FIELD_Y, 0]}
                rotation={[TILT, 0, 0]}
            >
                <Cabinet controls={input} />
                <RigidBody
                    type="fixed"
                    colliders={false}
                >
                    {/* Explicit wall colliders preserve the CSG cavity; a convex hull would seal it. */}
                    <CuboidCollider
                        args={[1.36, 0.055, 2.49]}
                        position={[0, -0.055, -0.21]}
                        friction={0.11}
                        restitution={0.15}
                    />
                    <CuboidCollider
                        args={[0.16, 0.055, 0.27]}
                        position={[1.17, -0.055, 2.48]}
                        friction={0.1}
                    />
                    <CuboidCollider
                        args={[0.07, 0.24, 2.9]}
                        position={[-1.43, 0.03, 0]}
                        restitution={0.55}
                    />
                    <CuboidCollider
                        args={[0.07, 0.24, 2.9]}
                        position={[1.43, 0.03, 0]}
                        restitution={0.55}
                    />
                    <CuboidCollider
                        args={[1.36, 0.24, 0.07]}
                        position={[0, 0.03, -2.83]}
                        restitution={0.55}
                    />
                    <CuboidCollider
                        args={[0.17, 0.16, 0.07]}
                        position={[1.17, 0.06, 2.53]}
                        restitution={0.05}
                    />
                    <CuboidCollider
                        args={[1.35, 0.025, 2.65]}
                        position={[0, 0.48, 0]}
                        restitution={0.05}
                    />
                    <mesh
                        position={[0, -0.018, -0.07]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        receiveShadow
                    >
                        <planeGeometry args={[2.71, 5.37]} />
                        <meshStandardMaterial
                            map={playfieldArt}
                            roughness={0.32}
                            metalness={0.08}
                        />
                    </mesh>
                </RigidBody>
                {/* Right shooter lane has a continuous solid divider and a curved exit onto the top arch. */}
                <Rail
                    from={[1.08, 2.66]}
                    to={[1.08, -1.93]}
                    width={0.055}
                    height={0.29}
                />
                <Rail
                    from={[1.34, -2.12]}
                    to={[1.14, -2.49]}
                />
                <Rail
                    from={[1.14, -2.49]}
                    to={[0.72, -2.67]}
                />
                <Rail
                    from={[0.72, -2.67]}
                    to={[-0.85, -2.67]}
                />
                <Rail
                    from={[-0.85, -2.67]}
                    to={[-1.26, -2.25]}
                />
                <Rail
                    from={[-1.26, -2.25]}
                    to={[-1.26, -0.05]}
                />
                {[-0.72, -0.18, 0.36].map((x) => (
                    <Rail
                        key={x}
                        from={[x, -2.37]}
                        to={[x, -2.06]}
                        height={0.16}
                        width={0.035}
                    />
                ))}
                {sceneObjects.map((item) => (
                    <EditableSceneObject
                        key={item.id}
                        item={item}
                        editor={editor}
                        controls={input}
                        gutterFlapsFlipped={gutterFlapsFlipped}
                        onScore={score}
                        onToggleFlaps={toggleGutterFlaps}
                    />
                ))}
                {/* Inlane guides feed the flipper pivots; the outer gaps form genuine outlanes. */}
                <Rail
                    from={[-1.08, 0.17]}
                    to={[-1.08, 1.5]}
                    width={0.045}
                />
                <Rail
                    from={[-1.08, 1.5]}
                    to={[-0.88, 1.74]}
                    width={0.045}
                />
                <Rail
                    from={[0.69, 0.17]}
                    to={[0.69, 1.5]}
                    width={0.045}
                />
                <Rail
                    from={[0.69, 1.5]}
                    to={[0.64, 1.74]}
                    width={0.045}
                />
                {Array.from({ length: 5 }, (_, i) => (
                    <mesh
                        key={i}
                        position={[-0.13, 0.004, 0.05 + i * 0.25]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <circleGeometry args={[0.055, 20]} />
                        <meshStandardMaterial
                            color={i % 2 ? RED : GOLD}
                            emissive={i % 2 ? RED : GOLD}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                ))}
                <Box
                    position={[-0.2, 0.04, 2.59]}
                    size={[2.18, 0.1, 0.39]}
                    color={NAVY}
                />
                {[-0.8, -0.4, 0, 0.4].map((x) => (
                    <Star
                        key={x}
                        position={[x, 0.096, 2.6]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={0.09}
                    />
                ))}
                <Plunger charge={charge} />
            </group>
            <Ball
                controls={input}
                charge={charge}
                onDrain={onDrain}
                onLaunchPowerChange={onLaunchPowerChange}
            />
        </group>
    );
}
