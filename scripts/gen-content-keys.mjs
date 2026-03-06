import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const DIR = path.resolve(process.cwd(), 'scripts', 'content-keys')
const PRIV = path.resolve(DIR, 'content_signing_private.pem')
const PUB = path.resolve(DIR, 'content_signing_public.pem')

fs.mkdirSync(DIR, { recursive: true })

if (fs.existsSync(PRIV) && fs.existsSync(PUB)) {
  console.log('Content signing keys already exist:', { PRIV, PUB })
  process.exit(0)
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

fs.writeFileSync(PRIV, privateKey)
fs.writeFileSync(PUB, publicKey)
console.log('Generated content signing keys:', { PRIV, PUB })
