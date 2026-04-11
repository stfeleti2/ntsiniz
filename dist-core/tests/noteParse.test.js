"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const noteParse_1 = require("../pitch/noteParse");
(0, node_test_1.default)("parseNoteToMidi parses sharps/flats", () => {
    strict_1.default.equal((0, noteParse_1.parseNoteToMidi)("C4"), 60);
    strict_1.default.equal((0, noteParse_1.parseNoteToMidi)("A4"), 69);
    strict_1.default.equal((0, noteParse_1.parseNoteToMidi)("C#4"), 61);
    strict_1.default.equal((0, noteParse_1.parseNoteToMidi)("Db4"), 61);
    strict_1.default.equal((0, noteParse_1.parseNoteToMidi)("F-1"), 5);
});
