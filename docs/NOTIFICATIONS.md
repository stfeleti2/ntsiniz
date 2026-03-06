# Notifications (Daily reminders)

Ntsiniz uses **local scheduled notifications** via `expo-notifications`.

## What it does

- When **Reminders** are enabled in Settings, Ntsiniz schedules a repeating daily notification at the chosen time.
- If OS permissions are denied, reminders auto-disable and the app falls back to **in-app nudges**.

## Notes

- Local notifications should work offline.
- Remote push tokens are **not** used in Phase 1.5.

## Dev / testing

- Android: make sure POST_NOTIFICATIONS permission is granted on Android 13+.
- iOS: notifications require permission; allow when prompted.
