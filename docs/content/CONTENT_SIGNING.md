# Content manifest signing

Status:

- ✅ Manifest hashing (SHA-256) via `npm run gen:content-manifest`
- ✅ Detached signature generation via `npm run sign:content-manifest`
- ✅ CI gate verifies signature via `npm run check:content-signature`
- 🟡 Runtime signature verification depends on WebCrypto availability (`globalThis.crypto.subtle`)

## How it works

1. `npm run gen:content-manifest` creates `src/content/manifests/content.manifest.json`.
2. `npm run gen:content-keys` generates RSA keys **locally** in `scripts/content-keys/`.
   - `content_signing_private.pem` is ignored by git (`scripts/content-keys/.gitignore`).
3. `npm run sign:content-manifest` signs the canonical manifest payload and writes:
   - `src/content/manifests/content.manifest.sig.json` (public key + signature + signed payload)
4. Runtime uses `src/core/content/verifyManifestSignature.ts` to verify the signature (if supported).

## Production guidance

- Do **not** ship with the default local key.
- For release builds, provide your signing key via env:
  - `CONTENT_MANIFEST_PRIVATE_KEY_PATH=/abs/path/to/private.pem`
  - `CONTENT_MANIFEST_PUBLIC_KEY_PATH=/abs/path/to/public.pem`

## Remote enforcement

Remote config can require signature verification:

```json
{
  "security": { "requireManifestSignature": true },
  "compat": { "minManifestSchema": 3 }
}
```

When required, loaders will fail closed in production if the manifest signature status is not `verified`.
