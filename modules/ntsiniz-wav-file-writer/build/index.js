'use strict';

const { requireNativeModule } = require('expo-modules-core');

const mod = requireNativeModule('WavFileWriter');

// Back-compat wrapper: keep a single active writer id in JS.
let activeWriterId = null;

async function appendBatchInternal(writerId, chunks) {
  if (mod.appendPcm16leBase64BatchAsync) {
    return mod.appendPcm16leBase64BatchAsync(writerId, chunks);
  }
  let last = { peak: 0, clipped: false };
  for (const c of chunks) {
    last = await mod.appendPcm16leBase64Async(writerId, c);
  }
  return last;
}

module.exports = {
  default: {
    getInputAudioCapabilities: () => mod.getInputAudioCapabilitiesAsync(),

    // Legacy API
    open: async (path, opts) => {
      activeWriterId = await mod.openWriterAsync(path, opts.sampleRate, opts.channels);
    },
    appendPcm16leBase64: async (pcmBase64) => {
      if (!activeWriterId) throw new Error('WavFileWriter: open() not called');
      return mod.appendPcm16leBase64Async(activeWriterId, pcmBase64);
    },
    appendPcm16leBase64Batch: async (chunks) => {
      if (!activeWriterId) throw new Error('WavFileWriter: open() not called');
      return appendBatchInternal(activeWriterId, chunks);
    },
    finalize: async (opts) => {
      if (!activeWriterId) throw new Error('WavFileWriter: open() not called');
      try {
        await mod.finalizeAsync(activeWriterId, opts.totalSamples);
      } finally {
        activeWriterId = null;
      }
    },
    abort: async () => {
      if (!activeWriterId) return;
      try {
        await mod.abortAsync(activeWriterId);
      } finally {
        activeWriterId = null;
      }
    },

    // New handle-based API
    openWriter: (path, opts) => mod.openWriterAsync(path, opts.sampleRate, opts.channels),
    appendFor: (writerId, pcmBase64) => mod.appendPcm16leBase64Async(writerId, pcmBase64),
    appendBatchFor: (writerId, chunks) => appendBatchInternal(writerId, chunks),
    finalizeFor: (writerId, totalSamples) => mod.finalizeAsync(writerId, totalSamples),
    abortFor: (writerId) => mod.abortAsync(writerId),
  },
};
