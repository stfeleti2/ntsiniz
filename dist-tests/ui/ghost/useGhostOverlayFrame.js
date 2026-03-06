"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGhostOverlayFrame = useGhostOverlayFrame;
const react_1 = require("react");
/**
 * Throttle Ghost Guide overlay inputs so we don't re-render at audio callback rate.
 * Target: ~20fps updates for pitch, while keeping animations on the UI thread.
 */
function useGhostOverlayFrame(opts) {
    const { enabled = true, fps = 20 } = opts;
    const readingRef = (0, react_1.useRef)(opts.reading ?? null);
    const drillRef = (0, react_1.useRef)(opts.drill);
    const perfRef = (0, react_1.useRef)(opts.performancePlan ?? null);
    // Always keep refs up-to-date without triggering interval reset.
    readingRef.current = opts.reading ?? null;
    drillRef.current = opts.drill;
    perfRef.current = opts.performancePlan ?? null;
    const [frame, setFrame] = (0, react_1.useState)(() => ({
        nowMs: Date.now(),
        reading: readingRef.current,
        drill: drillRef.current ?? null,
        performancePlan: perfRef.current,
    }));
    (0, react_1.useEffect)(() => {
        if (!enabled)
            return;
        const ms = Math.max(16, Math.floor(1000 / fps));
        const id = setInterval(() => {
            setFrame({
                nowMs: Date.now(),
                reading: readingRef.current,
                drill: drillRef.current ?? null,
                performancePlan: perfRef.current,
            });
        }, ms);
        return () => clearInterval(id);
    }, [enabled, fps]);
    return frame;
}
