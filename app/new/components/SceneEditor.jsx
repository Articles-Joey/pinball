"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

const fieldSx = {
    "& .MuiInputBase-input": {
        px: 1,
        py: 0.8,
        fontSize: ".78rem",
        fontVariantNumeric: "tabular-nums",
    },
};

function VectorFields({ label, values, onChange, degrees = false }) {
    const displayValues = degrees
        ? values.map((value) => (value * 180) / Math.PI)
        : values;

    return (
        <Box>
            <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,.58)", fontWeight: 800 }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 0.75,
                    mt: 0.5,
                }}
            >
                {displayValues.map((value, index) => (
                    <TextField
                        key={index}
                        type="number"
                        size="small"
                        label={["X", "Y", "Z"][index]}
                        value={Number(value.toFixed(3))}
                        onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isFinite(next))
                                onChange(
                                    index,
                                    degrees ? (next * Math.PI) / 180 : next,
                                );
                        }}
                        slotProps={{ htmlInput: { step: degrees ? 1 : 0.01 } }}
                        sx={fieldSx}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default function SceneEditor({
    enabled,
    objects,
    selectedId,
    onToggle,
    onSelect,
    onUpdate,
    onRunTrigger,
}) {
    const [saveState, setSaveState] = useState("idle");
    const selected = useMemo(
        () => objects.find((object) => object.id === selectedId) || null,
        [objects, selectedId],
    );

    if (process.env.NODE_ENV !== "development") return null;

    const updateVector = (field, index, value) => {
        if (!selected) return;
        const vector = [...selected[field]];
        vector[index] = value;
        onUpdate(selected.id, { [field]: vector });
    };

    const saveLayout = async () => {
        setSaveState("saving");
        try {
            const response = await fetch("/new/api/layout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ objects }),
            });
            if (!response.ok) throw new Error(await response.text());
            setSaveState("saved");
        } catch (error) {
            console.error("Unable to save pinball scene layout", error);
            setSaveState("error");
        }
    };

    if (!enabled) {
        return (
            <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={onToggle}
                sx={{
                    position: "absolute",
                    left: { xs: 12, sm: 20, md: 28 },
                    top: { xs: 78, sm: 125 },
                    zIndex: 5,
                    color: "white",
                    bgcolor: "rgba(7,27,56,.86)",
                    border: "1px solid rgba(255,255,255,.24)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { bgcolor: "#173b62" },
                }}
            >
                Editor
            </Button>
        );
    }

    return (
        <Box
            sx={{
                position: "absolute",
                top: { xs: 70, sm: 82 },
                right: { xs: 10, sm: 20 },
                zIndex: 6,
                width: { xs: "calc(100% - 20px)", sm: 340 },
                maxHeight: "calc(100dvh - 170px)",
                overflowY: "auto",
                p: 2,
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,.24)",
                bgcolor: "rgba(3,10,24,.92)",
                boxShadow: "0 18px 60px rgba(0,0,0,.5)",
                backdropFilter: "blur(16px)",
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
                <Box>
                    <Typography sx={{ color: "white", fontWeight: 900 }}>
                        Playfield editor
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,.58)" }}
                    >
                        Development only
                    </Typography>
                </Box>
                <Button
                    size="small"
                    onClick={onToggle}
                    sx={{ color: "white" }}
                >
                    Close
                </Button>
            </Stack>

            <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,.72)", my: 1.5 }}
            >
                Click and drag an object across the playfield. Click a logic
                object without dragging to preview its links.
            </Typography>

            <FormControl
                fullWidth
                size="small"
            >
                <InputLabel id="scene-object-label">Scene object</InputLabel>
                <Select
                    labelId="scene-object-label"
                    label="Scene object"
                    value={selectedId || ""}
                    onChange={(event) => onSelect(event.target.value)}
                >
                    {objects.map((object) => (
                        <MenuItem
                            key={object.id}
                            value={object.id}
                        >
                            {object.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selected && (
                <Stack
                    spacing={1.5}
                    sx={{ mt: 1.5 }}
                >
                    <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ flexWrap: "wrap" }}
                    >
                        <Chip
                            size="small"
                            label={selected.type}
                            color="primary"
                        />
                        <Chip
                            size="small"
                            label={selected.id}
                            variant="outlined"
                        />
                    </Stack>

                    <VectorFields
                        label="Position"
                        values={selected.position}
                        onChange={(index, value) =>
                            updateVector("position", index, value)
                        }
                    />
                    <VectorFields
                        label="Rotation (degrees)"
                        values={selected.rotation}
                        degrees
                        onChange={(index, value) =>
                            updateVector("rotation", index, value)
                        }
                    />

                    {selected.logic && (
                        <Box
                            sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                bgcolor: "rgba(36,105,184,.16)",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: "#9ac7ff", fontWeight: 900 }}
                            >
                                {selected.logic.trigger.toUpperCase()} TRIGGER
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ flexWrap: "wrap", my: 1 }}
                            >
                                {selected.logic.targets.map((target) => (
                                    <Chip
                                        key={target}
                                        size="small"
                                        label={target}
                                        sx={{ color: "white" }}
                                    />
                                ))}
                            </Stack>
                            <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<PlayArrowRoundedIcon />}
                                onClick={() => onRunTrigger(selected)}
                            >
                                Preview linked action
                            </Button>
                        </Box>
                    )}
                </Stack>
            )}

            <Divider sx={{ my: 1.5 }} />

            {saveState === "saved" && (
                <Alert
                    severity="success"
                    sx={{ mb: 1 }}
                >
                    Saved to sceneLayout.js
                </Alert>
            )}
            {saveState === "error" && (
                <Alert
                    severity="error"
                    sx={{ mb: 1 }}
                >
                    The layout could not be saved.
                </Alert>
            )}
            <Button
                fullWidth
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                disabled={saveState === "saving"}
                onClick={saveLayout}
                sx={{ bgcolor: "#b31942", "&:hover": { bgcolor: "#d22f52" } }}
            >
                {saveState === "saving" ? "Saving…" : "Save layout to file"}
            </Button>
        </Box>
    );
}
