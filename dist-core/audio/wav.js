"use strict";
// Minimal WAV encoder (PCM 16-bit mono)
Object.defineProperty(exports, "__esModule", { value: true });
exports.wavHeader = wavHeader;
exports.encodeWav16Mono = encodeWav16Mono;
function wavHeader(params) {
    const { sampleRate, numSamples } = params;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const chunkSize = 36 + dataSize;
    const b = new Uint8Array(44);
    const dv = new DataView(b.buffer);
    // RIFF
    writeAscii(b, 0, 'RIFF');
    dv.setUint32(4, chunkSize, true);
    writeAscii(b, 8, 'WAVE');
    // fmt
    writeAscii(b, 12, 'fmt ');
    dv.setUint32(16, 16, true); // PCM header size
    dv.setUint16(20, 1, true); // PCM
    dv.setUint16(22, numChannels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, byteRate, true);
    dv.setUint16(32, blockAlign, true);
    dv.setUint16(34, bitsPerSample, true);
    // data
    writeAscii(b, 36, 'data');
    dv.setUint32(40, dataSize, true);
    return b;
}
function encodeWav16Mono(params) {
    const { pcm16leChunks, sampleRate } = params;
    let dataBytes = 0;
    for (const c of pcm16leChunks)
        dataBytes += c.byteLength;
    const numSamples = Math.floor(dataBytes / 2);
    const header = wavHeader({ sampleRate, numSamples });
    const out = new Uint8Array(header.byteLength + dataBytes);
    out.set(header, 0);
    let off = header.byteLength;
    for (const c of pcm16leChunks) {
        out.set(c, off);
        off += c.byteLength;
    }
    return out;
}
function writeAscii(target, offset, s) {
    for (let i = 0; i < s.length; i++)
        target[offset + i] = s.charCodeAt(i) & 255;
}
