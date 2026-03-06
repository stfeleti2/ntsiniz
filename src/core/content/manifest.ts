import { stableStringify } from '../util/stableStringify'
import { sha256Hex } from '../util/sha256'

export type ContentManifestEntry = {
  id: string
  file: string
  sha256: string
  sizeBytes?: number
  canonical?: 'stable-json-v1'
  version: number
  minApp?: string
}

export type ContentManifest = {
  schema: 3
  generatedAt: string
  algo?: 'sha256'
  /** Unique id for this manifest (hash of canonical manifest JSON). */
  manifestId?: string
  entries: ContentManifestEntry[]
}

export type ManifestSignatureStatus = 'unknown' | 'verified' | 'failed' | 'unsupported'

let manifestSigStatus: ManifestSignatureStatus = 'unknown'

export function setManifestSignatureStatus(s: ManifestSignatureStatus) {
  manifestSigStatus = s
}

export function getManifestSignatureStatus(): ManifestSignatureStatus {
  return manifestSigStatus
}

export function computeEntryHashFromObject(obj: any): string {
  return sha256Hex(stableStringify(obj))
}

export function verifyManifestEntry(entry: ContentManifestEntry, obj: any): { ok: true } | { ok: false; reason: string } {
  const h = computeEntryHashFromObject(obj)
  if (h !== entry.sha256) return { ok: false, reason: `hash_mismatch expected=${entry.sha256} got=${h}` }
  return { ok: true }
}
