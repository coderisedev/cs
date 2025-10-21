# BMAD Agent Workflow Guide (cs Project Case Study)

## Foundation Concepts
- **Agent Personas:** `bmad/bmm/agents/*.md` define activation rules, menu commands, and communication styles. They always read `bmad/bmm/config.yaml` first, so fields like `user_name`, `communication_language`, `output_folder`, and `dev_story_location` drive runtime behavior and output paths.
- **Core Orchestration:** Menu entries with `workflow="..."` delegate to `bmad/core/tasks/workflow.xml`. Validation commands call `bmad/core/tasks/validate-workflow.xml`. These XML engines interpret YAML `workflow.yaml` configs and execute step-by-step instructions.
- **Document Layout:** Planning artifacts (PRD, epics, solution architecture) live in `docs/`. Runtime status and stories are saved under `{output_folder}` (commonly `docs/`). Stories default to `{dev_story_location}` (e.g., `docs/stories`). Consistency across these files is critical for automation.
- **Status Source of Truth:** `docs/bmm-workflow-status.md` tracks every story’s state. Hardened workflows (like `*create-story`) now treat this file as authoritative for the next story to draft and cross-check it against `docs/epics.md`.

## Step-by-Step Usage
1. **Environment Prep**
   - Confirm `yamllint` and `xmllint` are installed.
   - Load `bmad/bmm/config.yaml` once to verify `dev_story_location` and language settings.

2. **Maintain Source Documents**
   - Update `docs/PRD.md`, `docs/epics.md`, and `docs/solution-architecture.md` whenever requirements change.
   - Ensure new stories are enumerated in `docs/epics.md` before generating drafts.

3. **Audit Status**
   - Run the Scrum Master agent’s `*workflow-status`.
   - Check `docs/bmm-workflow-status.md` for the TODO story ID/title/path; this drives the next draft.

4. **Generate Story (`*create-story`)**
   - The workflow reads the TODO entry, validates titles/prerequisites against `docs/epics.md`, and halts if prerequisites aren’t marked Done.
   - On success, it writes `story-<epic>.<num>.md` under `docs/stories/` and can trigger `story-context`.

5. **Approve Draft (`*story-ready`)**
   - Moves the story from Draft to Approved, updating the status tracker so development can begin.

6. **Produce Context (`*story-context`)**
   - Generates XML context from architecture docs and previous records for just-in-time developer guidance.

7. **Implementation Workflows**
   - Use `*dev-story` for development execution and `*story-approved` (or similar) to mark completion.
   - Re-run `*workflow-status` after key steps to keep the tracker aligned.

8. **Validate Artifacts**
   - `yamllint bmad/bmm/workflows` before committing YAML changes.
   - `xmllint --noout docs/stories/story-context-*.xml` for generated contexts.

## Best Practices
- Sync `docs/bmm-workflow-status.md` with `docs/epics.md` before `*create-story`; the hardened flow halts on mismatches.
- Capture workflow adjustments in retros (e.g., `docs/create-story-workflow-retro.md`) so future runs understand guardrails.
- Remove stale drafts/context artifacts to avoid the partial-run detector blocking progress.
- Document manual corrections directly in the status file’s log/decisions sections for traceability.
- Execute workflows sequentially; each depends on previous status updates.
- Follow repository conventions (two-space indentation, kebab-case filenames) when extending agents or workflows to ensure relative paths remain valid.
