COMPOSE_PROD = docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml
COMPOSE_DEV = docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml
SERVICE ?= medusa

.PHONY: prod-up prod-down prod-logs dev-up dev-down dev-logs docs

prod-up:
	$(COMPOSE_PROD) up -d

prod-down:
	$(COMPOSE_PROD) down --remove-orphans

prod-logs:
	$(COMPOSE_PROD) logs -f $(SERVICE)

dev-up:
	$(COMPOSE_DEV) up -d

dev-down:
	$(COMPOSE_DEV) down --remove-orphans

dev-logs:
	$(COMPOSE_DEV) logs -f $(SERVICE)

docs:
	@echo "Docs index: docs/index.md"
	@echo "Templates: docs/templates/"
	@echo "Maintenance guide: docs/basic/docs-maintenance-best-practices.md"
