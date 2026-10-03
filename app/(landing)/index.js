"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import ArticlesButton from "@/components/UI/Button";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import { usePinballGameStore } from "@/hooks/usePinballGameStore";
import { useStore } from "@/hooks/useStore";

const MachinePreviewCanvas = dynamic(() => import("@/components/Game/MachinePreviewCanvas"), { ssr: false });
const LandingSceneCanvas = dynamic(() => import("@/components/Game/LandingSceneCanvas"), { ssr: false });
const ReturnToLauncherButton = dynamic(
    () => import("@articles-media/articles-dev-box/ReturnToLauncherButton"),
    { ssr: false },
);

const pinballMachines = [
    { name: "USA Pinball", preview: process.env.NEXT_PUBLIC_CDN + "games/Pinball/usa-pinball-thumbnail.jpg" },
    { name: "Space Pinball", preview: process.env.NEXT_PUBLIC_CDN + "games/Pinball/space-pinball-thumbnail.webp" },
    { name: "H3H3 Pinball", preview: process.env.NEXT_PUBLIC_CDN + "games/Pinball/h3-pinball-thumbnail.jpg" },
    { name: "Articles Pinball", preview: process.env.NEXT_PUBLIC_CDN + "games/Pinball/articles-pinball-thumbnail.webp", locked: true },
    { name: "Nature Pinball", preview: process.env.NEXT_PUBLIC_CDN + "games/Pinball/nature-pinball-thumbnail.webp", locked: true },
    { name: "Ocean Pinball", preview: process.env.NEXT_PUBLIC_CDN + "games/Pinball/ocean-pinball-thumbnail.webp", locked: true },
];

const desktop = "@media (min-width: 992px)";
const cardSx = {
    display: "flex",
    flexDirection: "column",
    bgcolor: "game.card",
    borderRadius: 0,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)",
};
const headerSx = { display: "flex", alignItems: "center", p: "0.5rem", borderBottom: 1, borderColor: "divider", fontSize: "0.85rem" };
const footerSx = { display: "flex", flexWrap: "wrap", justifyContent: "center", p: "0.5rem", borderTop: 1, borderColor: "divider" };

export default function PinballLandingPage() {
    const machine = usePinballGameStore((state) => state.machine);
    const setMachine = usePinballGameStore((state) => state.setMachine);
    const { isFullscreen, requestFullscreen } = useFullscreen();
    const landingAnimation = useStore((state) => state.landingAnimation);

    return (
        <Box
            id="pinball-landing-page"
            sx={{
                position: "relative",
                isolation: "isolate",
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                minHeight: "100vh",
                [desktop]: { flexDirection: "row" },
            }}
        >
            {landingAnimation && (
                <Box sx={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: -1 }}>
                    <Suspense fallback={null}><LandingSceneCanvas /></Suspense>
                </Box>
            )}
            <Box
                component="img"
                src={process.env.NEXT_PUBLIC_CDN + "games/Pinball/pinball-landing-background.webp"}
                alt=""
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -3 }}
            />
            <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.75)", zIndex: -2 }} />
            <Box
                sx={{
                    display: isFullscreen ? "none" : "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: "1rem",
                    width: "100%",
                    [desktop]: { flexDirection: "row", width: "auto", alignItems: "stretch" },
                }}
            >
                <Card sx={{
                    ...cardSx,
                    width: "100%",
                    height: "calc(40vh - 1rem)",
                    mb: "0.25rem",
                    [desktop]: { width: "30rem", mb: 0, ml: "1rem", height: "calc(60vh - 1.25rem)" },
                }}>
                    <Box sx={headerSx}>Machine preview</Box>
                    <Box sx={{ flexGrow: 1, minHeight: 0, position: "relative" }}>
                        <Box sx={{ position: "absolute", inset: 0, bgcolor: "#000", p: "0.5rem", "& canvas": { width: "100% !important", height: "100% !important" } }}>
                            <MachinePreviewCanvas key={machine} />
                        </Box>
                    </Box>
                    <Box sx={footerSx}>
                        <ArticlesButton
                            component={Link}
                            href={{ pathname: "/play", query: { machine } }}
                            sx={{ width: "100%" }}
                            small
                            disabled={machine !== "USA Pinball"}
                        >
                            Play
                        </ArticlesButton>
                    </Box>
                </Card>

                <Card sx={{
                    ...cardSx,
                    width: "100%",
                    height: "calc(60vh - 1.25rem)",
                    [desktop]: { width: "30rem", mb: 0, mr: "1rem" },
                }}>
                    <Box sx={headerSx}>Select a machine to continue</Box>
                    <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "auto" }}>
                        <Box sx={{ display: "grid", gap: "5px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", height: "auto", overflowY: "auto", [desktop]: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" } }}>
                            {pinballMachines.map((obj) => (
                                <Box key={obj.name} sx={{ p: "0.5rem", border: "1px solid rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", fontSize: "0.85rem", minWidth: 0 }}>
                                    <Box sx={{ aspectRatio: "1", width: "100%", bgcolor: "#000", mb: "0.5rem" }}>
                                        {obj.preview && <Box component="img" src={obj.preview} alt={obj.name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                                    </Box>
                                    <Typography sx={{ mb: "0.5rem", fontSize: "inherit" }}>{obj.name}</Typography>
                                    <Box sx={{ display: "flex", width: "100%" }}>
                                        <ArticlesButton small active={obj.name === machine} sx={{ width: "100%", flexGrow: 1 }} onClick={() => setMachine(obj.name)}>Select</ArticlesButton>
                                        <ArticlesButton component={Link} href="/play" small sx={{ width: "100%" }} onClick={() => setMachine(obj.name)} startIcon={<PlayArrowIcon />}>Play</ArticlesButton>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box sx={footerSx}>
                        <GameMenuPrimaryButtonGroup useStore={useStore} type="Landing" useRouter={useRouter} />
                        <Box sx={{ display: "flex", mt: "1rem", width: "100%" }}>
                            <Box sx={{ width: "50%" }}><ReturnToLauncherButton /></Box>
                            <ArticlesButton small sx={{ width: "50%" }} onClick={() => requestFullscreen()} startIcon={<WallpaperIcon />}>Wallpaper Mode</ArticlesButton>
                        </Box>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

