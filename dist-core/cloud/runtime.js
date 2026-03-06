"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCloudRuntime = initCloudRuntime;
const react_native_1 = require("react-native");
const auth_1 = require("./auth");
const config_1 = require("./config");
const syncEngine_1 = require("./syncEngine");
const qualityRuntime_1 = require("@/core/perf/qualityRuntime");
const flags_1 = require("@/core/config/flags");
const logger_1 = require("@/core/observability/logger");
let started = false;
async function initCloudRuntime() {
    if (started)
        return;
    started = true;
    if (!(0, flags_1.enableCloud)())
        return;
    await (0, auth_1.initCloudAuth)().catch((e) => logger_1.logger.warn('suppressed error', e));
    const cfg = (0, config_1.getCloudConfig)();
    if (!cfg.cloudAutoSync)
        return;
    let last = 0;
    const maybe = async () => {
        if (!(0, config_1.isCloudConfigured)())
            return;
        const now = Date.now();
        const interval = (0, qualityRuntime_1.getQualityConfig)().backgroundWorkIntervalMs;
        if (now - last < interval)
            return;
        last = now;
        await (0, syncEngine_1.syncNow)().catch((e) => logger_1.logger.warn('suppressed error', e));
    };
    // sync once on init (if possible)
    await maybe();
    react_native_1.AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            maybe().catch((e) => logger_1.logger.warn('suppressed error', e));
        }
    });
}
