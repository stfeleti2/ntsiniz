import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const SIG_JSON = path.resolve(process.cwd(), 'src', 'content', 'manifests', 'content.manifest.sig.json')
if (!fs.existsSync(SIG_JSON)) {
  console.error('Missing signature file. Run: npm run sign:content-manifest')
  process.exit(1)
}

const p = JSON.parse(fs.readFileSync(SIG_JSON, 'utf8'))
const signedUtf8 = Buffer.from(String(p.signedBytesB64 || ''), 'base64').toString('utf8')
const sig = Buffer.from(String(p.signatureB64 || ''), 'base64')
const pub = String(p.publicKeyPem || '')

if (!signedUtf8 || !sig.length || !pub) {
  console.error('Invalid signature payload file:', SIG_JSON)
  process.exit(1)
}

const ok = crypto.verify('RSA-SHA256', Buffer.from(signedUtf8, 'utf8'), pub, sig)
if (!ok) {
  console.error('Content manifest signature verification FAILED')
  process.exit(1)
}
console.log('Content manifest signature verified OK')
