"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuality = useQuality;
const react_1 = require("react");
const qualityRuntime_1 = require("@/core/perf/qualityRuntime");
/**
 * UI hook for adaptive quality settings.
 * Premium visuals remain; effects degrade adaptively in LITE.
 */
function useQuality() {
    const [cfg, setCfg] = (0, react_1.useState)(() => (0, qualityRuntime_1.getQualityConfig)());
    (0, react_1.useEffect)(() => {
        return (0, qualityRuntime_1.subscribeQuality)((q) => setCfg(q.config));
    }, []);
    return cfg;
}
