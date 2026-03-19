import test from 'node:test'
import assert from 'node:assert/strict'

const rawProgram = require('../../src/content/guided_journey/production.en.json')

test('guided journey production pack has the expected chapter structure', () => {
  assert.equal(rawProgram.routes.length, 5)
  assert.equal(rawProgram.stages.length, 5)
  assert.equal(rawProgram.lessons.length, 30)
  assert.ok(rawProgram.drills.length >= 150)
  assert.equal(rawProgram.routes.find((route: any) => route.id === 'R5')?.primary_stage_ids?.[0], 'S2')
})

test('guided journey lessons carry route-specific drill slices', () => {
  const lesson = rawProgram.lessons.find((item: any) => item.id === 'S1_L01')
  const drills = rawProgram.drills.filter((drill: any) => lesson.drill_ids.includes(drill.id))
  const routeIds = Array.from(new Set(drills.map((drill: any) => drill.route_id))).sort()

  assert.deepEqual(routeIds, ['R1', 'R3', 'R4'])
})
