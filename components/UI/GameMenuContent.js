"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { format } from "date-fns";
import ArticlesButton from "./Button";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import { usePinballGameStore } from "@/hooks/usePinballGameStore";
import { useStore } from "@/hooks/useStore";

const cardSx = { mb: "1rem", bgcolor: "game.card", borderRadius: 0, border: 1, borderColor: "divider", boxShadow: "0 0 0 1px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)" };
const sectionSx = { p: "0.5rem", borderBottom: 1, borderColor: "divider" };

export default function GameMenuContent() {
    const storeReloadScene = useStore((state) => state.reloadScene);
    const score = usePinballGameStore((state) => state.score);
    const setScore = usePinballGameStore((state) => state.setScore);
    const ballsLeft = usePinballGameStore((state) => state.ballsLeft);
    const setBallsLeft = usePinballGameStore((state) => state.setBallsLeft);
    const recentGames = usePinballGameStore((state) => state.recentGames);
    const setRecentGames = usePinballGameStore((state) => state.setRecentGames);
    const personalBest = useMemo(() => (recentGames || []).slice().sort((a, b) => b.score - a.score).slice(0, 5), [recentGames]);
    const mostRecentGames = useMemo(() => (recentGames || []).slice(-5).sort((a, b) => b.date - a.date), [recentGames]);

    const reloadScene = () => {
        setScore(0);
        setBallsLeft(2);
        storeReloadScene();
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", mb: "1rem" }}>
                <GameMenuPrimaryButtonGroup useStore={useStore} type="GameMenu" useRouter={useRouter} />
            </Box>
            <Card sx={cardSx}>
                <Box sx={sectionSx}>Balls Left: {ballsLeft}</Box>
                <Box sx={sectionSx}>Current Score: {score}</Box>
                <Box sx={{ p: "0.5rem" }}>
                    <ArticlesButton small sx={{ width: "100%" }} onClick={reloadScene} startIcon={<RestartAltIcon />}>Reset Game</ArticlesButton>
                </Box>
            </Card>
            <Card sx={cardSx}>
                <Box sx={sectionSx}>Personal Scores</Box>
                <Box sx={{ ...sectionSx, textAlign: "center" }}>
                    <Box sx={{ fontSize: "0.875em" }}>Most Recent Games - {recentGames?.length || 0}</Box>
                    {mostRecentGames.map((game, i) => <Box key={i} sx={{ fontSize: "0.875em" }}>{game.score} - {format(game.date, "MM/dd/yy hh:mmaa")}</Box>)}
                </Box>
                <Box sx={{ ...sectionSx, textAlign: "center" }}>
                    <Box sx={{ fontSize: "0.875em" }}>Personal Best</Box>
                    {personalBest.map((game, i) => <Box key={i} sx={{ fontSize: "0.875em" }}>{game.score} - {format(game.date, "MM/dd/yy hh:mmaa")}</Box>)}
                </Box>
                <Box sx={{ p: "0.5rem" }}>
                    <ArticlesButton small sx={{ width: "100%" }} onClick={() => setRecentGames([])} startIcon={<RestartAltIcon />}>Reset Scores</ArticlesButton>
                </Box>
            </Card>
        </Box>
    );
}
