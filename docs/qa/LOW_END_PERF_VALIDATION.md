# Low-end performance validation (Skia + drills)

## Toggle matrix
Run these combinations:
1) Skia overlay ON + recording ON
2) Skia overlay OFF (fallback) + recording ON
3) LOW_END_MODE ON (force fallback) + recording ON
4) Playback waveform seek stress test

## Pass criteria
- No stutters while recording
- Overlay doesn’t hitch during pitch updates
- UI responsive during navigation
- No runaway CPU/battery while idle

## If it fails
- Reduce overlay complexity (fewer segments, stronger viewport culling)
- Lower overlay update rate (e.g., 30fps)
- Keep fallback enabled by default on affected device class
- Consider Skia waveform only if playback is the bottleneck
