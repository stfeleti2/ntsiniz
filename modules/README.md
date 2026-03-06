# Optional native modules (streaming audio)

Ntsiniz is built to run in **Expo-managed** mode by default.

For **best-in-class recording quality + stability on long takes**, there are two optional native modules you can add and prebuild:

1) `AudioFormatProbe` — probes device-native mic capabilities (sample rate, channels, IO buffer).
2) `WavFileWriter` — true incremental writes (PCM → WAV) with an atomic finalize.

These are not required for the MVP loop to work, but they unlock the Phase 2 engine goals:

* 10+ minute takes with **no memory spikes**
* Prefer native **48kHz** where available
* IO buffers decoupled from pitch frame cadence

## How to use

1. Implement the modules using **expo-modules** (recommended) or a classic RN native module.
2. Run `npm run prebuild` and build on device.

The JS/TS side already attempts to load these modules at runtime:

* `src/core/audio/audioFormatProbe.ts`
* `src/core/audio/nativeWavWriter.ts`

If the modules are not present, the app falls back to safe defaults.
