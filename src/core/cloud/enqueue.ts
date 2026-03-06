import { enqueueSyncOp } from './syncQueueRepo'
import { logger } from '@/core/observability/logger'

// We enqueue changes even when cloud isn't configured yet.
// This keeps the app "sync-ready" if the user later turns on cloud.

export async function enqueueUpsert(kind: string, entityId: string, payload: any, updatedAt: number) {
  await enqueueSyncOp({ kind, entityId, action: 'upsert', payload, updatedAt }).catch((e) => logger.warn('suppressed error', e))
}

export async function enqueueHide(kind: string, entityId: string, payload: any, updatedAt: number) {
  await enqueueSyncOp({ kind, entityId, action: 'hide', payload, updatedAt }).catch((e) => logger.warn('suppressed error', e))
}

export async function enqueueDelete(kind: string, entityId: string, payload: any, updatedAt: number) {
  await enqueueSyncOp({ kind, entityId, action: 'delete', payload, updatedAt }).catch((e) => logger.warn('suppressed error', e))
}