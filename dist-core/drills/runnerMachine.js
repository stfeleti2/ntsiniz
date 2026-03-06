"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrillRunner = void 0;
const hzToNote_1 = require("../pitch/hzToNote");
const noteParse_1 = require("../pitch/noteParse");
const drillScoring_1 = require("../scoring/drillScoring");
class DrillRunner {
    drill;
    phase = "idle";
    countdownEndsAt = 0;
    activeStartedAt = 0;
    stepStartedAt = 0;
    // current target
    targetMidi = null;
    tuneWindow = 25;
    holdMs = 1200;
    // tracking
    inTuneSince = null;
    enteredAt = null;
    centsSamples = [];
    midiFloatSamples = [];
    confidenceSum = 0;
    confidenceCount = 0;
    voicedSamples = 0;
    totalSamples = 0;
    stepSummaries = [];
    // multi-step drills
    step = 0;
    steps = 1;
    stepTargetsMidi = [];
    // slide-specific
    slideMode = "hold_start";
    slideStartHoldMs = 0;
    glideStartedAt = null;
    glideMidiSamples = [];
    constructor(drill) {
        this.drill = drill;
        this.tuneWindow = drill.tuneWindowCents;
        this.holdMs = drill.holdMs;
        this.setupTargets();
    }
    setupTargets() {
        const noteToMidi = (note) => (0, noteParse_1.parseNoteToMidi)(note) ?? 69;
        if (this.drill.type === "melody_echo" && this.drill.melody?.length) {
            this.stepTargetsMidi = this.drill.melody.map((n) => noteToMidi(n.note));
        }
        else if (this.drill.type === "interval" && this.drill.target?.note && typeof this.drill.intervalSemitones === "number") {
            const start = noteToMidi(this.drill.target.note);
            this.stepTargetsMidi = [start, start + this.drill.intervalSemitones];
        }
        else if (this.drill.type === "slide" && this.drill.from?.note && this.drill.to?.note) {
            this.stepTargetsMidi = [noteToMidi(this.drill.from.note), noteToMidi(this.drill.to.note)];
        }
        else if (this.drill.target?.note) {
            this.stepTargetsMidi = [noteToMidi(this.drill.target.note)];
        }
        else {
            this.stepTargetsMidi = [69];
        }
        this.steps = this.stepTargetsMidi.length;
        this.step = 0;
        this.targetMidi = this.stepTargetsMidi[0];
        if (this.drill.type === "slide") {
            this.slideMode = "hold_start";
            this.slideStartHoldMs = Math.max(450, Math.min(800, Math.floor(this.holdMs * 0.55)));
            this.glideStartedAt = null;
            this.glideMidiSamples = [];
        }
    }
    start() {
        if (this.phase !== "idle")
            return;
        this.phase = "countdown";
        this.countdownEndsAt = Date.now() + this.drill.countdownMs;
    }
    stop() {
        this.phase = "done";
    }
    getUi() {
        const target = this.targetMidi != null ? (0, hzToNote_1.hzToNote)((0, hzToNote_1.midiToHz)(this.targetMidi)).note : undefined;
        if (this.phase === "idle") {
            return {
                phase: this.phase,
                title: this.drill.title,
                subtitle: "Tap Start when you’re ready",
                targetNote: target,
                step: this.step + 1,
                steps: this.steps,
            };
        }
        if (this.phase === "countdown") {
            const left = Math.max(0, this.countdownEndsAt - Date.now());
            return {
                phase: this.phase,
                title: this.drill.title,
                subtitle: `Get ready… ${Math.ceil(left / 1000)}`,
                targetNote: target,
                step: this.step + 1,
                steps: this.steps,
            };
        }
        if (this.phase === "active") {
            const hold = this.inTuneSince ? Date.now() - this.inTuneSince : 0;
            const p = Math.max(0, Math.min(1, hold / this.holdMs));
            return {
                phase: this.phase,
                title: this.drill.title,
                subtitle: this.inTuneSince ? "Hold it…" : "Find the note…",
                targetNote: target,
                step: this.step + 1,
                steps: this.steps,
                progress01: p,
            };
        }
        if (this.phase === "evaluating") {
            return { phase: this.phase, title: this.drill.title, subtitle: "Scoring…" };
        }
        return { phase: this.phase, title: this.drill.title, subtitle: "Done" };
    }
    /**
     * Snapshot the current runner state for the Ghost Guide overlay.
     * Safe to call at audio-frame cadence.
     */
    getGhostState() {
        const now = Date.now();
        const hold = this.inTuneSince ? now - this.inTuneSince : 0;
        const holdProgress01 = Math.max(0, Math.min(1, this.holdMs ? hold / this.holdMs : 0));
        return {
            phase: this.phase,
            countdownEndsAt: this.countdownEndsAt,
            activeStartedAt: this.activeStartedAt,
            stepStartedAt: this.stepStartedAt,
            targetMidi: this.targetMidi ?? 69,
            stepTargetsMidi: [...this.stepTargetsMidi],
            step: this.step,
            steps: this.steps,
            tuneWindowCents: this.tuneWindow,
            holdMs: this.holdMs,
            holdProgress01,
            slideMode: this.drill.type === "slide" ? this.slideMode : undefined,
        };
    }
    tick(reading) {
        const now = Date.now();
        if (this.phase === "countdown" && now >= this.countdownEndsAt) {
            this.phase = "active";
            this.activeStartedAt = now;
            this.stepStartedAt = now;
        }
        if (this.phase !== "active")
            return null;
        this.totalSamples += 1;
        if (!reading)
            return null;
        this.voicedSamples += 1;
        if (Number.isFinite(reading.confidence)) {
            this.confidenceSum += reading.confidence;
            this.confidenceCount += 1;
        }
        if (this.drill.type === "slide") {
            return this.tickSlide(reading, now);
        }
        const targetMidi = this.targetMidi ?? 69;
        const readingMidi = (0, hzToNote_1.hzToNote)(reading.freqHz).midi;
        const centsOff = (readingMidi - targetMidi) * 100 + reading.cents;
        const midiFloat = readingMidi + reading.cents / 100;
        this.centsSamples.push(centsOff);
        this.midiFloatSamples.push(midiFloat);
        const inTune = Math.abs(centsOff) <= this.tuneWindow;
        if (inTune) {
            if (!this.enteredAt)
                this.enteredAt = now;
            if (!this.inTuneSince)
                this.inTuneSince = now;
        }
        else {
            this.inTuneSince = null;
        }
        // if held long enough => step complete
        if (this.inTuneSince && now - this.inTuneSince >= this.holdMs) {
            // next step or finish
            this.pushStepSummary(now);
            if (this.step + 1 < this.steps) {
                this.step += 1;
                this.targetMidi = this.stepTargetsMidi[this.step];
                this.resetStep(now);
                return null;
            }
            this.phase = "evaluating";
            const metrics = this.buildFinalMetrics(now);
            const score = (0, drillScoring_1.scoreAttempt)(metrics);
            metrics.scoreReport = (0, drillScoring_1.buildScoreReport)(metrics);
            this.phase = "done";
            return { score, metrics };
        }
        return null;
    }
    resetStep(now) {
        this.inTuneSince = null;
        this.enteredAt = null;
        this.centsSamples = [];
        this.midiFloatSamples = [];
        this.confidenceSum = 0;
        this.confidenceCount = 0;
        this.stepStartedAt = now;
    }
    pushStepSummary(now) {
        const durationSec = Math.max(0.001, (now - this.stepStartedAt) / 1000);
        const meanCents = mean(this.centsSamples);
        const drift = driftCentsPerSec(this.centsSamples, durationSec);
        const over = overshootRate(this.centsSamples, this.tuneWindow / 2);
        const meanMidi = mean(this.midiFloatSamples);
        this.stepSummaries.push({
            targetMidi: this.targetMidi ?? 69,
            meanMidi,
            samples: this.centsSamples.length,
            timeToEnterMs: this.enteredAt ? this.enteredAt - this.stepStartedAt : null,
            meanCents,
            avgAbsCents: avgAbs(this.centsSamples),
            wobbleCents: stddev(this.centsSamples),
            driftCentsPerSec: drift,
            overshootRate: over,
            confidenceAvg: this.confidenceCount ? this.confidenceSum / this.confidenceCount : 0,
        });
    }
    buildFinalMetrics(_now) {
        const voicedRatio = this.totalSamples ? this.voicedSamples / this.totalSamples : 0;
        const steps = this.stepSummaries.length || 1;
        const weightSum = this.stepSummaries.reduce((a, b) => a + Math.max(1, b.samples), 0) || 1;
        const w = (x) => this.stepSummaries.reduce((a, s) => a + x(s) * Math.max(1, s.samples), 0) / weightSum;
        const meanCents = w((s) => s.meanCents);
        const avgAbsCents = w((s) => s.avgAbsCents);
        const wobbleCents = w((s) => s.wobbleCents);
        const driftCentsPerSec = w((s) => s.driftCentsPerSec);
        const overshootRate = w((s) => s.overshootRate);
        const confidenceAvg = w((s) => s.confidenceAvg);
        const timeToEnterMs = avgNonNull(this.stepSummaries.map((s) => s.timeToEnterMs));
        const metrics = {
            drillType: this.drill.type,
            tuneWindowCents: this.tuneWindow,
            holdMs: this.holdMs,
            timeToEnterMs,
            meanCents,
            avgAbsCents,
            wobbleCents,
            driftCentsPerSec,
            overshootRate,
            voicedRatio,
            confidenceAvg,
            steps,
            stepNotes: this.stepSummaries.map((s) => (0, hzToNote_1.hzToNote)((0, hzToNote_1.midiToHz)(s.targetMidi)).note),
        };
        if (this.drill.type === "interval" && typeof this.drill.intervalSemitones === "number" && this.stepSummaries.length >= 2) {
            const actualSemi = this.stepSummaries[1].meanMidi - this.stepSummaries[0].meanMidi;
            const expected = this.drill.intervalSemitones;
            metrics.intervalErrorCents = Math.abs(actualSemi - expected) * 100;
            metrics.intervalDirectionCorrect = Math.sign(actualSemi) === Math.sign(expected) || expected === 0;
        }
        if (this.drill.type === "melody_echo" && this.stepTargetsMidi.length >= 2 && this.stepSummaries.length >= 2) {
            const hits = this.stepSummaries.filter((s, i) => Math.abs((s.meanMidi - this.stepTargetsMidi[i]) * 100) <= this.tuneWindow).length;
            metrics.melodyHitRate = hits / Math.max(1, this.stepTargetsMidi.length);
            const contourTarget = contourSigns(this.stepTargetsMidi);
            const contourSung = contourSigns(this.stepSummaries.map((s) => s.meanMidi));
            let ok = 0;
            for (let i = 0; i < Math.min(contourTarget.length, contourSung.length); i++) {
                if (contourTarget[i] === contourSung[i])
                    ok += 1;
            }
            metrics.contourHitRate = ok / Math.max(1, contourTarget.length);
        }
        return metrics;
    }
    tickSlide(reading, now) {
        const fromMidi = this.stepTargetsMidi[0] ?? 69;
        const toMidi = this.stepTargetsMidi[1] ?? fromMidi;
        const readingMidi = (0, hzToNote_1.hzToNote)(reading.freqHz).midi;
        const midiFloat = readingMidi + reading.cents / 100;
        const dir = Math.sign(toMidi - fromMidi) || 1;
        if (this.slideMode === "hold_start") {
            const centsOff = (readingMidi - fromMidi) * 100 + reading.cents;
            this.centsSamples.push(centsOff);
            this.midiFloatSamples.push(midiFloat);
            const inTune = Math.abs(centsOff) <= this.tuneWindow;
            if (inTune) {
                if (!this.enteredAt)
                    this.enteredAt = now;
                if (!this.inTuneSince)
                    this.inTuneSince = now;
            }
            else {
                this.inTuneSince = null;
            }
            if (this.inTuneSince && now - this.inTuneSince >= this.slideStartHoldMs) {
                this.targetMidi = fromMidi;
                this.pushStepSummary(now);
                this.resetStep(now);
                this.slideMode = "glide";
                this.step = 1;
                this.glideStartedAt = now;
                this.glideMidiSamples = [];
                this.targetMidi = toMidi;
                this.inTuneSince = null;
                this.enteredAt = null;
            }
            return null;
        }
        if (this.slideMode === "glide") {
            this.glideMidiSamples.push(midiFloat);
            const centsOffEnd = (readingMidi - toMidi) * 100 + reading.cents;
            const inTuneEnd = Math.abs(centsOffEnd) <= this.tuneWindow;
            if (inTuneEnd) {
                this.slideMode = "hold_end";
                this.enteredAt = now;
                this.inTuneSince = now;
                this.centsSamples = [centsOffEnd];
                this.midiFloatSamples = [midiFloat];
                this.confidenceSum = reading.confidence;
                this.confidenceCount = 1;
            }
            return null;
        }
        // hold_end
        const centsOff = (readingMidi - toMidi) * 100 + reading.cents;
        this.centsSamples.push(centsOff);
        this.midiFloatSamples.push(midiFloat);
        const inTune = Math.abs(centsOff) <= this.tuneWindow;
        if (inTune) {
            if (!this.inTuneSince)
                this.inTuneSince = now;
        }
        else {
            this.inTuneSince = null;
        }
        if (this.inTuneSince && now - this.inTuneSince >= this.holdMs) {
            this.targetMidi = toMidi;
            this.pushStepSummary(now);
            const metrics = this.buildFinalMetrics(now);
            metrics.glideTimeMs = this.glideStartedAt ? (this.enteredAt ? this.enteredAt - this.glideStartedAt : null) : null;
            const glide = this.glideMidiSamples;
            if (glide.length >= 5) {
                metrics.glideMonotonicity = monotonicity(glide, dir);
                metrics.glideSmoothness = smoothness(glide);
            }
            const score = (0, drillScoring_1.scoreAttempt)(metrics);
            metrics.scoreReport = (0, drillScoring_1.buildScoreReport)(metrics);
            this.phase = "done";
            return { score, metrics };
        }
        return null;
    }
}
exports.DrillRunner = DrillRunner;
function avgAbs(xs) {
    if (!xs.length)
        return 999;
    let s = 0;
    for (const x of xs)
        s += Math.abs(x);
    return s / xs.length;
}
function stddev(xs) {
    if (xs.length < 2)
        return 0;
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const v = xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (xs.length - 1);
    return Math.sqrt(v);
}
function mean(xs) {
    if (!xs.length)
        return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function avgNonNull(xs) {
    const ys = xs.filter((v) => typeof v === "number" && Number.isFinite(v));
    if (!ys.length)
        return null;
    return ys.reduce((a, b) => a + b, 0) / ys.length;
}
function contourSigns(seq) {
    const out = [];
    for (let i = 0; i < seq.length - 1; i++) {
        const d = seq[i + 1] - seq[i];
        out.push(d > 0.25 ? 1 : d < -0.25 ? -1 : 0);
    }
    return out;
}
function monotonicity(seq, dir) {
    let ok = 0;
    let total = 0;
    for (let i = 1; i < seq.length; i++) {
        const d = seq[i] - seq[i - 1];
        if (Math.abs(d) < 0.02)
            continue;
        total += 1;
        if (dir > 0 ? d >= -0.01 : d <= 0.01)
            ok += 1;
    }
    return total ? ok / total : 0;
}
function smoothness(seq) {
    if (seq.length < 6)
        return 0;
    const diffs = [];
    for (let i = 1; i < seq.length; i++)
        diffs.push(seq[i] - seq[i - 1]);
    const sd = stddev(diffs);
    return Math.max(0, Math.min(1, 1 - sd / 0.25));
}
function driftCentsPerSec(xs, durationSec) {
    if (xs.length < 6)
        return 0;
    const n = xs.length;
    const k = Math.max(2, Math.floor(n / 3));
    const first = mean(xs.slice(0, k));
    const last = mean(xs.slice(n - k));
    return (last - first) / durationSec;
}
function overshootRate(xs, deadbandCents) {
    // count sign changes that are outside a deadband around 0
    let lastSign = 0;
    let changes = 0;
    let considered = 0;
    for (const x of xs) {
        if (Math.abs(x) < deadbandCents)
            continue;
        const s = x > 0 ? 1 : -1;
        if (lastSign !== 0 && s !== lastSign)
            changes += 1;
        lastSign = s;
        considered += 1;
    }
    return considered ? changes / considered : 0;
}
