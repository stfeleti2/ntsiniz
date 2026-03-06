# Voice demos

Phase 1.5 ships with **offline-first voice-ish demo clips** in:

`assets/audio/*.wav`

They exist to prove the pipeline end-to-end (no network required).

## Replacing with real recorded voice

1. Record short clips (10–20s is plenty) as `.wav` or `.mp3`.
2. Drop them into `assets/audio/`.
3. Update `src/app/audio/lessonVoiceAssets.ts` to point each lesson id to the new file.

No DB changes required.
