import { fromByteArray, toByteArray } from 'base64-js'
import { safeJsonParse } from '@/core/utils/safeJson'

function utf8ToBytes(str: string): Uint8Array {
  // TextEncoder is available on modern RN/Hermes. Provide a fallback.
  if (typeof (globalThis as any).TextEncoder === 'function') {
    return new (globalThis as any).TextEncoder().encode(str)
  }
  // Fallback: encodeURIComponent -> binary string
  const bin = unescape(encodeURIComponent(str))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof (globalThis as any).TextDecoder === 'function') {
    return new (globalThis as any).TextDecoder('utf-8').decode(bytes)
  }
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return decodeURIComponent(escape(bin))
}

export function b64UrlEncodeJson(obj: any): string {
  const json = JSON.stringify(obj)
  const b64 = fromByteArray(utf8ToBytes(json))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function b64UrlDecodeJson<T = any>(code: string): T {
  const pad = code.length % 4 === 0 ? '' : '='.repeat(4 - (code.length % 4))
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bytes = toByteArray(b64)
  const json = bytesToUtf8(bytes)
  return safeJsonParse(json, {}) as T
}