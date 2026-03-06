"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodingType = exports.documentDirectory = exports.cacheDirectory = void 0;
exports.getInfoAsync = getInfoAsync;
exports.makeDirectoryAsync = makeDirectoryAsync;
exports.writeAsStringAsync = writeAsStringAsync;
exports.readAsStringAsync = readAsStringAsync;
exports.copyAsync = copyAsync;
exports.deleteAsync = deleteAsync;
exports.moveAsync = moveAsync;
exports.getContentUriAsync = getContentUriAsync;
exports.cacheDirectory = '/tmp/';
exports.documentDirectory = '/tmp/';
exports.EncodingType = {
    UTF8: 'utf8',
    Base64: 'base64',
};
async function getInfoAsync(_uri) {
    return { exists: false };
}
async function makeDirectoryAsync(_uri, _opts) { }
async function writeAsStringAsync(_uri, _data, _opts) { }
async function readAsStringAsync(_uri, _opts) {
    return '';
}
async function copyAsync(_params) { }
async function deleteAsync(_uri, _opts) { }
async function moveAsync(_params) { }
async function getContentUriAsync(uri) {
    return uri;
}
exports.default = {
    cacheDirectory: exports.cacheDirectory,
    documentDirectory: exports.documentDirectory,
    EncodingType: exports.EncodingType,
    getInfoAsync,
    makeDirectoryAsync,
    writeAsStringAsync,
    readAsStringAsync,
    copyAsync,
    deleteAsync,
    moveAsync,
    getContentUriAsync,
};
