"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import ArticlesModal from "./ArticlesModal";
import ArticlesButton from "./Button";

const keyBindings = [
    { action: "Left Paddle", defaultKeyboardKey: "A" },
    { action: "Right Paddle", defaultKeyboardKey: "D" },
    { action: "Launch Ball", defaultKeyboardKey: "Space" },
];

export default function PinballSettingsModal({ show, setShow }) {
    const [tab, setTab] = useState("Controls");

    return (
        <ArticlesModal
            show={show}
            setShow={setShow}
            title="Game Settings"
            centered={false}
            contentSx={{ p: 0 }}
            footerOverride={(setOpen) => (
                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <ArticlesButton variant="outline-dark" onClick={() => setOpen(false)}>Close</ArticlesButton>
                    <ArticlesButton variant="outline-danger" onClick={() => setOpen(false)}>Reset</ArticlesButton>
                </Box>
            )}
        >
            <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Settings categories">
                {["Controls", "Audio", "Chat"].map((item) => <Tab key={item} value={item} label={item} />)}
            </Tabs>
            <Divider />
            <Box sx={{ p: "0.5rem" }}>
                {tab === "Controls" && keyBindings.map((binding) => (
                    <Box key={binding.action} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: 1, borderColor: "divider", pb: "0.25rem", mb: "0.25rem" }}>
                        <Box>{binding.action}</Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Chip size="small" label={binding.defaultKeyboardKey} />
                            <ArticlesButton small>Change Key</ArticlesButton>
                        </Box>
                    </Box>
                ))}
                {tab === "Audio" && (
                    <>
                        <Typography id="game-volume-label">Game Volume</Typography>
                        <Slider aria-labelledby="game-volume-label" defaultValue={50} />
                        <Typography id="music-volume-label">Music Volume</Typography>
                        <Slider aria-labelledby="music-volume-label" defaultValue={50} />
                    </>
                )}
                {tab === "Chat" && (
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <FormControlLabel control={<Switch />} label="Game chat panel" />
                        <FormControlLabel control={<Switch />} label="Censor chat" />
                        <FormControlLabel control={<Switch />} label="Game chat speech bubbles" />
                    </Box>
                )}
            </Box>
        </ArticlesModal>
    );
}
