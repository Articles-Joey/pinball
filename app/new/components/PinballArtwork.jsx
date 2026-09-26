"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace, Shape } from "three";

const INK = "#071b38";
const CREAM = "#fff0d0";
const RED = "#db3043";

function star(ctx, x, y, radius, color = CREAM) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 ? radius * 0.43 : radius;
        ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function label(ctx, text, x, y, size, color = CREAM) {
    ctx.fillStyle = color;
    ctx.font = `900 ${size}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

function flag(ctx, x, y, w, h) {
    for (let i = 0; i < 13; i++) {
        ctx.fillStyle = i % 2 ? CREAM : RED;
        ctx.fillRect(x, y + (h * i) / 13, w, h / 13 + 1);
    }
    ctx.fillStyle = INK;
    ctx.fillRect(x, y, w * 0.4, (h * 7) / 13);
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < (row % 2 ? 5 : 6); col++) {
            star(
                ctx,
                x + w * (0.034 + col * 0.066 + (row % 2 ? 0.033 : 0)),
                y + h * (0.031 + row * 0.059),
                h * 0.021,
            );
        }
    }
}

function eagle(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.fillStyle = "#e6b862";
    ctx.beginPath();
    ctx.moveTo(0, 0.2);
    ctx.lineTo(-0.95, -0.36);
    ctx.lineTo(-0.78, 0.15);
    ctx.lineTo(-0.63, 0.02);
    ctx.lineTo(-0.55, 0.34);
    ctx.lineTo(-0.4, 0.16);
    ctx.lineTo(-0.2, 0.54);
    ctx.lineTo(0, 0.35);
    ctx.lineTo(0.2, 0.54);
    ctx.lineTo(0.4, 0.16);
    ctx.lineTo(0.55, 0.34);
    ctx.lineTo(0.63, 0.02);
    ctx.lineTo(0.78, 0.15);
    ctx.lineTo(0.95, -0.36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    ctx.arc(0, 0.08, 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e6b862";
    ctx.beginPath();
    ctx.moveTo(0.06, 0.03);
    ctx.lineTo(0.3, 0.12);
    ctx.lineTo(0.08, 0.19);
    ctx.fill();
    ctx.restore();
}

function drawBackglass(ctx, w, h) {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 15; i++) {
        ctx.fillStyle = i % 2 ? "#a8253e" : "#f2dfb5";
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.8);
        ctx.lineTo((i * w) / 7 - w * 0.6, 0);
        ctx.lineTo(((i + 1) * w) / 7 - w * 0.6, 0);
        ctx.fill();
    }
    ctx.fillStyle = "#071b38e8";
    ctx.fillRect(35, 80, w - 70, h - 145);
    for (let i = 0; i < 7; i++) star(ctx, 160 + i * 118, 125, 17);
    label(ctx, "LIBERTY", w / 2, 285, 157);
    label(ctx, "PINBALL", w / 2, 365, 68, "#e6b862");
    eagle(ctx, w / 2, 433, 220);
    label(ctx, "COAST TO COAST · EST. 1776", w / 2, 585, 28);
}

function drawPlayfield(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#173b62");
    gradient.addColorStop(0.5, "#092844");
    gradient.addColorStop(1, "#081a35");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    // Printed playfield artwork: the physical lane dividers sit above these lines.
    ctx.strokeStyle = "#d4aa62";
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    for (let i = 0; i < 13; i++) {
        ctx.strokeStyle = i % 2 ? "#e7dab6" : "#b42e43";
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(55 + i * 39, h * 0.55);
        ctx.bezierCurveTo(
            10 + i * 42,
            h * 0.73,
            40 + i * 40,
            h * 0.88,
            15 + i * 45,
            h,
        );
        ctx.stroke();
    }
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++)
            star(ctx, 95 + col * 110, 130 + row * 160, 9, "#e5c580");
    }
    ctx.fillStyle = "#071b38df";
    ctx.beginPath();
    ctx.ellipse(w * 0.46, h * 0.58, 220, 230, 0, 0, Math.PI * 2);
    ctx.fill();
    eagle(ctx, w * 0.46, h * 0.48, 200);
    label(ctx, "LIBERTY", w * 0.46, h * 0.62, 71);
    label(ctx, "1776", w * 0.46, h * 0.67, 60, "#e6b862");
    label(ctx, "THE AMERICAN ROAD TRIP", w * 0.46, h * 0.71, 19);
    label(ctx, "U", 180, 115, 42);
    label(ctx, "S", 310, 115, 42);
    label(ctx, "A", 440, 115, 42);
    ctx.save();
    ctx.translate(w * 0.94, h * 0.65);
    ctx.rotate(-Math.PI / 2);
    label(ctx, "SHOOT FOR THE STARS", 0, 0, 24, "#e6b862");
    ctx.restore();
}

function drawSide(ctx, w, h) {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, h);
    flag(ctx, 0, 0, w * 0.48, h);
    label(ctx, "LIBERTY", w * 0.74, h * 0.5, 112);
    label(ctx, "UNITED STATES OF PINBALL", w * 0.74, h * 0.7, 30, "#e6b862");
}

export function usePinballArtwork(kind) {
    const texture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = kind === "playfield" ? 768 : 1024;
        canvas.height =
            kind === "playfield" ? 1536 : kind === "side" ? 384 : 640;
        const ctx = canvas.getContext("2d");
        ({
            backglass: drawBackglass,
            playfield: drawPlayfield,
            side: drawSide,
        })[kind](ctx, canvas.width, canvas.height);
        const result = new CanvasTexture(canvas);
        result.colorSpace = SRGBColorSpace;
        result.anisotropy = 8;
        return result;
    }, [kind]);
    useEffect(() => () => texture.dispose(), [texture]);
    return texture;
}

export function Star({ color = "#f2cb76", ...props }) {
    const shape = useMemo(() => {
        const result = new Shape();
        for (let i = 0; i < 10; i++) {
            const a = Math.PI / 2 + (i * Math.PI) / 5;
            const r = i % 2 ? 0.43 : 1;
            if (i === 0) result.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else result.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        result.closePath();
        return result;
    }, []);
    return (
        <mesh {...props}>
            <shapeGeometry args={[shape]} />
            <meshStandardMaterial
                color={color}
                metalness={0.45}
                roughness={0.32}
                side={2}
            />
        </mesh>
    );
}
