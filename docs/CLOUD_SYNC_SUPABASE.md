# Cloud Sync (Supabase) — EPIC 13.5

Ntsiniz is offline-first. Cloud sync is **optional** and only used to:
- keep your profile + community posts + leaderboard entries across devices
- make follows/friends stable

This repo ships with a **Supabase adapter**, disabled unless you set keys.

## 1) Add keys

Set these environment variables (recommended for CI / EAS) OR put them under `extra` in `app.config.ts`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

When those keys exist, the app will show **Settings → Account & Sync**.

## 2) Create tables

Run this SQL in Supabase (SQL editor). It uses **bigint millis** timestamps.

```sql
-- Public data (readable by everyone). Writes restricted to owner.

create table if not exists people (
  id text primary key,
  createdAt bigint not null,
  updatedAt bigint not null,
  displayName text not null,
  avatarSeed text,
  bio text
);

create table if not exists posts (
  id text primary key,
  createdAt bigint not null,
  updatedAt bigint not null,
  authorId text not null,
  authorName text not null,
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null,
  expiresAt bigint,
  hidden boolean not null default false
);

create table if not exists challenge_submissions (
  id text primary key,
  createdAt bigint not null,
  updatedAt bigint not null,
  period text not null,
  periodKey text not null,
  challengeId text not null,
  userId text not null,
  displayName text not null,
  score double precision not null,
  details jsonb not null,
  expiresAt bigint,
  hidden boolean not null default false
);

create table if not exists post_reactions (
  postId text not null,
  userId text not null,
  reaction text not null,
  createdAt bigint not null,
  updatedAt bigint not null,
  primary key (postId, userId)
);

create table if not exists post_comments (
  id text primary key,
  postId text not null,
  userId text not null,
  userName text not null,
  createdAt bigint not null,
  updatedAt bigint not null,
  body text not null,
  hidden boolean not null default false
);

create table if not exists clips (
  id text primary key,
  createdAt bigint not null,
  updatedAt bigint not null,
  userId text not null,
  displayName text not null,
  templateId text not null,
  title text not null,
  durationMs bigint not null,
  videoUri text,
  thumbnailUri text,
  score double precision not null,
  metrics jsonb not null,
  hidden boolean not null default false
);

create table if not exists follows (
  followerId text not null,
  followeeId text not null,
  createdAt bigint not null,
  updatedAt bigint not null,
  primary key (followerId, followeeId)
);

create index if not exists idx_posts_updated on posts(updatedAt);
create index if not exists idx_subs_updated on challenge_submissions(updatedAt);
create index if not exists idx_people_updated on people(updatedAt);
create index if not exists idx_reacts_updated on post_reactions(updatedAt);
create index if not exists idx_comments_updated on post_comments(updatedAt);
create index if not exists idx_clips_updated on clips(updatedAt);
create index if not exists idx_follows_updated on follows(updatedAt);
```

## 3) RLS policies (minimum viable)

Enable RLS for all tables.

**Simple approach (fastest):**
- allow public SELECT for `people`, `posts`, `challenge_submissions`
- allow INSERT/UPDATE only if the row owner matches `auth.uid()`

Because Ntsiniz uses `people.id` = `auth.uid()` when signed in, this works.

> You can start with “public read, owner write” and tighten later.

## 4) How sync works

- App enqueues local changes into `sync_queue`.
- When signed in + online, it:
  - pushes queued ops via `upsert`
  - pulls remote rows where `updatedAt > lastPullAt`

## 5) Known limitations

- Performance videos are stored on-device. Cloud sync only pulls a *card* for remote clips.
  If you want true cross-device clip playback, add Supabase Storage and store a public URL.

