import test from 'node:test'
import assert from 'node:assert/strict'
import { setLocale, t } from '@/core/i18n'

test('brand name translation is stable', () => {
  setLocale('en')
  assert.equal(t('brand.name'), 'Ntsiniz')
})
