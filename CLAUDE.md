# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure & Architecture

This is a Turborepo monorepo using pnpm workspaces with the following structure:

- `apps/` - Main applications (config, sdk, ui)
- `packages/` - Shared packages (medusa, strapi, web)
- `bmad/` - Core BMAD methodology assets and workflows
- `infra/` - Infrastructure configuration
- `scripts/` - Build and utility scripts
- `tests/` - Test suites
- `docs/` - Documentation and story drafts

### BMAD Core Structure

The `bmad/` directory contains the core methodology assets:

- `bmad/bmm/` - Role personas, delivery-phase workflows, reusable ceremonies, team templates
- `bmad/core/` - Foundational engine assets, default tasks, base workflows, global configuration
- `bmad/bmm/config.yaml` and `bmad/core/config.yaml` - Sensitive settings and configuration

## Common Development Commands

### Build, Test, and Lint

The project uses Turborepo for task orchestration:

```bash
# Build all packages and apps
pnpm build

# Run linting across all packages
pnpm lint

# Run unit tests across all packages
pnpm test:unit
```

### BMAD-specific Commands

BMAD workflow validation is treated as linting:

```bash
# Validate YAML workflows and indentation
yamllint bmad/bmm/workflows

# Validate XML task definitions
xmllint --noout bmad/bmm/tasks/*.xml

# Check for consistent token usage after edits
rg "{project-root}" bmad -g'*.*'
```

## Coding Style & Conventions

- **Indentation**: Two spaces for YAML and XML files
- **Naming**: Lower-kebab-case for directories and files (e.g., `story-ready`, `workflow-status`)
- **Line Length**: Keep lines under ~120 characters
- **Headings**: Use semantic headings to help downstream agent renderers parse sections

## BMAD-specific Guidelines

### Workflow and Task Management

- Personas are stored in `.md` files with fenced XML and BMAD power banner
- Workflows should resolve valid `workflow.yaml` paths and agent IDs
- Task XML must maintain attributes like `critical="MANDATORY"` for engine loading
- Use `{project-root}` tokens for portable deployments

### Documentation Standards

- Story drafts live in `docs/stories/`
- Cross-check acceptance criteria against linked workflows
- Group related edits per commit with clear rationale
- Reference issue/ticket IDs when available

### Configuration Management

- Sensitive settings in config.yaml files should not be committed with personal values
- Prefer interpolation variables over hard-coded paths
- Document required keys for deployment portability

## Testing Approach

BMAD does not ship automated tests. Validation relies on:

- Targeted checks for workflow YAML resolution
- XML task definition validation
- Manual verification of linked agent references
- Cross-checking documentation against workflows

## Repository Guidelines

This project follows the guidelines outlined in `AGENTS.md`, including:
- Conventional Commit style for automation parsing
- BMAD documentation standards
- Security practices for configuration management