"use client";
import { memo, useEffect, useRef } from "react";
import nipplejs from 'nipplejs';
import Box from "@mui/material/Box";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";

const arePropsEqual = (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

function TouchControlsBase() {

    const touchControlsEnabled = useTouchControlsStore((state) => state.enabled);

    const setTouchControls = useTouchControlsStore((state) => state.setTouchControls);
    const managerRef = useRef(null);

    useEffect(() => {
        const zone = document.getElementById('zone_joystick');
        if (!zone) return;

        // Clean up previous instance
        if (managerRef.current) managerRef.current.destroy();

        const options = {
            zone: zone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100
        };

        const manager = nipplejs.create(options);
        managerRef.current = manager;

        manager.on('move', (evt, data) => {
            if (data.direction) {
                const angle = data.angle.degree;
                // nipplejs angles: right=0, up=90, left=180, down=270

                let up = false;
                let down = false;
                let left = false;
                let right = false;

                // Overlapping ranges for 8-way movement
                // Up: 30 to 150
                if (angle >= 30 && angle <= 150) up = true;
                // Down: 210 to 330
                if (angle >= 210 && angle <= 330) down = true;
                // Left: 120 to 240
                if (angle >= 120 && angle <= 240) left = true;
                // Right: 300 to 360 or 0 to 60
                if (angle >= 300 || angle <= 60) right = true;

                const currentControls = useTouchControlsStore.getState().touchControls;

                // Only update if changed
                if (currentControls.up !== up || currentControls.down !== down || currentControls.left !== left || currentControls.right !== right) {
                    setTouchControls({
                        ...currentControls,
                        up, down, left, right
                    });
                }
            }
        });

        manager.on('end', () => {
            const currentControls = useTouchControlsStore.getState().touchControls;
            setTouchControls({
                ...currentControls,
                up: false, down: false, left: false, right: false
            });
        });

        return () => {
            if (managerRef.current) managerRef.current.destroy();
        };

    }, [touchControlsEnabled, setTouchControls]);

    if (!touchControlsEnabled) return null;

    return (
        <Box
            className="touch-controls-area"
            data-hide-in-screenshot-mode="true"
            sx={{
                position: "absolute",
                bottom: 50,
                left: "50%",
                transform: "translateX(-50%)",
                width: 150,
                height: 150,
                zIndex: 1,
                bgcolor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Box
                id="zone_joystick"
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "auto",
                    touchAction: "none",
                }}
            />
        </Box>
    );
}

const TouchControls = memo(TouchControlsBase, arePropsEqual);

export default TouchControls
