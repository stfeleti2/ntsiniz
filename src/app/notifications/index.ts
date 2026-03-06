import * as Notifications from 'expo-notifications'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { t, setLocale } from '@/app/i18n'
import { syncReminderSettings } from './reminders'

let didInit = false

export async function initNotifications() {
  if (didInit) return
  didInit = true

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })

  // On launch, ensure reminders are scheduled if enabled.
  try {
    const s = await getSettings()
    setLocale(s.language)
    const synced = await syncReminderSettings(s, s, {
      title: t('notifications.reminderTitle'),
      body: t('notifications.reminderBody'),
    })
    if (JSON.stringify(synced) !== JSON.stringify(s)) {
      await upsertSettings(synced)
    }
  } catch {
    // ignore; reminders are optional
  }
}
