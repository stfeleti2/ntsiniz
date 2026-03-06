import { coreError } from '@/core/util/errors'
import { toByteArray } from 'base64-js'

// NOTE: We purposely avoid adding a crypto library. Runtime verification uses WebCrypto
// (globalThis.crypto.subtle) when available. On runtimes without WebCrypto, verification
// returns 'unsupported'.

export type SignatureVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'invalid_signature' | 'invalid_key' | 'internal_error' }

function pemToDerBytes(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '')
  return base64ToBytes(body)
}

function b64ToBytes(b64: string): Uint8Array {
  return base64ToBytes(b64)
}

function base64ToBytes(b64: string): Uint8Array {
  // Avoid Node Buffer dependency at runtime. base64-js works in RN/Expo and Node.
  return toByteArray(b64)
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function importRsaPublicKey(pem: string): Promise<CryptoKey | null> {
  const subtle = (globalThis as any).crypto?.subtle as SubtleCrypto | undefined
  if (!subtle) return null
  try {
    const der = pemToDerBytes(pem)
    return await subtle.importKey(
      'spki',
      asArrayBuffer(der),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
  } catch (e) {
    coreError('content_signature_import_key_failed', { message: String((e as any)?.message ?? e) })
    return null
  }
}

export async function verifyRsaSha256Signature(args: {
  publicKeyPem: string
  dataUtf8: string
  signatureB64: string
}): Promise<SignatureVerifyResult> {
  const subtle = (globalThis as any).crypto?.subtle as SubtleCrypto | undefined
  if (!subtle) return { ok: false, reason: 'unsupported' }

  const key = await importRsaPublicKey(args.publicKeyPem)
  if (!key) return { ok: false, reason: 'invalid_key' }

  try {
    const enc = new TextEncoder()
    const data = enc.encode(args.dataUtf8)
    const sig = b64ToBytes(args.signatureB64)
    const ok = await subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, asArrayBuffer(sig), asArrayBuffer(data))
    return ok ? { ok: true } : { ok: false, reason: 'invalid_signature' }
  } catch (e) {
    coreError('content_signature_verify_failed', { message: String((e as any)?.message ?? e) })
    return { ok: false, reason: 'internal_error' }
  }
}
