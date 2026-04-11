"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPackLessonToHostDrills = mapPackLessonToHostDrills;
const loader_1 = require("@/core/drills/loader");
const loader_2 = require("./loader");
const familyToHostType = {
    match_note: 'match_note',
    sustain_hold: 'sustain',
    pitch_slide: 'slide',
    interval_jump: 'interval',
    melody_echo: 'melody_echo',
    confidence_rep: 'match_note',
    phrase_sing: 'melody_echo',
    dynamic_control: 'sustain',
    vowel_shape: 'sustain',
    vibrato_control: 'sustain',
    register_bridge: 'slide',
    performance_run: 'melody_echo',
};
function mapPackLessonToHostDrills(lessonId, routeId) {
    const program = (0, loader_2.loadGuidedJourneyProgram)();
    const hostPack = (0, loader_1.loadAllBundledPacks)();
    const lesson = program.lessonsById[lessonId];
    if (!lesson)
        return [];
    const lessonDrills = lesson.drillIds.map((id) => program.drillsById[id]).filter(Boolean);
    const drills = routeId ? lessonDrills.filter((drill) => drill.routeId === routeId) : lessonDrills;
    const source = drills.length ? drills : lessonDrills;
    const used = new Set();
    return source
        .map((drill, index) => mapSinglePackDrill(drill, hostPack.drills, used, index))
        .filter(Boolean);
}
function mapSinglePackDrill(packDrill, hostDrills, used, index) {
    const desiredType = familyToHostType[packDrill.drillType];
    const pool = hostDrills
        .filter((drill) => drill.type === desiredType)
        .sort((a, b) => a.level - b.level || a.title.localeCompare(b.title));
    if (!pool.length)
        return null;
    const preferred = pool.find((drill) => !used.has(drill.id));
    const fallback = pool[index % pool.length];
    const picked = preferred ?? fallback;
    used.add(picked.id);
    // All guided families are first-class in scoring + adaptive routing.
    // Host type mapping still picks the closest runner implementation where needed.
    const supported = true;
    return {
        packDrillId: packDrill.id,
        hostDrillId: picked.id,
        hostType: picked.type,
        family: packDrill.drillType,
        title: packDrill.title,
        supported,
        instructions: packDrill.instructions,
        loadTier: packDrill.loadTier,
        pressureLadderStep: packDrill.pressureLadderStep,
        transferTaskType: packDrill.transferTaskType,
        styleBranchHooks: packDrill.styleBranchHooks,
        repertoireBridge: packDrill.repertoireBridge,
        microGoal: packDrill.microGoal,
        assessmentEvidence: packDrill.assessmentEvidence,
    };
}
