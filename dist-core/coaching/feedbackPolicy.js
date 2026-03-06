"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransferLikeDrillId = isTransferLikeDrillId;
exports.resolveFeedbackPlan = resolveFeedbackPlan;
exports.applyFeedbackPlanToDrill = applyFeedbackPlanToDrill;
/**
 * Heuristic segment detection until lessons encode explicit blocks.
 * Transfer is typically "apply skill" work: phrases/melodies/performance.
 */
function isTransferLikeDrillId(drillId) {
    const id = (drillId || '').toLowerCase();
    return (id.startsWith('song_phrase_') ||
        id.startsWith('melody_') ||
        id.includes('transfer') ||
        id.includes('performance'));
}
/**
 * Resolve an effective feedback plan for a user session from:
 * - track (beginner/intermediate/advanced)
 * - week progression (1..12)
 * - optional lesson-authored base plan
 *
 * Goals:
 * - Beginners: more realtime help, wider tolerance, slower fade.
 * - Intermediate: bandwidth/faded help, moderate tolerance, earlier fade over time.
 * - Advanced: less realtime help, tighter tolerance, earlier fade; later weeks push to OFF_POST.
 */
function resolveFeedbackPlan(input) {
    const week = clampInt(input.week ?? 1, 1, 12);
    const track = input.track;
    const segment = input.segment ?? 'core';
    // Defaults per track (week 1)
    const defaults = {
        beginner: { mode: 'REALTIME_FULL', bandwidthCents: 45, fadeAfterSec: undefined },
        intermediate: { mode: 'BANDWIDTH_ONLY', bandwidthCents: 35, fadeAfterSec: 1.2 },
        advanced: { mode: 'FADED', bandwidthCents: 28, fadeAfterSec: 0.9 },
    };
    // Progression: gradually tighten tolerance and fade earlier.
    const progTightenPerWeek = track === 'beginner' ? 1.0 : track === 'intermediate' ? 1.15 : 1.25;
    const tighten = (week - 1) * progTightenPerWeek;
    // Compute derived cents (clamp to a safe band; never below 18c in this product version)
    const baseCents = typeof input.base?.bandwidthCents === 'number' ? input.base.bandwidthCents : defaults[track].bandwidthCents;
    const bandwidthCents = clampNumber(baseCents - tighten, 18, 60);
    // Mode policy:
    // - Respect lesson-authored mode when present.
    // - Track progression (reduce overlay visibility over time):
    //   * beginner: REALTIME_FULL for core learning
    //   * intermediate: start BANDWIDTH_ONLY, later FADED
    //   * advanced: FADED early, then BANDWIDTH_ONLY; weeks 9–12 force OFF_POST ONLY for transfer blocks
    const baseMode = input.base?.mode;
    let mode = baseMode && isMode(baseMode) ? baseMode : null;
    if (!mode) {
        if (track === 'beginner') {
            mode = 'REALTIME_FULL';
        }
        else if (track === 'intermediate') {
            mode = week >= 7 ? 'FADED' : 'BANDWIDTH_ONLY';
        }
        else {
            // advanced
            if (segment === 'transfer' && week >= 9)
                mode = 'OFF_POST';
            else if (week >= 5)
                mode = 'BANDWIDTH_ONLY';
            else
                mode = 'FADED';
        }
    }
    // Fade timing: allow lesson override; otherwise trend earlier with weeks (but never < 0.6s).
    const baseFade = typeof input.base?.fadeAfterSec === 'number'
        ? input.base.fadeAfterSec
        : defaults[track].fadeAfterSec;
    const fadeAfterSec = mode === 'FADED'
        ? clampNumber(
        // Advanced fades earlier; intermediate fades moderately.
        (baseFade ?? (track === 'advanced' ? 0.9 : 1.2)) - (week - 1) * (track === 'advanced' ? 0.04 : 0.03), 0.55, 2.5)
        : undefined;
    // BANDWIDTH_ONLY still benefits from fadeAfterSec for UI: we treat it as "always visible but only warns outside band".
    // Keep fadeAfterSec undefined for non-FADED to avoid accidental behavior.
    return { mode, bandwidthCents, fadeAfterSec };
}
function applyFeedbackPlanToDrill(drill, plan) {
    if (!plan)
        return drill;
    const window = clampNumber(plan.bandwidthCents, 18, 60);
    // Avoid mutating shared objects referenced by packs.
    return { ...drill, tuneWindowCents: window };
}
function isMode(x) {
    return x === 'REALTIME_FULL' || x === 'BANDWIDTH_ONLY' || x === 'FADED' || x === 'OFF_POST';
}
function clampNumber(n, min, max) {
    if (!Number.isFinite(n))
        return min;
    return Math.max(min, Math.min(max, n));
}
function clampInt(n, min, max) {
    const v = Math.floor(Number.isFinite(n) ? n : min);
    return Math.max(min, Math.min(max, v));
}
