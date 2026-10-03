"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

export default function IsDev({ className, noOutline, children, inline }) {
    const userReduxState = false;
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (!children || !userReduxState?.roles?.isDev || !isMounted) return null;

    return (
        <Box className={className} sx={{ display: inline ? "inline-block" : "block", outline: noOutline ? "none" : "1px dashed #ffb7b7" }}>
            {children}
        </Box>
    );
}
