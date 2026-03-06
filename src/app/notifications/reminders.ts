import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import type { Settings } from '@/core/storage/settingsRepo'

const CHANNEL_ID = 'ntsiniz-reminders'

export async function ensureReminderChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [0, 80, 80, 80],
    lightColor: '#7C5CFF',
  })
}

export async function getNotificationPermissionStatus() {
  const perm = await Notifications.getPermissionsAsync()
  return perm
}

export async function requestNotificationPermissions() {
  const cur = await Notifications.getPermissionsAsync()
  if (cur.granted) return cur
  const next = await Notifications.requestPermissionsAsync()
  return next
}

export async function cancelDailyReminder(notificationId?: string | null) {
  if (!notificationId) return
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  } catch {
    // ignore
  }
}

export async function scheduleDailyReminder({ hour, minute, title, body }: { hour: number; minute: number; title: string; body: string }) {
  await ensureReminderChannel()
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: undefined,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: CHANNEL_ID,
    } as any,
  })
  return id
}

/**
 * Sync OS notifications with the current reminders settings.
 * Returns a *persistable* Settings object (may change remindersEnabled/id).
 */
export async function syncReminderSettings(prev: Settings | null, next: Settings, opts: { title: string; body: string }) {
  const prevId = prev?.reminderNotificationId ?? null
  const enabled = !!next.remindersEnabled
  const hour = clampInt(next.reminderHour ?? 19, 0, 23)
  const minute = clampInt(next.reminderMinute ?? 0, 0, 59)

  if (!enabled) {
    await cancelDailyReminder(prevId)
    return { ...next, reminderNotificationId: null }
  }

  const perm = await requestNotificationPermissions()
  if (!perm.granted) {
    await cancelDailyReminder(prevId)
    return { ...next, remindersEnabled: false, reminderNotificationId: null }
  }

  // Reschedule if: no existing id or time changed
  const timeChanged = (prev?.reminderHour ?? 19) !== hour || (prev?.reminderMinute ?? 0) !== minute
  if (!prevId || timeChanged) {
    await cancelDailyReminder(prevId)
    const id = await scheduleDailyReminder({ hour, minute, title: opts.title, body: opts.body })
    return { ...next, reminderNotificationId: id, reminderHour: hour, reminderMinute: minute }
  }

  return { ...next, reminderNotificationId: prevId, reminderHour: hour, reminderMinute: minute }
}

function clampInt(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, Math.floor(x)))
}
