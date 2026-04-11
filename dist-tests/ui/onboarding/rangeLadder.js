"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANGE_LADDER_BOTTOM_TO_TOP = exports.RANGE_LADDER_TOP_TO_BOTTOM = void 0;
exports.likelyZoneFromBand = likelyZoneFromBand;
exports.likelyZoneFromMidi = likelyZoneFromMidi;
exports.RANGE_LADDER_TOP_TO_BOTTOM = ['Highest', 'Soprano', 'Mezzo', 'Alto', 'Tenor', 'Baritone', 'Bass', 'Lowest'];
exports.RANGE_LADDER_BOTTOM_TO_TOP = ['Lowest', 'Bass', 'Baritone', 'Tenor', 'Alto', 'Mezzo', 'Soprano', 'Highest'];
function likelyZoneFromBand(band) {
    if (band.low == null || band.high == null)
        return 'Alto';
    return likelyZoneFromMidi((band.low + band.high) / 2);
}
function likelyZoneFromMidi(centerMidi) {
    if (!Number.isFinite(centerMidi))
        return 'Alto';
    if (centerMidi < 47)
        return 'Bass';
    if (centerMidi < 52)
        return 'Baritone';
    if (centerMidi < 57)
        return 'Tenor';
    if (centerMidi < 62)
        return 'Alto';
    if (centerMidi < 66)
        return 'Mezzo';
    return 'Soprano';
}
