"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioRouteEmitter = void 0;
exports.configureVocalCapture = configureVocalCapture;
exports.getCurrentRoute = getCurrentRoute;
exports.listInputs = listInputs;
exports.setPreferredInput = setPreferredInput;
async function configureVocalCapture(_cfg) { }
async function getCurrentRoute() {
    return { routeType: 'unknown', inputUid: null, inputName: 'Mock input' };
}
async function listInputs() {
    return [await getCurrentRoute()];
}
async function setPreferredInput(_uid) {
    return true;
}
exports.audioRouteEmitter = {
    addListener: (_event, _fn) => ({ remove: () => { } }),
};
