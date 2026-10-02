# Know Your Stash

- REST API built with **Javalin** + **jOOQ**
- Databases : **PostgreSQL 18** and **Redis**.
- S3 : **Garage** (self hosted)

---

## Prerequisites

- Docker & Docker Compose
- JDK 21
- Gradle 8

---

## Setup

Create two `.env` files : `.env.dev` & `.env.prod` with the following template :

```txt
POSTGRES_SUPERUSER=<text>
POSTGRES_SUPERPASSWORD=<text>

KYS_POSTGRES_DB=<text>
KYS_POSTGRES_USER=<text>
KYS_POSTGRES_PASSWORD=<text>
KYS_POSTGRES_URL=jdbc:postgresql://<host>:<port>/$KYS_POSTGRES_DB

KYS_REDIS_HOST=<text>
KYS_REDIS_USER=<text>
KYS_REDIS_PASSWORD=<text>

APP_PORT=<number>
CORS_ALLOWED_ORIGIN=https://<dns / ip>

S3_ENDPOINT=https://<dns / ip>
S3_REGION=<text>
S3_BUCKET=<text>
S3_ACCESS_KEY_ID=<text>
S3_SECRET_ACCESS_KEY=<text>
S3_PUBLIC_URL=https://<dn /ip>/<bucket name>
```

---

## Development

Postgres and Redis run in Docker. The API runs locally for hot reload.

**1. Start the databases**

```bash
make dev-up
```

**2. Run the API**

Run it using an IDE.

API available at `http://localhost:8080`.  
Postgres exposed at `127.0.0.1:5432`, Redis at `127.0.0.1:6379`.

---

## Production

All three services run in Docker.

```bash
make prod-up
```

A github action automatically deploys when code is pushed on main.

---

## Schema changes

The schema is managed by [Flyway](https://documentation.red-gate.com/fd) migrations in `backend/comics-backend/postgres/migrations/`. The `migrate` container applies the new ones before the API starts, both with `make dev-up` and on every deployment (production is backed up with `make prod-backup` first, the last 7 dumps are kept in `~/backups/kys`).

**To change the schema**, add a new file `V<next number>__<description>.sql` (e.g. `V3__add_wishlist_date.sql`):

- Never modify, rename or delete an existing migration, Flyway refuses to run if an applied file changed.
- Migrations must not destroy data (`DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE`, `UPDATE`, column type changes...). The PR check blocks them unless the PR has the `allow-destructive-migration` label.
- Each migration runs in a transaction : it is applied entirely or not at all.
- The PR check also applies every migration on throwaway databases (a new one and a production-like one).

Then regenerate the jOOQ classes against your local database (`make dev-up` applies the migration) and commit them, the Docker build uses the committed classes.

```bash
git add app/build/generated-src/jooq/
git commit -m "chore: regenerate jOOQ classes"
```
