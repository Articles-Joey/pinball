"use client";

import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { bootstrapCompatibilityTheme } from "@articles-media/articles-dev-box/bootstrapCompatibilityTheme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export function createAppTheme(mode = "dark") {
    const cardBackground = mode === "dark" ? "#313131" : "#fff";

    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            primary: { main: "#f9edcd" },
            game: { card: cardBackground },
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { fontSize: "0.7rem", whiteSpace: "pre" },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        variants: [{
                            props: { severity: "info" },
                            style: { backgroundColor: "#60a5fa" },
                        }],
                    },
                },
            },
            MuiCssBaseline: {
                // Dev-box still uses these compatibility utilities internally.
                styleOverrides: (muiTheme) => {
                    const compatibilityStyles = bootstrapCompatibilityTheme.MuiCssBaseline.styleOverrides(muiTheme);
                    return {
                        ...compatibilityStyles,
                        ":root": {
                            ...compatibilityStyles[":root"],
                            "--articles-theme-primary": mode === "dark" ? "rgba(249,237,205,0.25)" : "#f9edcd",
                            "--articles-primary-color": "#adafb3",
                            "--articles-primary-color-rgb": "173, 175, 179",
                            "--articles-primary-color-opacity-half": "rgba(173,175,179,0.5)",
                            "--articles-secondary-color": "#f9edcd",
                            "--articles-secondary-color-rgb": "249, 237, 205",
                            "--articles-secondary-color-opacity-half": "rgba(249,237,205,0.5)",
                            "--background-color": mode === "dark" ? "rgba(49,49,49,0.75)" : "rgba(218,224,230,0.5)",
                            "--card-background": cardBackground,
                            "--card-background-item": mode === "dark" ? "#232323" : "#ebebeb",
                            "--card-background-75": mode === "dark" ? "rgba(49,49,49,0.75)" : "rgba(255,255,255,0.75)",
                            "--card-background-50": mode === "dark" ? "rgba(49,49,49,0.5)" : "rgba(255,255,255,0.5)",
                            "--articles-news-and-proposals-modal-width": "1500px",
                            "--card-background-override": cardBackground,
                            "--articles-card-font-color": mode === "dark" ? "#fff" : "#212529",
                        },
                        ".stats-overlay": {
                            position: "fixed",
                            top: 0,
                            right: "0 !important",
                            left: "initial !important",
                            zIndex: 4,
                        },
                    };
                },
            },
        },
    });
}

export default createAppTheme();
