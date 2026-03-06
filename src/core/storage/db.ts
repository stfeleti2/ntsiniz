import * as SQLite from "expo-sqlite"

let db: any = null

export async function getDb(): Promise<any> {
  if (db) return db
  // Expo SDK 54: openDatabaseAsync exists; fallback for older APIs.
  const sqliteAny = SQLite as any
  db = sqliteAny.openDatabaseAsync ? await sqliteAny.openDatabaseAsync("ntsiniz.db") : sqliteAny.openDatabase("ntsiniz.db")
  return db
}

export async function initDb() {
  const d = await getDb()
  await exec(d, `PRAGMA journal_mode = WAL;`)
  // Data integrity: always enforce foreign keys where available.
  // (SQLite requires enabling this per-connection.)
  await exec(d, `PRAGMA foreign_keys = ON;`)

  await exec(
    d,
    `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      appliedAt INTEGER NOT NULL
    );
    `,
  )
  await exec(
    d,
    `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      startedAt INTEGER NOT NULL,
      endedAt INTEGER,
      tip TEXT,
      summary TEXT
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      sessionId TEXT NOT NULL,
      drillId TEXT NOT NULL,
      score REAL NOT NULL,
      metrics TEXT NOT NULL,
      durationMs INTEGER,
      avgConfidence REAL,
      framesAnalyzed INTEGER,
      strictness REAL,
      deviceClass TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(sessionId);
    CREATE INDEX IF NOT EXISTS idx_attempts_drill ON attempts(drillId);

    -- Best-take mapping (per session + drill). Keeps UI fast without rescanning.
    CREATE TABLE IF NOT EXISTS best_takes (
      sessionId TEXT NOT NULL,
      drillId TEXT NOT NULL,
      attemptId TEXT NOT NULL,
      score REAL NOT NULL,
      updatedAt INTEGER NOT NULL,
      PRIMARY KEY (sessionId, drillId)
    );
    CREATE INDEX IF NOT EXISTS idx_best_takes_session ON best_takes(sessionId);
    CREATE INDEX IF NOT EXISTS idx_best_takes_drill ON best_takes(drillId);
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY NOT NULL,
      updatedAt INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS remote_config (
    key TEXT PRIMARY KEY,
    valueJson TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );

    -- Audit log (trust-by-default): security/privacy relevant actions.
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      kind TEXT NOT NULL,
      entityKind TEXT,
      entityId TEXT,
      payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_events_createdAt ON audit_events(createdAt);

    -- Retention state (EPIC 20): daily flags + weekly goals (offline-first)
    CREATE TABLE IF NOT EXISTS retention_state (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );

    -- Entitlements (EPIC 19): local purchase state / feature gating.
    CREATE TABLE IF NOT EXISTS entitlements (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );

    -- Social-lite (offline-first). These tables back EPIC 12/13.
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL, -- self | friend
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      displayName TEXT NOT NULL,
      avatarSeed TEXT,
      bio TEXT,
      isBlocked INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_people_kind ON people(kind);

    CREATE TABLE IF NOT EXISTS challenge_submissions (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      period TEXT NOT NULL, -- daily | weekly
      periodKey TEXT NOT NULL, -- YYYY-MM-DD | YYYY-Www
      challengeId TEXT NOT NULL,
      userId TEXT NOT NULL,
      displayName TEXT NOT NULL,
      score REAL NOT NULL,
      details TEXT NOT NULL,
      source TEXT NOT NULL, -- self | import
      expiresAt INTEGER,
      hidden INTEGER NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_challenge_submissions ON challenge_submissions(period, periodKey, challengeId, userId);
    CREATE INDEX IF NOT EXISTS idx_challenge_submissions_ch ON challenge_submissions(period, periodKey, challengeId);

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      authorId TEXT NOT NULL,
      authorName TEXT NOT NULL,
      type TEXT NOT NULL, -- progress | challenge
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      payload TEXT NOT NULL,
      source TEXT NOT NULL, -- self | import
      expiresAt INTEGER,
      hidden INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts(createdAt);
    CREATE INDEX IF NOT EXISTS idx_posts_authorId ON posts(authorId);

    CREATE TABLE IF NOT EXISTS post_reactions (
      postId TEXT NOT NULL,
      userId TEXT NOT NULL,
      reaction TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      hidden INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (postId, userId)
    );
    CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(postId);
    CREATE INDEX IF NOT EXISTS idx_post_reactions_post_hidden ON post_reactions(postId, hidden);

    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY NOT NULL,
      postId TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      body TEXT NOT NULL,
      hidden INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(postId, createdAt);

    -- Performance clips (EPIC 11). Stores on-device video + metadata.
    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      userId TEXT NOT NULL,
      displayName TEXT NOT NULL,
      templateId TEXT NOT NULL,
      title TEXT NOT NULL,
      durationMs INTEGER NOT NULL,
      videoUri TEXT NOT NULL,
      thumbnailUri TEXT,
      score REAL NOT NULL,
      metrics TEXT NOT NULL,
      hidden INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_clips_createdAt ON clips(createdAt);
    CREATE INDEX IF NOT EXISTS idx_clips_userId ON clips(userId);

    -- Cloud identity + sync (EPIC 13.5)
    CREATE TABLE IF NOT EXISTS identities (
      id TEXT PRIMARY KEY NOT NULL,
      provider TEXT NOT NULL,
      remoteUserId TEXT,
      email TEXT,
      updatedAt INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uq_identities_provider_remote ON identities(provider, remoteUserId);

    CREATE TABLE IF NOT EXISTS sync_state (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      tries INTEGER NOT NULL DEFAULT 0,
      kind TEXT NOT NULL, -- people | posts | reactions | comments | submissions | clips | follows
      entityId TEXT NOT NULL,
      action TEXT NOT NULL, -- upsert | delete | hide
      payload TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sync_queue_createdAt ON sync_queue(createdAt);

    -- Dead-letter queue: once an op exceeds retry budget, park it here for inspection.
    CREATE TABLE IF NOT EXISTS sync_deadletter (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      kind TEXT NOT NULL,
      entityId TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      updatedAt INTEGER NOT NULL,
      lastError TEXT
    );

    CREATE TABLE IF NOT EXISTS follows (
      followerId TEXT NOT NULL,
      followeeId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      PRIMARY KEY (followerId, followeeId)
    );
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(followerId);

    -- Duets (EPIC 14). Offline-first async collabs via shareable duet packs.
    CREATE TABLE IF NOT EXISTS duets (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      inviteId TEXT NOT NULL,
      role TEXT NOT NULL, -- inviter | responder
      inviterId TEXT NOT NULL,
      inviterName TEXT NOT NULL,
      title TEXT NOT NULL,
      sampleRate INTEGER NOT NULL,
      durationMs INTEGER NOT NULL,
      partAUri TEXT NOT NULL,
      partBUri TEXT,
      mixUri TEXT,
      status TEXT NOT NULL, -- invited | recorded | mixed
      source TEXT NOT NULL, -- self | import
      expiresAt INTEGER,
      hidden INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_duets_createdAt ON duets(createdAt);
    CREATE INDEX IF NOT EXISTS idx_duets_inviteId ON duets(inviteId);

    -- Moderation + scale readiness (EPIC 18)
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      reporterId TEXT NOT NULL,
      reporterName TEXT NOT NULL,
      entityKind TEXT NOT NULL, -- post | comment | clip
      entityId TEXT NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL -- open | resolved
    );
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, updatedAt);

    -- Competitions (EPIC 17)
    CREATE TABLE IF NOT EXISTS competition_submissions (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      competitionId TEXT NOT NULL,
      roundId TEXT NOT NULL,
      userId TEXT NOT NULL,
      displayName TEXT NOT NULL,
      clipId TEXT NOT NULL,
      score REAL NOT NULL,
      durationMs INTEGER,
      avgConfidence REAL,
      framesAnalyzed INTEGER,
      strictness REAL,
      deviceClass TEXT,
      notes TEXT,
      source TEXT NOT NULL, -- self | import
      hidden INTEGER NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_competition_sub ON competition_submissions(competitionId, roundId, userId);
    CREATE INDEX IF NOT EXISTS idx_competition_leader ON competition_submissions(competitionId, roundId, score);

    -- Marketplace (EPIC 16)
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      userId TEXT NOT NULL,
      programId TEXT NOT NULL,
      coachId TEXT NOT NULL,
      currentDay INTEGER NOT NULL,
      completedDaysJson TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollments_user_program ON enrollments(userId, programId);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(userId, updatedAt);

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      coachId TEXT NOT NULL,
      coachName TEXT NOT NULL,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      clipId TEXT,
      message TEXT NOT NULL,
      response TEXT,
      status TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_coach ON feedback(coachId, updatedAt);
    `,
  )

  // Incremental migrations (safe, idempotent). Keep these small.
  await runMigrations(d)
}

