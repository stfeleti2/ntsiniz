import fs from 'node:fs'

const txt = fs.readFileSync('app.config.ts', 'utf8')

function mustContain(snippet) {
  if (!txt.includes(snippet)) {
    console.error('Missing required config snippet:', snippet)
    process.exit(1)
  }
}

// Ensure public link extras are wired.
mustContain('publicAppUrl')
mustContain('publicInviteUrlBase')

// Ensure these are not explicitly empty defaults.
if (txt.includes("publicAppUrl: process.env.PUBLIC_APP_URL ?? (config.extra as any)?.publicAppUrl ?? ''")) {
  console.error('publicAppUrl default is empty-string. Provide a safe default URL.')
  process.exit(1)
}
if (txt.includes("publicInviteUrlBase: process.env.PUBLIC_INVITE_URL_BASE ?? (config.extra as any)?.publicInviteUrlBase ?? ''")) {
  console.error('publicInviteUrlBase default is empty-string. Provide a safe default URL.')
  process.exit(1)
}

console.log('check:config OK')
