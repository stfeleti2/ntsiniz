import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function sortValue(v) {
  if (Array.isArray(v)) return v.map(sortValue)
  if (v && typeof v === 'object') {
    const out = {}
    for (const k of Object.keys(v).sort()) out[k] = sortValue(v[k])
    return out
  }
  return v
}
function stableStringify(v) {
  return JSON.stringify(sortValue(v))
}

const MANIFEST_JSON = path.resolve(process.cwd(), 'src', 'content', 'manifests', 'content.manifest.json')
const KEYS_DIR = path.resolve(process.cwd(), 'scripts', 'content-keys')
const PRIV_PATH = process.env.CONTENT_MANIFEST_PRIVATE_KEY_PATH || path.resolve(KEYS_DIR, 'content_signing_private.pem')
const PUB_PATH = process.env.CONTENT_MANIFEST_PUBLIC_KEY_PATH || path.resolve(KEYS_DIR, 'content_signing_public.pem')
const OUT_JSON = path.resolve(process.cwd(), 'src', 'content', 'manifests', 'content.manifest.sig.json')

if (!fs.existsSync(MANIFEST_JSON)) {
  throw new Error('Missing manifest. Run npm run gen:content-manifest first.')
}
if (!fs.existsSync(PRIV_PATH) || !fs.existsSync(PUB_PATH)) {
  throw new Error('Missing signing keys. Run npm run gen:content-keys first.')
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_JSON, 'utf8'))
// Must match generator logic: exclude generatedAt + manifestId.
const signedPayload = { schema: manifest.schema, algo: manifest.algo, entries: manifest.entries }
const signedUtf8 = stableStringify(signedPayload)
const manifestId = crypto.createHash('sha256').update(signedUtf8, 'utf8').digest('hex')

const privateKeyPem = fs.readFileSync(PRIV_PATH, 'utf8')
const publicKeyPem = fs.readFileSync(PUB_PATH, 'utf8')

const signature = crypto.sign('RSA-SHA256', Buffer.from(signedUtf8, 'utf8'), privateKeyPem)
const sigB64 = signature.toString('base64')
const signedB64 = Buffer.from(signedUtf8, 'utf8').toString('base64')

const out = {
  manifestId,
  signedBytesB64: signedB64,
  signatureB64: sigB64,
  publicKeyPem: publicKeyPem,
  algo: 'RSA-SHA256',
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
console.log('Wrote', OUT_JSON)
