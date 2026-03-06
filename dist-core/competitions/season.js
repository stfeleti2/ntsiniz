"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoundOpen = isRoundOpen;
exports.getActiveRound = getActiveRound;
exports.isSeasonActive = isSeasonActive;
function isRoundOpen(round, now = Date.now()) {
    return now >= round.opensAt && now < round.closesAt;
}
function getActiveRound(comp, now = Date.now()) {
    return comp.rounds.find((r) => isRoundOpen(r, now)) ?? null;
}
function isSeasonActive(season, now = Date.now()) {
    return now >= season.startsAt && now < season.endsAt;
}
