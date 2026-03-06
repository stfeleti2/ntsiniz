# EPIC 14 — Duets (Offline-first)

Ntsiniz duets are **async collabs** built to work **without a backend**.

## How it works

1) **Inviter records Part A** (WAV, PCM16 mono)
2) App generates a **Duet Pack** file: `ntsiniz_duet_<inviteId>.ntsduet`
   - contains `manifest.json`
   - contains `partA.wav`
3) Inviter shares the `.ntsduet` file (AirDrop/WhatsApp/Email/etc.)
4) Responder **imports** the `.ntsduet` file
5) Responder records **Part B** (WAV)
6) App performs **on-device WAV mixing** → `mix.wav`
7) Mix can be **shared** (audio) or **posted** to the local community feed.

## Notes

- **Headphones recommended** while recording Part B to avoid re-recording Part A.
- The mix algorithm is a simple PCM16 mono sum with gain + clamp.
- Duet posts are **local-first**. If you want cross-device playback, add media storage in cloud sync (Supabase storage bucket) and store a remote URL in the post payload.

## Dependencies

- `expo-document-picker` for importing `.ntsduet` files
- `jszip` for reading/writing duet packs

If Expo warns about version mismatches:

```bash
npx expo install expo-document-picker
```
