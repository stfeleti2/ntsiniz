"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASE1_JOURNEY = void 0;
exports.computeJourney = computeJourney;
exports.nextMission = nextMission;
exports.PHASE1_JOURNEY = [
    {
        id: "baseline",
        title: "Baseline",
        subtitle: "Quick read of your voice: accuracy + stability.",
        focusType: "match_note",
        isComplete: (s) => s.totalSessions >= 1,
    },
    {
        id: "steady_hold",
        title: "Steady Hold",
        subtitle: "Reduce wobble. Make the note feel calm.",
        focusType: "sustain",
        isComplete: (s) => s.totalSessions >= 2 && s.profile.wobbleCents <= 20,
    },
    {
        id: "clean_start",
        title: "Clean Start",
        subtitle: "Hit the target faster (no hunting).",
        focusType: "match_note",
        isComplete: (s) => s.totalSessions >= 3 && Math.abs(s.profile.biasCents) <= 18,
    },
    {
        id: "smooth_slide",
        title: "Smooth Slide",
        subtitle: "Control pitch movement without overshooting.",
        focusType: "slide",
        isComplete: (s) => s.totalSessions >= 4 && s.profile.overshootRate <= 0.25,
    },
    {
        id: "intervals",
        title: "Intervals",
        subtitle: "Jump accurately between notes.",
        focusType: "interval",
        isComplete: (s) => s.totalSessions >= 6 && s.last7Avg >= 70,
    },
    {
        id: "melody_echo",
        title: "Melody Echo",
        subtitle: "Copy short melodies by ear.",
        focusType: "melody_echo",
        isComplete: (s) => s.totalSessions >= 8 && s.last7Avg >= 75,
    },
    {
        id: "level_up",
        title: "Level Up",
        subtitle: "You’re ready to show off. Aim for an 85+ session.",
        focusType: "melody_echo",
        isComplete: (s) => s.bestScore >= 85,
    },
];
function computeJourney(nodes, s) {
    const completed = nodes.map((n) => n.isComplete(s));
    // First node is always available
    let nextIdx = completed.findIndex((c) => !c);
    if (nextIdx === -1)
        nextIdx = nodes.length - 1;
    return nodes.map((n, i) => {
        const done = completed[i];
        const isNext = i === nextIdx;
        let status = "locked";
        if (done)
            status = "complete";
        else if (isNext)
            status = "next";
        else if (i < nextIdx)
            status = "unlocked";
        return { ...n, status };
    });
}
function nextMission(nodes) {
    return nodes.find((n) => n.status === "next") ?? nodes[nodes.length - 1];
}
