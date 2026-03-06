"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedCloudUser = getCachedCloudUser;
exports.initCloudAuth = initCloudAuth;
exports.requestEmailOtp = requestEmailOtp;
exports.verifyEmailOtp = verifyEmailOtp;
exports.signOutCloud = signOutCloud;
exports.isSignedIn = isSignedIn;
const config_1 = require("./config");
const supabase_1 = require("./supabase");
const identityRepo_1 = require("./identityRepo");
const migrateIdentity_1 = require("./migrateIdentity");
const flags_1 = require("@/core/config/flags");
const logger_1 = require("@/core/observability/logger");
let cachedUser = null;
let inited = false;
function getCachedCloudUser() {
    return cachedUser;
}
async function initCloudAuth() {
    if (inited)
        return;
    inited = true;
    if (!(0, flags_1.enableCloud)()) {
        cachedUser = null;
        return;
    }
    if (!(0, config_1.isCloudConfigured)()) {
        cachedUser = null;
        return;
    }
    const supabase = (0, supabase_1.getSupabase)();
    if (!supabase)
        return;
    // restore from local identity record first (fast path)
    const ident = await (0, identityRepo_1.getIdentity)().catch(() => null);
    if (ident?.remoteUserId)
        cachedUser = { id: ident.remoteUserId, email: ident.email };
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    if (u) {
        cachedUser = { id: u.id, email: u.email };
        await (0, identityRepo_1.setIdentity)({ remoteUserId: u.id, email: u.email ?? null }).catch((e) => logger_1.logger.warn('suppressed error', e));
        await (0, migrateIdentity_1.ensureCloudSelfId)(u.id, u.email ?? null).catch((e) => logger_1.logger.warn('suppressed error', e));
    }
    else {
        cachedUser = null;
        await (0, identityRepo_1.setIdentity)({ remoteUserId: null, email: null }).catch((e) => logger_1.logger.warn('suppressed error', e));
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user;
        if (user) {
            cachedUser = { id: user.id, email: user.email };
            await (0, identityRepo_1.setIdentity)({ remoteUserId: user.id, email: user.email ?? null }).catch((e) => logger_1.logger.warn('suppressed error', e));
            await (0, migrateIdentity_1.ensureCloudSelfId)(user.id, user.email ?? null).catch((e) => logger_1.logger.warn('suppressed error', e));
        }
        else {
            cachedUser = null;
            await (0, identityRepo_1.setIdentity)({ remoteUserId: null, email: null }).catch((e) => logger_1.logger.warn('suppressed error', e));
        }
    });
}
async function requestEmailOtp(email) {
    if (!(0, config_1.isCloudConfigured)())
        throw new Error('Cloud sync is not configured.');
    const supabase = (0, supabase_1.getSupabase)();
    if (!supabase)
        throw new Error('Cloud sync is not configured.');
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@'))
        throw new Error('Enter a valid email.');
    const { error } = await supabase.auth.signInWithOtp({ email: e });
    if (error)
        throw new Error(error.message);
}
async function verifyEmailOtp(email, token) {
    if (!(0, config_1.isCloudConfigured)())
        throw new Error('Cloud sync is not configured.');
    const supabase = (0, supabase_1.getSupabase)();
    if (!supabase)
        throw new Error('Cloud sync is not configured.');
    const e = email.trim().toLowerCase();
    const t = token.trim();
    if (!t)
        throw new Error('Enter the code from your email.');
    const { data, error } = await supabase.auth.verifyOtp({ email: e, token: t, type: 'email' });
    if (error)
        throw new Error(error.message);
    const user = data.user;
    if (user) {
        cachedUser = { id: user.id, email: user.email };
        await (0, identityRepo_1.setIdentity)({ remoteUserId: user.id, email: user.email ?? null }).catch((e) => logger_1.logger.warn('suppressed error', e));
        await (0, migrateIdentity_1.ensureCloudSelfId)(user.id, user.email ?? null).catch((e) => logger_1.logger.warn('suppressed error', e));
    }
}
async function signOutCloud() {
    const supabase = (0, supabase_1.getSupabase)();
    if (supabase)
        await supabase.auth.signOut().catch((e) => logger_1.logger.warn('suppressed error', e));
    cachedUser = null;
    await (0, identityRepo_1.setIdentity)({ remoteUserId: null, email: null }).catch((e) => logger_1.logger.warn('suppressed error', e));
}
async function isSignedIn() {
    await initCloudAuth().catch((e) => logger_1.logger.warn('suppressed error', e));
    return !!cachedUser;
}