async function runMigrations(d: any) {
  async function hasTable(name: string): Promise<boolean> {
    const rows = await query<any>(d, `SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1;`, [name])
    return !!rows[0]
  }

  async function hasColumn(table: string, column: string): Promise<boolean> {
    const rows = await query<any>(d, `PRAGMA table_info(${table});`, [])
    return rows.some((r: any) => String(r.name) === column)
  }

  // Helper: apply once, transactionally.
  // - If any statement fails, the whole migration rolls back.
  // - We only mark schema_migrations after post-check passes.
  async function apply(version: number, fn: () => Promise<void>, postCheck?: () => Promise<boolean>) {
    const rows = await query<any>(d, `SELECT version FROM schema_migrations WHERE version = ? LIMIT 1;`, [version])
    if (rows[0]) return

    await withTransaction(d, async () => {
      await fn()
      if (postCheck) {
        const ok = await postCheck()
        if (!ok) throw new Error(`Migration ${version} post-check failed`)
      }
      await exec(d, `INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?);`, [version, Date.now()])
    })
  }

  async function execIdempotent(sql: string, params: any[] = []) {
    try {
      await exec(d, sql, params)
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? '')
      const ok =
        msg.includes('duplicate column name') ||
        msg.includes('already exists') ||
        msg.includes('duplicate key') ||
        msg.includes('UNIQUE constraint failed')
      if (!ok) throw e
    }
  }

  // v1: sync queue retry metadata
  await apply(
    1,
    async () => {
    // Add columns used for backoff. Ignore if already present.
    await execIdempotent(`ALTER TABLE sync_queue ADD COLUMN nextAttemptAt INTEGER;`)
    await execIdempotent(`ALTER TABLE sync_queue ADD COLUMN lastError TEXT;`)
    await execIdempotent(`CREATE INDEX IF NOT EXISTS idx_sync_queue_nextAttempt ON sync_queue(nextAttemptAt);`)
    },
    async () => (await hasTable('sync_queue')) && (await hasColumn('sync_queue', 'nextAttemptAt')),
  )

  // v2: competition submission proof metadata
  await apply(
    2,
    async () => {
    await execIdempotent(`ALTER TABLE competition_submissions ADD COLUMN durationMs INTEGER;`)
    await execIdempotent(`ALTER TABLE competition_submissions ADD COLUMN avgConfidence REAL;`)
    await execIdempotent(`ALTER TABLE competition_submissions ADD COLUMN framesAnalyzed INTEGER;`)
    await execIdempotent(`ALTER TABLE competition_submissions ADD COLUMN strictness REAL;`)
    await execIdempotent(`ALTER TABLE competition_submissions ADD COLUMN deviceClass TEXT;`)
    await execIdempotent(`CREATE INDEX IF NOT EXISTS idx_competition_proof ON competition_submissions(competitionId, roundId, avgConfidence);`)
    },
    async () => (await hasTable('competition_submissions')) && (await hasColumn('competition_submissions', 'avgConfidence')),
  )

  // v3: take file journal (crash-safe save/index)
  await apply(
    3,
    async () => {
    await exec(
      d,
      `
      CREATE TABLE IF NOT EXISTS take_files (
        id TEXT PRIMARY KEY NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        path TEXT NOT NULL,
        tmpPath TEXT,
        status TEXT NOT NULL, -- saving | saved | indexed | deleted
        attemptId TEXT,
        sessionId TEXT,
        drillId TEXT,
        metaJson TEXT
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_take_files_path ON take_files(path);
      CREATE INDEX IF NOT EXISTS idx_take_files_status ON take_files(status, updatedAt);
      `,
      [],
    )
    },
    async () => await hasTable('take_files'),
  )

  // v4: promote attempt analytics columns (reduce JSON-in-text drift)
  await apply(
    4,
    async () => {
      await execIdempotent(`ALTER TABLE attempts ADD COLUMN durationMs INTEGER;`)
      await execIdempotent(`ALTER TABLE attempts ADD COLUMN avgConfidence REAL;`)
      await execIdempotent(`ALTER TABLE attempts ADD COLUMN framesAnalyzed INTEGER;`)
      await execIdempotent(`ALTER TABLE attempts ADD COLUMN strictness REAL;`)
      await execIdempotent(`ALTER TABLE attempts ADD COLUMN deviceClass TEXT;`)
      await execIdempotent(`CREATE INDEX IF NOT EXISTS idx_attempts_createdAt ON attempts(createdAt);`)
      await execIdempotent(`CREATE INDEX IF NOT EXISTS idx_attempts_score ON attempts(score);`)
    },
    async () => (await hasTable('attempts')) && (await hasColumn('attempts', 'durationMs')),
  )

  // v5: unify social soft-delete semantics for reactions
  await apply(
    5,
    async () => {
      await execIdempotent(`ALTER TABLE post_reactions ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;`)
      await execIdempotent(`CREATE INDEX IF NOT EXISTS idx_post_reactions_post_hidden ON post_reactions(postId, hidden);`)
    },
    async () => (await hasTable('post_reactions')) && (await hasColumn('post_reactions', 'hidden')),
  )

  // v6: consolidate legacy audit_log into audit_events (governance single source)
  await apply(
    6,
    async () => {
      const exists = await hasTable('audit_log')
      if (exists) {
        // Best-effort migrate: map action->kind, store rest into payload.
        const rows = await query<any>(d, `SELECT * FROM audit_log ORDER BY createdAt ASC;`, [])
        for (const r of rows) {
          const payload = {
            actorId: r.actorId,
            actorName: r.actorName,
            action: r.action,
            targetKind: r.targetKind,
            targetId: r.targetId,
            metaJson: (() => { try { return typeof r.metaJson === "string" ? JSON.parse(r.metaJson) : (r.metaJson ?? {}) } catch { return {} } })(),
          }
          await exec(d, `INSERT OR IGNORE INTO audit_events (id, createdAt, kind, entityKind, entityId, payload) VALUES (?, ?, ?, ?, ?, ?);`, [
            r.id,
            r.createdAt,
            `legacy.${String(r.action ?? 'audit')}`,
            r.targetKind,
            r.targetId,
            JSON.stringify(payload),
          ])
        }
        await execIdempotent(`DROP TABLE audit_log;`)
      }
    },
    async () => true,
  )
}

