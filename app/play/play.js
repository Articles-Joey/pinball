"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import { useStore } from "@/hooks/useStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import GameMenuContent from "@/components/UI/GameMenuContent";
import { usePinballGameStore } from "@/hooks/usePinballGameStore";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), { ssr: false });
const TouchControls = dynamic(() => import("@/components/UI/TouchControls"), { ssr: false });
const controlSx = {
    m: "0.75rem",
    width: 100,
    height: 100,
    bgcolor: "rgba(0,0,0,0.25)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
    touchAction: "none",
    "& .MuiSvgIcon-root": { fontSize: "2rem" },
};

export default function UsaPinballGamePage() {
    const showMenu = useStore((state) => state.showMenu);
    const sceneKey = useStore((state) => state.sceneKey);
    const sidebar = useStore((state) => state.sidebar);
    const { isFullscreen } = useFullscreen();
    const touchControlsEnabled = useTouchControlsStore((state) => state.enabled);
    const ballsLeft = usePinballGameStore((state) => state.ballsLeft);
    const score = usePinballGameStore((state) => state.score);
    const leftPaddle = usePinballGameStore((state) => state.leftPaddle);
    const setLeftPaddle = usePinballGameStore((state) => state.setLeftPaddle);
    const rightPaddle = usePinballGameStore((state) => state.rightPaddle);
    const setRightPaddle = usePinballGameStore((state) => state.setRightPaddle);
    const setSpring = usePinballGameStore((state) => state.setSpring);

    const holdProps = (setPressed) => ({
        onPointerDown: (event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setPressed(true);
        },
        onPointerUp: () => setPressed(false),
        onPointerCancel: () => setPressed(false),
        onLostPointerCapture: () => setPressed(false),
        onKeyDown: (event) => {
            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                setPressed(true);
            }
        },
        onKeyUp: (event) => {
            if (event.key === " " || event.key === "Enter") setPressed(false);
        },
        onBlur: () => setPressed(false),
    });

    return (
        <Box
            className={["game-page", showMenu && "menu-open", isFullscreen && "fullscreen", sidebar && "show-sidebar"].filter(Boolean).join(" ")}
            id={process.env.NEXT_PUBLIC_GAME_KEY + "-game-page"}
            sx={{
                position: "relative",
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                minHeight: "100vh",
                "--top-position": "0px",
                "@media (min-width: 992px)": { flexDirection: "row", alignItems: "center" },
            }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={GameMenuContent}
                menuBarConfig={{ style: "Bar", menuBarButtonPosition: "Left" }}
                sidebarConfig={{ style: "Floating Panel" }}
            />
            <Box sx={{ zIndex: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", position: "relative", height: "calc(100vh - var(--top-position))", mr: "1rem" }}>
                {touchControlsEnabled && <TouchControls />}
                <Box id="usa-pinball-game" sx={{ border: "1px solid #000", bgcolor: "#fff", position: "absolute", inset: 0, height: "100%", width: "100%", "& canvas": { height: "100%", width: "100%" } }}>
                    <Box sx={{ position: "absolute", width: "100%", bottom: 50, zIndex: 2, display: "flex", justifyContent: "space-between", "@media (min-width: 992px)": { display: "none" } }}>
                        <ButtonBase aria-label="Left paddle" aria-pressed={leftPaddle} sx={controlSx} {...holdProps(setLeftPaddle)}><ArrowBackIcon /></ButtonBase>
                        <ButtonBase aria-label="Launch ball" sx={controlSx} {...holdProps(setSpring)}><RocketLaunchIcon /></ButtonBase>
                        <ButtonBase aria-label="Right paddle" aria-pressed={rightPaddle} sx={controlSx} {...holdProps(setRightPaddle)}><ArrowForwardIcon /></ButtonBase>
                    </Box>
                    <Box sx={{ position: "absolute", width: "100%", top: 0, zIndex: 2, display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
                        <Box sx={{ m: "0.75rem" }} />
                        <Box sx={{ display: "flex", bgcolor: "#000", color: "#fff", px: "0.25rem" }}>
                            <Box sx={{ fontWeight: 700 }}>Score: {score}</Box>
                            <Box sx={{ px: "0.25rem" }}>-</Box>
                            <Box sx={{ fontWeight: 700 }}>Balls Left: {ballsLeft}</Box>
                        </Box>
                        <Box />
                    </Box>
                    <GameCanvas key={sceneKey} />
                </Box>
            </Box>
        </Box>
    );
}
