import { captureException } from './sentry'

export function reportUiError(err: unknown, ctx?: Record<string, any>) {
  captureException(err, ctx)
  if (__DEV__) {
    console.warn(err)
  }
}
