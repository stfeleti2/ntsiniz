import type { DevModuleKey } from './devModules'
import { t } from '@/app/i18n'

export type DevModuleEntry = {
  key: DevModuleKey
  title: string
  description: string
}

export function getDevModuleRegistry(): DevModuleEntry[] {
  return [
    {
      key: 'module.home.hero',
      title: t('dev.modulesRegistry.homeHeroTitle'),
      description: t('dev.modulesRegistry.homeHeroDesc'),
    },
    {
      key: 'module.home.recommended',
      title: t('dev.modulesRegistry.homeRecommendedTitle'),
      description: t('dev.modulesRegistry.homeRecommendedDesc'),
    },
    {
      key: 'module.journey.header',
      title: t('dev.modulesRegistry.journeyHeaderTitle'),
      description: t('dev.modulesRegistry.journeyHeaderDesc'),
    },
    {
      key: 'module.journey.nextUp',
      title: t('dev.modulesRegistry.journeyNextUpTitle'),
      description: t('dev.modulesRegistry.journeyNextUpDesc'),
    },
    {
      key: 'module.journey.sessionRow',
      title: t('dev.modulesRegistry.journeySessionRowTitle'),
      description: t('dev.modulesRegistry.journeySessionRowDesc'),
    },
    {
      key: 'module.session.summary',
      title: t('dev.modulesRegistry.sessionSummaryTitle'),
      description: t('dev.modulesRegistry.sessionSummaryDesc'),
    },
    {
      key: 'module.results.score',
      title: t('dev.modulesRegistry.resultsScoreTitle'),
      description: t('dev.modulesRegistry.resultsScoreDesc'),
    },
    {
      key: 'module.results.share',
      title: t('dev.modulesRegistry.resultsShareTitle'),
      description: t('dev.modulesRegistry.resultsShareDesc'),
    },
    {
      key: 'pattern.playbackOverlay.live',
      title: t('dev.modulesRegistry.playbackLiveTitle'),
      description: t('dev.modulesRegistry.playbackLiveDesc'),
    },
  ]
}