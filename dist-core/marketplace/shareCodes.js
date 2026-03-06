"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCoachCode = encodeCoachCode;
exports.decodeCoachCode = decodeCoachCode;
exports.createMyCoachShareCode = createMyCoachShareCode;
const base64_1 = require("@/core/social/base64");
const peopleRepo_1 = require("@/core/social/peopleRepo");
function encodeCoachCode(env) {
    return (0, base64_1.b64UrlEncodeJson)(env);
}
function decodeCoachCode(code) {
    return (0, base64_1.b64UrlDecodeJson)(code);
}
async function createMyCoachShareCode() {
    const me = await (0, peopleRepo_1.ensureSelfPerson)();
    const env = {
        v: 1,
        kind: 'coach',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 86400000,
        payload: { coachId: me.id, coachName: me.displayName },
    };
    return encodeCoachCode(env);
}
