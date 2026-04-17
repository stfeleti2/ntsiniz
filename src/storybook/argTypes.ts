type ArgTypeValue = {
  action?: string
  control?: { type: string } | false
  options?: readonly string[]
  table?: { category?: string }
}

type EnhancerContext = {
  argTypes?: Record<string, ArgTypeValue>
  initialArgs?: Record<string, unknown>
}

const actionLabels: Record<string, string> = {
  onPress: 'pressed',
  onChange: 'changed',
  onValueChange: 'changed',
  onSubmit: 'submitted',
  onSelect: 'selected',
  onClose: 'closed',
}

const selectOptionsByKey: Record<string, readonly string[]> = {
  variant: ['default', 'carved', 'embossed', 'neo-soft'],
  size: ['sm', 'md', 'lg'],
  theme: ['light', 'dark'],
  tone: ['default', 'muted', 'danger', 'success'],
  state: ['default', 'hover', 'active', 'disabled'],
  depth: ['soft', 'normal', 'strong'],
  carvedDepth: ['soft', 'normal', 'strong'],
}

function isEventProp(name: string) {
  return /^on[A-Z]/.test(name)
}

function inferControl(name: string, value: unknown): ArgTypeValue['control'] {
  if (selectOptionsByKey[name]) return { type: 'select' }
  if (typeof value === 'boolean') return { type: 'boolean' }
  if (typeof value === 'number') return { type: 'number' }
  if (typeof value === 'string') return { type: 'text' }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return { type: 'object' }
  return undefined
}

export function withAutoArgTypes(context: EnhancerContext) {
  const existing = context.argTypes ?? {}
  const args = context.initialArgs ?? {}
  const next: Record<string, ArgTypeValue> = { ...existing }

  for (const [name, value] of Object.entries(args)) {
    const current = { ...(next[name] ?? {}) }

    if (isEventProp(name)) {
      current.action = current.action ?? actionLabels[name] ?? name.replace(/^on/, '').toLowerCase()
      current.table = { ...(current.table ?? {}), category: 'actions' }
      current.control = false
    } else {
      const inferred = inferControl(name, value)
      if (!current.control && inferred) {
        current.control = inferred
      }
      if (!current.options && selectOptionsByKey[name]) {
        current.options = selectOptionsByKey[name]
      }
      current.table = { ...(current.table ?? {}), category: 'props' }
    }

    next[name] = current
  }

  // Ensure common handlers are visible in Actions even when omitted from default args.
  for (const [name, label] of Object.entries(actionLabels)) {
    if (!next[name]) {
      next[name] = {
        action: label,
        control: false,
        table: { category: 'actions' },
      }
    }
  }

  return next
}
