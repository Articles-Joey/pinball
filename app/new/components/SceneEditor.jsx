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
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
    inchesToSceneUnits,
    PLAYFIELD_LENGTH_INCHES,
    PLAYFIELD_WIDTH_INCHES,
    sceneUnitsToInches,
} from "./machineDimensions";

const fieldSx = {
    "& .MuiInputBase-input": {
        px: 1,
        py: 0.8,
        fontSize: ".78rem",
        fontVariantNumeric: "tabular-nums",
    },
};

const LEFT_GUTTER_VISUAL_Z_OFFSET = 0.27;

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
    onResetPosition,
    onSaved,
    spawnBallMode,
    testBallCount,
    onSpawnBallModeChange,
    onClearTestBalls,
}) {
    const [saveState, setSaveState] = useState("idle");
    const selected = useMemo(
        () => objects.find((object) => object.id === selectedId) || null,
        [objects, selectedId],
    );
    const gutterFlaps = useMemo(
        () => ({
            left: objects.find(
                (object) =>
                    object.type === "gutterFlap" && object.side === "left",
            ),
            right: objects.find(
                (object) =>
                    object.type === "gutterFlap" && object.side === "right",
            ),
        }),
        [objects],
    );
    const sharedGutterVisualZ = gutterFlaps.right
        ? gutterFlaps.right.position[2]
        : (gutterFlaps.left?.position[2] ?? 0) +
          LEFT_GUTTER_VISUAL_Z_OFFSET;

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
            onSaved?.(objects);
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
                {spawnBallMode
                    ? "Placement mode: click anywhere on the playfield to drop a live physics-test ball."
                    : selected
                      ? "Drag the selected object to move it. Walls expose endpoint scale handles."
                      : "Camera mode: drag to orbit, right-drag to pan, and scroll to zoom."}
            </Typography>

            <Stack
                direction="row"
                spacing={0.75}
                sx={{ mb: 1.5, flexWrap: "wrap" }}
            >
                <Chip
                    size="small"
                    label={`${PLAYFIELD_WIDTH_INCHES}\" wide`}
                    sx={{ color: "white" }}
                />
                <Chip
                    size="small"
                    label={`${PLAYFIELD_LENGTH_INCHES}\" long`}
                    sx={{ color: "white" }}
                />
            </Stack>

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
                    <MenuItem value="">
                        <em>Nothing selected — camera mode</em>
                    </MenuItem>
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

            <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 1 }}
            >
                <Button
                    fullWidth
                    size="small"
                    variant={!selectedId && !spawnBallMode ? "contained" : "outlined"}
                    onClick={() => {
                        onSpawnBallModeChange(false);
                        onSelect(null);
                    }}
                >
                    Camera / Deselect
                </Button>
                <Button
                    fullWidth
                    size="small"
                    variant={spawnBallMode ? "contained" : "outlined"}
                    color={spawnBallMode ? "warning" : "primary"}
                    onClick={() =>
                        onSpawnBallModeChange(!spawnBallMode)
                    }
                >
                    {spawnBallMode ? "Placing balls" : "Place test balls"}
                </Button>
            </Stack>

            {testBallCount > 0 && (
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ mt: 1, alignItems: "center" }}
                >
                    <Chip
                        size="small"
                        color="warning"
                        label={`${testBallCount} test ball${testBallCount === 1 ? "" : "s"}`}
                    />
                    <Button
                        size="small"
                        onClick={onClearTestBalls}
                        sx={{ color: "rgba(255,255,255,.78)" }}
                    >
                        Clear balls
                    </Button>
                </Stack>
            )}

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
                        {selected.type === "wall" && (
                            <Chip
                                size="small"
                                label="Endpoint scale mode"
                                sx={{ color: "#071b38", bgcolor: "#e6b862" }}
                            />
                        )}
                    </Stack>

                    <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={<RestartAltRoundedIcon />}
                        onClick={() => onResetPosition(selected.id)}
                    >
                        Reset saved position
                    </Button>

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

                    {selected.type === "gutterFlap" && (
                        <Box
                            sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                border: "1px solid rgba(85,215,255,.4)",
                                bgcolor: "rgba(36,105,184,.13)",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: "#9de7ff", fontWeight: 900 }}
                            >
                                SHARED GUTTER POSITION
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                size="small"
                                label="Shared visual Z"
                                value={Number(sharedGutterVisualZ.toFixed(3))}
                                onChange={(event) => {
                                    const nextZ = Number(event.target.value);
                                    const target =
                                        gutterFlaps.right || gutterFlaps.left;
                                    if (!target || !Number.isFinite(nextZ))
                                        return;
                                    onUpdate(target.id, {
                                        position: [
                                            target.position[0],
                                            target.position[1],
                                            target.side === "left"
                                                ? nextZ -
                                                  LEFT_GUTTER_VISUAL_Z_OFFSET
                                                : nextZ,
                                        ],
                                    });
                                }}
                                slotProps={{ htmlInput: { step: 0.01 } }}
                                sx={{ ...fieldSx, mt: 1 }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    mt: 0.75,
                                    color: "rgba(255,255,255,.62)",
                                }}
                            >
                                Updates both flaps together while compensating
                                for the left flap&apos;s flipped starting pose.
                            </Typography>
                        </Box>
                    )}

                    {selected.type === "wall" && (
                        <Box
                            sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                border: "1px solid rgba(230,184,98,.45)",
                                bgcolor: "rgba(230,184,98,.1)",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: "#f5d68c", fontWeight: 900 }}
                            >
                                WALL LENGTH
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                size="small"
                                label="Length (inches)"
                                value={Number(
                                    sceneUnitsToInches(
                                        selected.length || 0,
                                    ).toFixed(2),
                                )}
                                onChange={(event) => {
                                    const inches = Number(event.target.value);
                                    if (Number.isFinite(inches) && inches >= 1)
                                        onUpdate(selected.id, {
                                            length: inchesToSceneUnits(inches),
                                        });
                                }}
                                slotProps={{ htmlInput: { step: 0.25, min: 1 } }}
                                sx={{ ...fieldSx, mt: 1 }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    mt: 0.75,
                                    color: "rgba(255,255,255,.62)",
                                }}
                            >
                                Blue and gold handles resize one end at a time.
                            </Typography>
                        </Box>
                    )}

                    {selected.type === "topArch" && (
                        <Box
                            sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                border: "1px solid rgba(85,215,255,.4)",
                                bgcolor: "rgba(36,105,184,.13)",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: "#9de7ff", fontWeight: 900 }}
                            >
                                ARCH DIMENSIONS
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 1 }}
                            >
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    label="Length (inches)"
                                    value={Number(
                                        sceneUnitsToInches(
                                            selected.length || 2.54,
                                        ).toFixed(2),
                                    )}
                                    onChange={(event) => {
                                        const inches = Number(
                                            event.target.value,
                                        );
                                        if (
                                            Number.isFinite(inches) &&
                                            inches >= 6.75
                                        )
                                            onUpdate(selected.id, {
                                                length: inchesToSceneUnits(
                                                    inches,
                                                ),
                                            });
                                    }}
                                    slotProps={{
                                        htmlInput: {
                                            step: 0.25,
                                            min: 6.75,
                                            max: 30,
                                        },
                                    }}
                                    sx={fieldSx}
                                />
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    label="Width (inches)"
                                    value={Number(
                                        sceneUnitsToInches(
                                            selected.width || 0.65,
                                        ).toFixed(2),
                                    )}
                                    onChange={(event) => {
                                        const inches = Number(
                                            event.target.value,
                                        );
                                        if (
                                            Number.isFinite(inches) &&
                                            inches >= 1.35
                                        )
                                            onUpdate(selected.id, {
                                                width: inchesToSceneUnits(
                                                    inches,
                                                ),
                                            });
                                    }}
                                    slotProps={{
                                        htmlInput: {
                                            step: 0.25,
                                            min: 1.35,
                                            max: 15,
                                        },
                                    }}
                                    sx={fieldSx}
                                />
                            </Stack>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    mt: 0.75,
                                    color: "rgba(255,255,255,.62)",
                                }}
                            >
                                Length controls the span; width controls how far
                                the oval curves into the playfield.
                            </Typography>
                        </Box>
                    )}

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
