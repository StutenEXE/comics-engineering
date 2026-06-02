# Know Your Stash

- REST API built with **Javalin** + **jOOQ**
- Databases : **PostgreSQL 18** and **Redis**.

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

Whenever `postgres/init/` is changes, regenerate jOOQ classes against a local throwaway DB then commit the changes.

```bash
git add app/build/generated-src/jooq/
git commit -m "chore: regenerate jOOQ classes"
```

In production, the jOOQ classes are regenerated automatically. So if you are pushing changes to the DB, you have to report them on the actual DB before pushing to main.
