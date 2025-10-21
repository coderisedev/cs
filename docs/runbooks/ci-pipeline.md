# CI Pipeline Runbook

## Overview

This runbook provides guidance for troubleshooting, maintaining, and operating the GitHub Actions CI pipeline for the CS platform.

## Pipeline Architecture

### Workflow Triggers
- **Pull Requests**: Triggers on PRs to `main` branch
- **Push Events**: Triggers on pushes to `main` branch
- **Concurrency**: Cancels in-progress runs for same branch to avoid duplicates

### Jobs Overview
1. **Lint & Typecheck**: Code quality validation using ESLint, Prettier, and TypeScript
2. **Unit Tests**: Matrix strategy testing all workspaces (storefront, medusa, strapi, config)
3. **Build Verification**: Ensures all packages build successfully
4. **Workflow Summary**: Provides consolidated results and artifacts

## Common Issues & Troubleshooting

### Cache Issues

**Symptoms:**
- Slow builds (>8 minutes)
- Cache misses on every run
- "Cache not found" warnings

**Solutions:**
1. **Clear Turbo cache:**
   ```bash
   pnpm run clean  # If available
   rm -rf .turbo
   ```

2. **Clear pnpm store cache:**
   ```bash
   pnpm store prune
   ```

3. **Manual cache reset (GitHub Actions):**
   - Go to Actions tab
   - Select "Caches" from left sidebar
   - Delete problematic cache entries

### Dependency Issues

**Symptoms:**
- `pnpm install` failures
- Version conflicts
- Missing dependencies

**Solutions:**
1. **Update lockfile:**
   ```bash
   pnpm install --force
   pnpm install --frozen-lockfile
   ```

2. **Clear and reinstall:**
   ```bash
   rm -rf node_modules
   pnpm install
   ```

3. **Check package.json versions:**
   - Verify all dependencies use compatible versions
   - Check for duplicate dependencies across workspaces

### Test Failures

**Symptoms:**
- Unit test failures
- Test timeouts
- Coverage threshold failures

**Solutions:**
1. **Run tests locally:**
   ```bash
   # Run all tests
   pnpm test:unit

   # Run specific workspace tests
   pnpm --filter apps/storefront test
   pnpm --filter apps/medusa test:unit
   pnpm --filter apps/strapi test
   pnpm --filter packages/config test
   ```

2. **Debug specific test:**
   ```bash
   pnpm --filter <workspace> test -- --reporter=verbose
   pnpm --filter <workspace> test -- --watch
   ```

3. **Update snapshots (if applicable):**
   ```bash
   pnpm --filter <workspace> test -- --update-snapshots
   ```

### Linting Issues

**Symptoms:**
- ESLint errors/warnings
- TypeScript compilation errors
- Prettier formatting issues

**Solutions:**
1. **Run linting locally:**
   ```bash
   pnpm lint

   # Auto-fix issues where possible
   pnpm lint --fix
   ```

2. **TypeScript errors:**
   ```bash
   pnpm typecheck

   # Get detailed error information
   npx tsc --noEmit --pretty
   ```

3. **Formatting issues:**
   ```bash
   pnpm format
   pnpm format --check
   ```

## Performance Optimization

### Target Metrics
- **Total pipeline time**: <8 minutes
- **Cache hit rate**: >80%
- **Test execution time**: <2 minutes per workspace

### Optimization Techniques

1. **Parallel Execution:**
   - Tests run in matrix strategy (4 workspaces in parallel)
   - Lint and typecheck run concurrently with other jobs

2. **Smart Caching:**
   - pnpm store cache for dependencies
   - Turbo cache for build outputs
   - GitHub Actions cache for both

3. **Selective Runs:**
   - Only runs changed files in Turbo
   - Matrix strategy isolates failures

## Monitoring & Alerts

### Key Metrics to Monitor
- Pipeline success rate (target: >95%)
- Average execution time (target: <8 minutes)
- Cache effectiveness (target: >80% hit rate)
- Test coverage trends

### Alerting Setup
Configure GitHub repository notifications for:
- Workflow failures
- Performance degradation (>10% increase in execution time)
- Cache miss rate spikes

## Security Considerations

### Branch Protection Rules
Required checks must pass before merging:
- `lint` job
- `test` job (all matrix entries)
- `build` job

### Secrets Management
- No hardcoded secrets in workflow files
- Use GitHub Actions secrets for sensitive data
- OIDC tokens for cloud provider authentication

## Emergency Procedures

### Pipeline Completely Fails

**Immediate Actions:**
1. Check GitHub Actions status page for platform issues
2. Review recent workflow runs for patterns
3. Check if dependency updates caused issues
4. Roll back recent changes if necessary

### Cache Corruption

**Recovery Steps:**
1. Delete all caches from GitHub Actions cache
2. Force workflow re-run without cache
3. Monitor performance after cache rebuild
4. Update cache keys if corruption persists

### Dependency Security Issues

**Response Process:**
1. Review GitHub Dependabot alerts
2. Update vulnerable dependencies
3. Test updates in feature branch
4. Deploy with updated dependencies

## Development Workflow Integration

### Local Development Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd cs
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run local CI equivalent:**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test:unit
   pnpm build
   ```

### Pre-commit Checks

Consider setting up Husky for pre-commit hooks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm lint && pnpm typecheck",
      "pre-push": "pnpm test:unit"
    }
  }
}
```

## Contact & Escalation

### Primary Contacts
- **DevOps Lead**: Handle pipeline infrastructure issues
- **Frontend Lead**: Storefront-related test failures
- **Backend Lead**: Medusa/Strapi-related test failures

### Escalation Path
1. **Level 1**: Check this runbook and GitHub Actions documentation
2. **Level 2**: Contact relevant team lead based on failure type
3. **Level 3**: Escalate to DevOps team for infrastructure issues

### Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TurboRepo Caching Guide](https://turbo.build/repo/docs/core-concepts/caching)
- [pnpm CLI Reference](https://pnpm.io/cli/pnpm)

---

**Last Updated**: 2025-10-20
**Maintained by**: DevOps Team
**Review Frequency**: Quarterly