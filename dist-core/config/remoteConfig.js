"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteConfig = getRemoteConfig;
exports.setRemoteConfig = setRemoteConfig;
exports.refreshRemoteConfigFromCloud = refreshRemoteConfigFromCloud;
const db_1 = require("@/core/storage/db");
const config_1 = require("@/core/cloud/config");
const supabase_1 = require("@/core/cloud/supabase");
const errors_1 = require("@/core/util/errors");
const remoteConfigSchema_1 = require("./remoteConfigSchema");
const safeJson_1 = require("@/core/utils/safeJson");
async function getRemoteConfig() {
    const d = await (0, db_1.getDb)();
    const rows = await (0, db_1.query)(d, `SELECT valueJson FROM remote_config WHERE key = 'root' LIMIT 1;`, []);
    if (!rows[0])
        return {};
    try {
        return (0, remoteConfigSchema_1.safeValidateRemoteConfig)((0, safeJson_1.safeJsonParse)(rows[0].valueJson, {}));
    }
    catch (e) {
        (0, errors_1.coreError)('remote_config_parse', { e });
        return {};
    }
}
async function setRemoteConfig(payload) {
    const d = await (0, db_1.getDb)();
    const now = Date.now();
    await (0, db_1.exec)(d, `INSERT INTO remote_config (key, valueJson, updatedAt) VALUES ('root', ?, ?)
     ON CONFLICT(key) DO UPDATE SET valueJson = excluded.valueJson, updatedAt = excluded.updatedAt;`, [JSON.stringify(payload), now]);
}
/**
 * Optional cloud refresh. Safe offline: returns cached config on any failure.
 * Expects a Supabase table: remote_config(key text primary key, value_json text, updated_at bigint).
 */
async function refreshRemoteConfigFromCloud() {
    const cached = await getRemoteConfig();
    if (!(0, config_1.isCloudConfigured)())
        return cached;
    try {
        const sb = (0, supabase_1.getSupabase)();
        if (!sb)
            return cached;
        const { data, error } = await sb.from('remote_config').select('value_json, updated_at').eq('key', 'root').limit(1).maybeSingle();
        if (error || !data?.value_json)
            return cached;
        const parsed = (0, safeJson_1.safeJsonParse)(data.value_json, {});
        const payload = (0, remoteConfigSchema_1.safeValidateRemoteConfig)(parsed);
        await setRemoteConfig(payload);
        return payload;
    }
    catch (e) {
        (0, errors_1.coreError)('remote_config_refresh', { e });
        return cached;
    }
}
