# README_AGENT_INTEGRATION_V6

Use this file when asking an AI coding agent to integrate V6 into an existing repo.

## Goal
Integrate the V6 curriculum pack into the app without breaking existing route / stage / lesson / drill IDs.

## Source files
- `curriculum_full_production.json`
- `scoring_engine_spec.json`
- `adaptive_engine.ts`
- `scoring_engine.ts`
- `pitch_math.ts`

## Required integration tasks
1. Replace or merge the existing curriculum source of truth with `curriculum_full_production.json`.
2. Preserve compatibility with:
   - stage ids: S1-S5
   - lesson ids: S*_L*
   - drill ids
   - route ids: R1-R5
3. Extend the parser/types to support new optional top-level keys:
   - `session_architecture`
   - `pressure_ladders`
   - `assessment_rubric_dimensions`
   - `vocal_health_monitoring`
   - `recovery_protocols`
4. Extend lesson parsing to support new optional keys:
   - `motor_learning_focus`
   - `pressure_policy`
   - `health_watchouts`
   - `identity_repertoire_hook`
   - `ensemble_transfer_hook`
5. Extend drill parsing to support new optional keys:
   - `learning_phase`
   - `randomization_mode`
   - `performance_contexts`
   - `self_rating_prompt`
   - `health_abort_rule`
   - `load_budget_points`
   - `pressure_ladder_step`
   - `transfer_task_type`
   - `ensemble_variant`
   - `external_focus_cue`
   - `independence_prompt`
   - `context_transfer_note`
   - `branch_variant_hint`
6. Add UI/reporting support where useful for:
   - load tiers
   - pressure ladders
   - health flags
   - self-reflection prompts
   - style/context transfer evidence
7. If your app has assessments, update them to use the V6 rubric dimensions:
   - technique_accuracy
   - efficiency_health
   - stability_repeatability
   - transfer_application
   - stylism_communication
   - independence_self_coaching

## Strong recommendations
- Keep legacy fields working first.
- Treat V6 new fields as additive.
- Do not strip them out during parsing.
- If there is an existing scoring layer, map V6 rubric dimensions to existing metrics gradually instead of hardbreaking the current pipeline.

## Suggested implementation order
1. types / schemas
2. curriculum loader
3. lesson/drill UI
4. assessment UI + rules
5. profile/remediation logic
6. weekly plan / route logic
7. analytics / reporting

## Integration caution
V6 is stricter than V5.
Do not auto-promote based on a single pass.
Respect:
- health gates
- transfer gates
- retention gates
- pressure ladders
