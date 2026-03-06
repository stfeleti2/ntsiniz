"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PitchSmoother = void 0;
class PitchSmoother {
    window = [];
    windowSize;
    lastStable = null;
    hysteresisHz;
    constructor(opts) {
        this.windowSize = opts?.windowSize ?? 5;
        this.hysteresisHz = opts?.hysteresisHz ?? 6;
    }
    push(freqHz) {
        this.window.push(freqHz);
        if (this.window.length > this.windowSize)
            this.window.shift();
        const med = median(this.window);
        if (this.lastStable == null) {
            this.lastStable = med;
            return med;
        }
        // hysteresis: ignore tiny jumps
        if (Math.abs(med - this.lastStable) < this.hysteresisHz) {
            return this.lastStable;
        }
        // accept
        this.lastStable = med;
        return med;
    }
    reset() {
        this.window = [];
        this.lastStable = null;
    }
}
exports.PitchSmoother = PitchSmoother;
function median(xs) {
    const a = [...xs].sort((x, y) => x - y);
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
