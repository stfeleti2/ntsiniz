export type TelemetryEvent = {
  name: string
  ts: number
  props?: Record<string, any>
}

const MAX = 60
const events: TelemetryEvent[] = []

export function pushTelemetryEvent(name: string, props?: Record<string, any>) {
  const e: TelemetryEvent = { name, ts: Date.now(), props }
  events.push(e)
  while (events.length > MAX) events.shift()
}

export function getTelemetryEvents() {
  return [...events]
}

export function resetTelemetryEvents() {
  events.length = 0
}
