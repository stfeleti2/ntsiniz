import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { render } from '../render'

import { JourneyHeaderModule } from '@/ui/modules/journey/JourneyHeaderModule'
import { ResultsScoreModule } from '@/ui/modules/results/ResultsScoreModule'
import { SectionHeaderModule } from '@/ui/modules/shared/SectionHeaderModule'

test('JourneyHeaderModule renders', () => {
  const tree = render(
    <JourneyHeaderModule tab="map" onTab={() => {}} testID="journey.header" />,
  )
  assert.ok(tree.root.findByProps({ testID: 'journey.header' }))
})

test('ResultsScoreModule renders score block', () => {
  const tree = render(
    <ResultsScoreModule score={82} deltaValue="+27" milestones={{ day7: "60", day30: "70" }} testID="results.score" />,
  )
  assert.ok(tree.root.findByProps({ testID: 'results.score' }))
})

test('SectionHeaderModule renders title', () => {
  const tree = render(
    <SectionHeaderModule title="Title" actionLabel="Act" onAction={() => {}} testID="section" />,
  )
  assert.ok(tree.root.findByProps({ testID: 'section' }))
})
