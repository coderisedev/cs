# Create Story Workflow Drift Hardening Retro

## Summary
- Tightened the create-story workflow so backlog sourcing always trusts the workflow status file but cross-verifies with epics.md before drafting.
- Added early exit guards that halt on mismatched titles, unsatisfied prerequisites, or stale artifacts so partial runs cannot silently continue.
- Updated companion docs (checklist, README, workflow.yaml) to reflect the new verification path and expose configuration flags.

## Changes Made
1. **Status Alignment Checks** (`bmad/bmm/workflows/4-implementation/create-story/instructions.md`): Step 2.5 now reads the TODO entry, validates the derived story file, loads epics.md to confirm titles and prerequisites, and blocks if any prerequisite stories are not listed under DONE. The workflow records `status_todo_mode` so downstream steps know the source of truth.
2. **Drift Detection Gate** (`instructions.md` Step 2.6): Introduced a guard that halts when an expected TODO story already has draft/context artifacts on disk, forcing a `workflow-status` or `*correct-course` cleanup before regenerating.
3. **Discovery Bypass** (`instructions.md` Step 3 + `workflow.yaml`): Story discovery logic is now skipped when the status file supplies the target story, and a new `status_todo_mode` variable defaults to false for legacy flows.
4. **Quality Checklist Update** (`bmad/bmm/workflows/4-implementation/create-story/checklist.md`): Added an explicit checklist item to ensure status TODO entries match epics.md titles and that prerequisites are already Done.
5. **Documentation Refresh** (`bmad/bmm/workflows/4-implementation/create-story/README.md`): Documented the new status consistency safeguard so operators understand why the workflow might halt earlier.

## Validation
- No automated tests available; manual verification consisted of reviewing the updated workflow logic and confirming supporting docs reflect the new guardrails.
- Recommended follow-up: run `yamllint bmad/bmm/workflows` after future YAML edits; not required for this Markdown-only change set.

## Open Considerations
- The workflow now halts when status drift exists; consider extending `workflow-status` to auto-reconcile TODO/Draft sections to reduce manual intervention.
- Additional automation could inspect `docs/stories/` for orphaned drafts and surface cleanup hints directly within the status report.
