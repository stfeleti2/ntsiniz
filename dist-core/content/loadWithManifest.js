"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContentJson = loadContentJson;
exports.tryLoadContentJson = tryLoadContentJson;
const manifest_1 = require("./manifest");
const errors_1 = require("@/core/util/errors");
const flags_1 = require("@/core/config/flags");
const appVersion_1 = require("@/core/config/appVersion");
const version_1 = require("@/core/util/version");
// Static import for the manifest (Metro-friendly).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const manifest = require('@/content/manifests/content.manifest.json');
let _contentGetter = null;
function getBundledContentJson(filePath) {
    if (!_contentGetter) {
        // Keep this as runtime require so core-only build does not pull src/content into rootDir.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('@/content/contentIndex');
        _contentGetter = mod.getBundledContentJson;
    }
    return _contentGetter(filePath);
}
function assertContentSecurity() {
    const appVersion = (0, appVersion_1.getAppVersion)();
    const minV = (0, flags_1.minAppVersion)();
    const maxV = (0, flags_1.maxAppVersion)();
    if (!(0, version_1.isVersionInRange)({ version: appVersion, min: minV, max: maxV })) {
        (0, errors_1.coreError)('content_compat_app_version_out_of_range', { appVersion, minV, maxV });
        if (!__DEV__)
            throw new Error(`App version not compatible with content policy (${appVersion} not in [${minV ?? '-inf'}, ${maxV ?? '+inf'}])`);
    }
    const minSchema = (0, flags_1.minManifestSchema)();
    if (minSchema != null && manifest.schema < minSchema) {
        (0, errors_1.coreError)('content_manifest_schema_too_old', { schema: manifest.schema, minSchema });
        if (!__DEV__)
            throw new Error(`Content manifest schema too old: ${manifest.schema} < ${minSchema}`);
    }
    if ((0, flags_1.requireManifestSignature)()) {
        const s = (0, manifest_1.getManifestSignatureStatus)();
        if (s !== 'verified') {
            (0, errors_1.coreError)('content_manifest_signature_required_but_not_verified', { status: s });
            if (!__DEV__)
                throw new Error(`Content manifest signature required but not verified (status=${s})`);
        }
    }
}
function loadContentJson(filePath) {
    assertContentSecurity();
    const raw = getBundledContentJson(filePath);
    if (!raw)
        throw new Error(`Missing bundled content file: ${filePath}`);
    const entry = manifest.entries.find((e) => e.file === filePath);
    if (!entry) {
        (0, errors_1.coreError)('content_manifest_missing_entry', { filePath });
        // Fail closed in prod: content without manifest entry is considered invalid.
        if (!__DEV__)
            throw new Error(`Content manifest missing entry for ${filePath}`);
        return raw;
    }
    const v = (0, manifest_1.verifyManifestEntry)(entry, raw);
    if (!v.ok) {
        (0, errors_1.coreError)('content_manifest_verify_failed', { filePath, reason: v.reason });
        if (!__DEV__)
            throw new Error(`Content verification failed for ${filePath}: ${v.reason}`);
    }
    return raw;
}
function tryLoadContentJson(filePath) {
    try {
        return loadContentJson(filePath);
    }
    catch {
        return null;
    }
}
