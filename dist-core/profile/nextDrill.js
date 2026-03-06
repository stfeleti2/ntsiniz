"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickNextDrill = pickNextDrill;
function pickNextDrill(pack, profile, opts) {
    // If last score low, route to corrective drill.
    if (typeof opts?.lastScore === "number" && opts.lastScore < 60) {
        const corrective = correctiveType(profile);
        const found = pack.drills.find((d) => d.type === corrective);
        if (found)
            return found.id;
    }
    // Mission / focus override.
    if (opts?.focusType) {
        const match = pack.drills.find((d) => d.type === opts.focusType);
        if (match)
            return match.id;
    }
    // Otherwise pick a balanced cycle.
    const cycle = ["match_note", "sustain", "slide", "interval", "melody_echo"];
    const lastType = opts?.lastDrillId ? pack.drills.find((d) => d.id === opts.lastDrillId)?.type : undefined;
    const lastIdx = lastType ? cycle.findIndex((t) => t === lastType) : -1;
    const nextType = cycle[(lastIdx + 1 + cycle.length) % cycle.length];
    const candidate = pack.drills.find((d) => d.type === nextType) ?? pack.drills[0];
    return candidate.id;
}
function correctiveType(p) {
    if (p.voicedRatio < 0.45)
        return "sustain";
    if (p.wobbleCents > 18)
        return "sustain";
    if (Math.abs(p.biasCents) > 18)
        return "match_note";
    if (p.overshootRate > 0.2)
        return "slide";
    if (Math.abs(p.driftCentsPerSec) > 4)
        return "sustain";
    return "match_note";
}
