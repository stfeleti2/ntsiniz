"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWaveformData = useWaveformData;
const react_1 = require("react");
const wavDecode_1 = require("./wavDecode");
/**
 * Returns waveform data from attempt metrics if present, otherwise decodes it from a WAV file.
 * Safe for Node-based tests (decode uses dynamic import for expo-file-system).
 */
function useWaveformData(params) {
    const { uri, metrics, bars = 72 } = params;
    const metricsPeaks = metrics?.waveformPeaks;
    const metricsDuration = metrics?.audioDurationMs;
    const metricsRate = metrics?.audioSampleRate;
    const metricsData = (0, react_1.useMemo)(() => {
        if (Array.isArray(metricsPeaks) && metricsPeaks.length) {
            return {
                waveformPeaks: metricsPeaks,
                durationMs: typeof metricsDuration === 'number' ? metricsDuration : 0,
                sampleRate: typeof metricsRate === 'number' ? metricsRate : 44100,
            };
        }
        return null;
    }, [metricsDuration, metricsPeaks, metricsRate]);
    const [decoded, setDecoded] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        let mounted = true;
        (async () => {
            if (metricsData) {
                setDecoded(null);
                setLoading(false);
                return;
            }
            if (!uri) {
                setDecoded(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            const res = await (0, wavDecode_1.decodeWavWaveform)(uri, bars);
            if (!mounted)
                return;
            setDecoded(res);
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, [uri, bars, metricsData]);
    return {
        data: metricsData ?? decoded,
        loading,
    };
}
