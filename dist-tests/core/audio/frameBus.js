"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameBus = void 0;
/**
 * Minimal in-JS frame bus.
 *
 * Goal: keep the native frame callback fast by moving heavier work
 * (pitch + runner tick) into a scheduled drain loop.
 */
class FrameBus {
    // Use a head index to avoid O(n) Array.shift() cost under pressure.
    q = [];
    head = 0;
    scheduled = false;
    stopped = false;
    dropped = 0;
    maxQueue;
    maxPerTick;
    preferAnimationFrame;
    constructor(opts) {
        this.maxQueue = Math.max(1, Math.floor(opts?.maxQueue ?? 10));
        this.maxPerTick = Math.max(1, Math.floor(opts?.maxPerTick ?? 3));
        this.preferAnimationFrame = opts?.preferAnimationFrame ?? true;
    }
    stop() {
        this.stopped = true;
        this.q = [];
        this.head = 0;
    }
    getStats() {
        return { queue: this.q.length - this.head, dropped: this.dropped, maxQueue: this.maxQueue, maxPerTick: this.maxPerTick };
    }
    push(item, drain) {
        if (this.stopped)
            return;
        this.q.push(item);
        // Enforce maxQueue using head pointer (drop oldest).
        const queued = this.q.length - this.head;
        if (queued > this.maxQueue) {
            const over = queued - this.maxQueue;
            this.head += over;
            this.dropped += over;
            // Periodically compact to keep memory bounded.
            if (this.head > 128 && this.head > this.q.length / 2)
                this.compact();
        }
        if (!this.scheduled) {
            this.scheduled = true;
            this.schedule(() => this.run(drain));
        }
    }
    run(drain) {
        if (this.stopped)
            return;
        this.scheduled = false;
        let n = 0;
        while (this.head < this.q.length && n < this.maxPerTick) {
            const item = this.q[this.head];
            this.q[this.head] = undefined;
            this.head += 1;
            drain(item);
            n += 1;
        }
        if (this.head < this.q.length) {
            this.scheduled = true;
            this.schedule(() => this.run(drain));
        }
        else if (this.head) {
            // Queue fully drained; reset to keep q small.
            this.q = [];
            this.head = 0;
        }
    }
    schedule(fn) {
        // In React Native, microtasks can starve rendering under sustained load.
        // Prefer rAF (one drain batch per frame) to keep UI at 60fps.
        const raf = globalThis.requestAnimationFrame;
        if (this.preferAnimationFrame && typeof raf === 'function') {
            raf(fn);
            return;
        }
        // Fallback: macrotask. Avoid queueMicrotask here by default.
        setTimeout(fn, 0);
    }
    compact() {
        if (!this.head)
            return;
        this.q = this.q.slice(this.head);
        this.head = 0;
    }
}
exports.FrameBus = FrameBus;
