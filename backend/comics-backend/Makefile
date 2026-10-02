dev-up:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up redis postgres migrate --build

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev down -v

prod-up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Applies the migrations without touching the running API : if they fail, the API keeps running
prod-migrate:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod run --rm migrate

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml  --env-file .env.prod down

# Dumps the production database to ~/backups/kys (keeps the last BACKUPS_TO_KEEP dumps).
# Skipped when the database container is not running (first deployment).
BACKUPS_TO_KEEP ?= 7
BACKUP_DIR ?= $(HOME)/backups/kys

prod-backup:
	@if docker ps --format '{{.Names}}' | grep -qx kys_postgres; then \
		mkdir -p $(BACKUP_DIR); \
		file=$(BACKUP_DIR)/kys_$$(date +%Y%m%d_%H%M%S).dump; \
		docker exec kys_postgres sh -c 'pg_dump -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -Fc' > $$file.tmp \
			&& mv $$file.tmp $$file \
			|| { rm -f $$file.tmp; echo "Backup failed"; exit 1; }; \
		echo "Backup written to $$file"; \
		ls -1t $(BACKUP_DIR)/kys_*.dump | tail -n +$$(($(BACKUPS_TO_KEEP) + 1)) | xargs -r rm --; \
	else \
		echo "kys_postgres is not running, skipping backup"; \
	fi
