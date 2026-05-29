-- 00_user.sql — runs before schema creation

\set app_user `echo "$PG_APP_USER"`
\set app_password `echo "$PG_APP_PASSWORD"`
\set app_db `echo "$POSTGRES_DB"`

-- Create the app user
CREATE USER :app_user WITH PASSWORD :'app_password';

-- Grant connect on the database
GRANT CONNECT ON DATABASE :app_db TO :app_user;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO :app_user;

-- Grant CRUD on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :app_user;

-- Grant usage on all existing sequences (for BIGSERIAL PKs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :app_user;

-- Ensure future tables/sequences are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO :app_user;