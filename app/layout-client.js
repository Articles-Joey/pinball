"use client"
import { useEffect } from "react";
// import { useStore } from "@/hooks/useStore";
import { usePinballGameStore } from "@/hooks/usePinballGameStore";

export default function LayoutClient({ children }) {

    const theme = usePinballGameStore(state => state.theme);
    // const darkMode = useStore(state => state.darkMode)
    // const setDarkMode = useStore(state => state.setDarkMode)

    useEffect(() => {

        if (theme == null) {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            usePinballGameStore.getState().setTheme(prefersDark ? "Dark" : "Light");
        }

        if (theme == "Dark") {
            document.body.setAttribute("data-bs-theme", 'dark');
        } else {
            document.body.setAttribute("data-bs-theme", 'light');
        }

    }, [theme]);

    return (
        <>
        </>
    );
}
