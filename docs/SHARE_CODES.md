# Share Codes (Offline-first)

Ntsiniz uses **share codes** as a lightweight, offline-first way to:

- Add a friend (profile)
- Import a friend's challenge score (leaderboard)
- Import a post into your feed

## Deep link format

The app supports a scheme URL:

`ntsiniz://import?code=<CODE>`

If a platform strips links, users can copy/paste the raw code into:

**Settings → Community → Import** (or Community tab → Import).

## Expiry

- Profile codes: ~60 days
- Posts/submissions: ~14–30 days

Expired codes are rejected.

## Safety

- Basic profanity guardrails for names/comments
- Users can block people and hide posts locally

_Note: this is not server moderation. If you add cloud sync later, server-side moderation becomes required._
