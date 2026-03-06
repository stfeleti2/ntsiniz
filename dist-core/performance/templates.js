"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERFORMANCE_TEMPLATES = void 0;
exports.getPerformanceTemplate = getPerformanceTemplate;
exports.PERFORMANCE_TEMPLATES = [
    {
        id: 'clip.pitchlock.15',
        title: 'Pitch Lock · 15s',
        subtitle: 'Hold one note cleanly. Keep the needle steady.',
        durationSec: 15,
        hint: 'Aim for stability over volume.',
    },
    {
        id: 'clip.stability.20',
        title: 'Stability · 20s',
        subtitle: 'Sustain + gentle slide. Smooth transitions only.',
        durationSec: 20,
        hint: 'No big jumps—glide.',
    },
    {
        id: 'clip.agility.15',
        title: 'Agility · 15s',
        subtitle: 'Fast little steps. Keep it accurate.',
        durationSec: 15,
        hint: 'Small, clean moves beat messy speed.',
    },
];
function getPerformanceTemplate(id) {
    const found = exports.PERFORMANCE_TEMPLATES.find((t) => t.id === id);
    return found ?? exports.PERFORMANCE_TEMPLATES[0];
}
