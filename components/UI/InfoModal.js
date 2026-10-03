"use client";

import Box from "@mui/material/Box";
import ArticlesModal from "./ArticlesModal";

export default function GameInfoModal({ show, setShow }) {
    return (
        <ArticlesModal show={show} setShow={setShow} title="Game Info" contentSx={{ p: 0 }}>
            <Box sx={{ p: "1rem" }} />
        </ArticlesModal>
    );
}
