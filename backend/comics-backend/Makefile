dev-up:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up redis postgres --build

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev down -v

prod-up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml  --env-file .env.prod down -v