function splitStatements(sql: string) {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s + ";")
}

export type SqlBatchEntry = { sql: string; args?: any[] }

export async function exec(d: any, sql: string, params?: any[]): Promise<void>
export async function exec(d: any, batch: SqlBatchEntry[]): Promise<void>
export async function exec(d: any, sqlOrBatch: string | SqlBatchEntry[], params: any[] = []) {
  const isBatch = Array.isArray(sqlOrBatch)

  const batch: SqlBatchEntry[] = isBatch
    ? (sqlOrBatch as SqlBatchEntry[])
    : splitStatements(sqlOrBatch as string).map((st) => ({ sql: st, args: params }))

  if (!isBatch) {
    const statements = splitStatements(sqlOrBatch as string)
    // If caller provided params for multi-statement SQL, that’s a bug waiting to happen.
    // Force callers to use batch entries with per-statement args.
    if (statements.length > 1 && params.length > 0) {
      throw new Error('exec(): params with multi-statement SQL is not allowed; pass a batch with per-statement args')
    }
  }

  // New async API (Expo SDK 54+): use runAsync for argument binding.
  if (d && typeof d.runAsync === 'function') {
    for (const b of batch) {
      await d.runAsync(b.sql, b.args ?? [])
    }
    return
  }

  if (d && typeof d.execAsync === 'function') {
    for (const b of batch) {
      const args = b.args ?? []
      if (args.length > 0) {
        throw new Error('execAsync path does not support statement args; runAsync is required')
      }
      await d.execAsync(b.sql)
    }
    return
  }

  // Legacy API: run batch in a transaction, with statement-level diagnostics.
  return await new Promise<void>((resolve, reject) => {
    d.transaction(
      (tx: any) => {
        for (const b of batch) {
          tx.executeSql(
            b.sql,
            b.args ?? [],
            undefined,
            (_tx: any, err: any) => {
              const e = err instanceof Error ? err : new Error(String(err?.message ?? err ?? 'SQL error'))
              ;(e as any).sql = b.sql
              ;(e as any).args = (b.args ?? []).slice(0, 8)
              reject(e)
              return false
            },
          )
        }
      },
      (e: any) => reject(e),
      () => resolve(),
    )
  })
}

export async function query<T = any>(d: any, sql: string, params: any[] = []): Promise<T[]> {
  if (d && typeof d.getAllAsync === "function") return (await d.getAllAsync(sql, params)) as T[]

  return new Promise<T[]>((resolve, reject) => {
    d.transaction((tx: any) => {
      tx.executeSql(
        sql,
        params,
        (_tx: any, res: any) => {
          const out: T[] = []
          for (let i = 0; i < res.rows.length; i++) out.push(res.rows.item(i))
          resolve(out)
        },
        (_tx: any, err: any) => {
          reject(err)
          return false
        },
      )
    })
  })
}


export async function withTransaction<T>(d: any, fn: () => Promise<T>): Promise<T> {
  await exec(d, 'BEGIN;', [])
  try {
    const r = await fn()
    await exec(d, 'COMMIT;', [])
    return r
  } catch (e) {
    await exec(d, 'ROLLBACK;', [])
    throw e
  }
}
