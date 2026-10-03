"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import ViewUserModal from "./ViewUserModal";
import ArticlesModal from "./ArticlesModal";
import ArticlesSwitch from "./ArticlesSwitch";
import ArticlesButton from "./Button";
import useGameScoreboard from "@/hooks/useGameScoreboard";

export default function GameScoreboard({ game, reloadScoreboard, setReloadScoreboard }) {
    const [showSettings, setShowSettings] = useState(false);
    const [visible, setVisible] = useState(false);
    const { data: scoreboard, mutate: scoreboardMutate } = useGameScoreboard({ game });

    useEffect(() => {
        if (reloadScoreboard) {
            setReloadScoreboard(false);
            scoreboardMutate();
        }
    }, [reloadScoreboard, setReloadScoreboard, scoreboardMutate]);

    return (
        <Box sx={{ mt: "1rem", mb: "1rem", maxWidth: 300, width: "100%", "@media (min-width: 992px)": { mt: 0, mb: 0, display: "block", position: "absolute", left: "1rem", top: "50%" } }}>
            <ArticlesModal show={showSettings} setShow={setShowSettings} title="Scoreboard Settings">
                <FormControlLabel
                    sx={{ m: 0, display: "flex", justifyContent: "space-between" }}
                    labelPlacement="start"
                    label={<Box sx={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><EmojiEventsIcon fontSize="small" />Join Scoreboard?</Box>}
                    control={<ArticlesSwitch checked={visible} setChecked={setVisible} />}
                />
            </ArticlesModal>
            <Card sx={{ bgcolor: "game.card", borderRadius: 0, border: 1, borderColor: "divider", mb: "1rem", "@media (min-width: 992px)": { mb: 0 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "0.5rem", borderBottom: 1, borderColor: "divider" }}>
                    <Box component="span">{game} Scoreboard</Box>
                    <ArticlesButton small aria-label="Refresh scoreboard" onClick={() => scoreboardMutate()}><RefreshIcon fontSize="small" /></ArticlesButton>
                </Box>
                <Box>
                    {!scoreboard?.length && <Box sx={{ fontSize: "0.875em", p: "0.5rem" }}>No scores yet</Box>}
                    {scoreboard?.map((doc, i) => (
                        <Box key={doc._id} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderBottom: 1, borderColor: "divider", p: "0.5rem" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", lineHeight: 1.25 }}>
                                <Box sx={{ display: "flex" }}>
                                    <Typography component="h5" sx={{ m: 0, mr: "1rem", fontSize: "1.25rem" }}>{i + 1}</Typography>
                                    <Box sx={{ lineHeight: 1.25 }}><ViewUserModal populated_user={doc.populated_user} user_id={doc.user_id} /></Box>
                                </Box>
                                <Typography component="h5" sx={{ m: 0, fontSize: "1.25rem" }}>{doc.score || doc.total}</Typography>
                            </Box>
                            {doc.last_play && doc.public_last_play && <Box component="small" sx={{ mt: "0.25rem", fontSize: "0.75rem" }}>Played: {format(new Date(doc.last_play), "MM/d/yy hh:mmaa")}</Box>}
                        </Box>
                    ))}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "0.5rem", borderTop: 1, borderColor: "divider" }}>
                    <Box sx={{ fontSize: "0.875em" }}>Play to get on the board!</Box>
                    <ArticlesButton small aria-label="Scoreboard settings" onClick={() => setShowSettings(true)}><SettingsIcon fontSize="small" /></ArticlesButton>
                </Box>
            </Card>
        </Box>
    );
}
