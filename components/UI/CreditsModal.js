"use client";

import Box from "@mui/material/Box";
import ArticlesModal from "./ArticlesModal";

export default function CreditsModal({ show, setShow }) {
    return (
        <ArticlesModal show={show} setShow={setShow} title="Credits">
            <Box sx={{ display: "flex", flexDirection: "column", p: "1rem" }}>Test</Box>
        </ArticlesModal>
    );
}
