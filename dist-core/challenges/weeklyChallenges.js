"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyChallenges = getWeeklyChallenges;
exports.getWeeklyChallengeById = getWeeklyChallengeById;
const week_1 = require("@/core/time/week");
const TEMPLATES = [
    {
        id: 'wk_pitch_mastery',
        title: 'Pitch Mastery Week',
        subtitle: 'Lock → Hold → Slide cleanly',
        drillIds: ['match_c4_lock', 'sustain_a3_steady', 'slide_c4_to_g4'],
        targetAvg: 80,
    },
    {
        id: 'wk_agility_runs',
        title: 'Agility Runs Week',
        subtitle: 'Fast accuracy, no wobble',
        drillIds: ['agility_penta_run_1', 'agility_penta_run_2', 'agility_penta_run_3'],
        targetAvg: 78,
    },
    {
        id: 'wk_control_stack',
        title: 'Control Stack Week',
        subtitle: 'Breath + straight tone + forward focus',
        drillIds: ['breath_phrase_4s', 'vibrato_control_hold', 'resonance_forward_e4'],
        targetAvg: 78,
    },
    {
        id: 'wk_song_phrases',
        title: 'Song Phrases Week',
        subtitle: 'Musical phrases, clean pitch',
        drillIds: ['song_phrase_twinkle_a', 'song_phrase_twinkle_b', 'song_phrase_scale_up'],
        targetAvg: 76,
    },
];
function getWeeklyChallenges(now = Date.now()) {
    const weekKey = (0, week_1.getIsoWeekKey)(now);
    // deterministic selection: pick two templates per week.
    const seed = parseInt(weekKey.replace(/\D/g, ''), 10) || 1;
    const a = TEMPLATES[seed % TEMPLATES.length];
    const b = TEMPLATES[(seed + 1) % TEMPLATES.length];
    return { weekKey, challenges: [a, b] };
}
function getWeeklyChallengeById(id) {
    return TEMPLATES.find((t) => t.id === id) ?? null;
}
