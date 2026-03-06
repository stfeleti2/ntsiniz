export function id(prefix = "") {
  // lightweight id: timestamp + random
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 10)
  return prefix ? `${prefix}_${t}_${r}` : `${t}_${r}`
}
