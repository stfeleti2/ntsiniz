import { getDb, exec, query } from "./db"

export type Settings = {
  language: "en" | "zu" | "xh" | "af" | "st" | "tn" | "ts" | "nso" | "ve" | "nr"
  voiceCoaching: boolean
  coachPlayback: boolean
  listenThenSing: boolean
  soundCues: boolean
  sensitivity: number // 0.5..2 (multiplier)
  noiseGateRms: number // 0..1
  hasCalibrated: boolean

  /** Phase-1 onboarding wizard completion flag. */
  onboardingComplete?: boolean
  /** Selected onboarding goal (used to tailor the first win + home suggestions). */
  onboardingGoal?: 'practice' | 'social' | 'compete' | 'coach'
  onboardingIntent?:
    | 'justStarting'
    | 'singInTune'
    | 'moreControl'
    | 'songsBetter'
    | 'choirWorship'
    | 'justExplore'
  coachingMode?: 'starter' | 'casual' | 'practised' | 'performerCoach'
  singingLevel?: 'justStarting' | 'casual' | 'serious' | 'professionalCoach'
  helperDensity?: 'light' | 'balanced' | 'high'
  guideTone?: 'gentle' | 'balanced' | 'direct'
  routeHint?: 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | null
  firstWinComplete?: boolean
  firstWinVersion?: number
  sacredMomentsHoldout?: boolean
  legacyCurriculumFallback?: boolean

  /** Permission primers (anti-anxiety, store-friendly). */
  seenMicPrimer?: boolean
  seenCameraPrimer?: boolean

  /** Ghost Guide advanced visuals (Pro-only; UI can expose a locked toggle). */
  ghostAdvanced?: boolean

  // Retention hooks (offline-first)
  remindersEnabled?: boolean
  reminderHour?: number // 0..23
  reminderMinute?: number // 0..59
  /** OS scheduled notification identifier (platform-managed). */
  reminderNotificationId?: string | null

  /**
   * QA-only flags (dev builds). Safe to ignore in production.
   * These exist to make automated tests deterministic without OS/system dialogs.
   */
  qaSimulatedMic?: boolean
  qaMockShare?: boolean
  qaBypassMicPermission?: boolean

  /** Dev-only: show a small perf overlay to catch JS stalls. */
  devPerfOverlayEnabled?: boolean

  /** Privacy: allow crash reporting to Sentry (if configured). */
  telemetryCrashReportingEnabled?: boolean
  telemetryCrashReportingDecidedAt?: number

  /** Premium perf strategy: adaptive UI fidelity. AUTO chooses per device + runtime perf. */
  qualityMode?: 'AUTO' | 'HIGH' | 'BALANCED' | 'LITE'

  /** Which curriculum program is active. */
  activeCurriculum?: 'phase1' | 'pro_regimen' | 'pro_regimen12'
  /** Which track is active for multi-track programs. */
  activeTrack?: 'beginner' | 'intermediate' | 'advanced'

  /** Recording route preferences */
  allowBluetoothMic?: boolean
  preferBuiltInMic?: boolean
  preferredInputUid?: string | null

  /** Mic test calibration (best-effort guidance). */
  micCalibratedRms?: number
  micCalibratedPeak?: number
  micCalibratedClipped?: boolean

  /** Preferred audio input format (best-effort). */
  preferredSampleRate?: number

  /** DSP quality path (native/JIT). */
  dspEnabled?: boolean
  dspSuppressionMode?: 'off' | 'conservativeAdaptive'
  roomReadCalibration?: {
    completedAt?: number
    noiseFloorDb?: number
    snrDb?: number
    routeStabilityScore?: number
  } | null

  /** 7-day Pitch Lock Challenge state (optional, stored locally). */
  pitchLockChallenge?: any
}

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  voiceCoaching: false,
  coachPlayback: true,
  listenThenSing: true,
  soundCues: true,
  sensitivity: 1,
  noiseGateRms: 0.02,
  hasCalibrated: false,
  qaSimulatedMic: false,
  qaMockShare: false,
  qaBypassMicPermission: false,

  remindersEnabled: false,
  reminderHour: 19,
  reminderMinute: 0,
  reminderNotificationId: null,

  seenMicPrimer: false,
  seenCameraPrimer: false,
  ghostAdvanced: false,
  onboardingIntent: 'justExplore',
  coachingMode: 'starter',
  singingLevel: 'justStarting',
  helperDensity: 'high',
  guideTone: 'gentle',
  routeHint: null,
  firstWinComplete: false,
  firstWinVersion: 0,
  sacredMomentsHoldout: true,
  legacyCurriculumFallback: true,

  devPerfOverlayEnabled: false,
  telemetryCrashReportingEnabled: true,

  qualityMode: 'AUTO',
  activeCurriculum: 'phase1',
  activeTrack: 'beginner',
  allowBluetoothMic: true,
  preferBuiltInMic: false,
  preferredInputUid: null,

  micCalibratedRms: 0,
  micCalibratedPeak: 0,
  micCalibratedClipped: false,
  preferredSampleRate: 0,
  dspEnabled: true,
  dspSuppressionMode: 'conservativeAdaptive',
  roomReadCalibration: null,
}

export async function getSettings(): Promise<Settings> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM settings WHERE id = 'default' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_SETTINGS
  return safeParseMerge(rows[0].data, DEFAULT_SETTINGS)
}

export async function upsertSettings(s: Settings) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO settings (id, data) VALUES ('default', ?) 
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [JSON.stringify(s)],
  )
}

function safeParseMerge<T extends Record<string, any>>(v: any, fallback: T): T {
  try {
    const obj = typeof v === "string" ? JSON.parse(v) : v
    if (!obj || typeof obj !== "object") return fallback
    return { ...fallback, ...obj }
  } catch {
    return fallback
  }
}
