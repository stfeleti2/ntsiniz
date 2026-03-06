import type { ContentManifest } from './manifest'
import { getManifestSignatureStatus, verifyManifestEntry } from './manifest'
import { coreError } from '@/core/util/errors'
import { maxAppVersion, minAppVersion, minManifestSchema, requireManifestSignature } from '@/core/config/flags'
import { getAppVersion } from '@/core/config/appVersion'
import { isVersionInRange } from '@/core/util/version'

// Static import for the manifest (Metro-friendly).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const manifest: ContentManifest = require('@/content/manifests/content.manifest.json')

type GetBundledContentJson = (filePath: string) => any
let _contentGetter: GetBundledContentJson | null = null

function getBundledContentJson(filePath: string) {
  if (!_contentGetter) {
    // Keep this as runtime require so core-only build does not pull src/content into rootDir.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/content/contentIndex') as { getBundledContentJson: GetBundledContentJson }
    _contentGetter = mod.getBundledContentJson
  }
  return _contentGetter(filePath)
}

function assertContentSecurity(): void {
  const appVersion = getAppVersion()
  const minV = minAppVersion()
  const maxV = maxAppVersion()
  if (!isVersionInRange({ version: appVersion, min: minV, max: maxV })) {
    coreError('content_compat_app_version_out_of_range', { appVersion, minV, maxV })
    if (!__DEV__) throw new Error(`App version not compatible with content policy (${appVersion} not in [${minV ?? '-inf'}, ${maxV ?? '+inf'}])`)
  }

  const minSchema = minManifestSchema()
  if (minSchema != null && manifest.schema < minSchema) {
    coreError('content_manifest_schema_too_old', { schema: manifest.schema, minSchema })
    if (!__DEV__) throw new Error(`Content manifest schema too old: ${manifest.schema} < ${minSchema}`)
  }

  if (requireManifestSignature()) {
    const s = getManifestSignatureStatus()
    if (s !== 'verified') {
      coreError('content_manifest_signature_required_but_not_verified', { status: s })
      if (!__DEV__) throw new Error(`Content manifest signature required but not verified (status=${s})`)
    }
  }
}

export function loadContentJson<T>(filePath: string): T {
  assertContentSecurity()
  const raw = getBundledContentJson(filePath)
  if (!raw) throw new Error(`Missing bundled content file: ${filePath}`)

  const entry = manifest.entries.find((e) => e.file === filePath)
  if (!entry) {
    coreError('content_manifest_missing_entry', { filePath })
    // Fail closed in prod: content without manifest entry is considered invalid.
    if (!__DEV__) throw new Error(`Content manifest missing entry for ${filePath}`)
    return raw as T
  }

  const v = verifyManifestEntry(entry, raw)
  if (!v.ok) {
    coreError('content_manifest_verify_failed', { filePath, reason: v.reason })
    if (!__DEV__) throw new Error(`Content verification failed for ${filePath}: ${v.reason}`)
  }

  return raw as T
}

export function tryLoadContentJson<T>(filePath: string): T | null {
  try {
    return loadContentJson<T>(filePath)
  } catch {
    return null
  }
}
