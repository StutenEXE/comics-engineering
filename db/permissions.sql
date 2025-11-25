-- Allow usage and creation in the public schema
GRANT USAGE, CREATE ON SCHEMA public TO <user_name>;

-- Grant privileges on all existing objects in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO <user_name>;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO <user_name>;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO <user_name>;

-- Ensure future objects created in the schema are accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO <user_name>;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO <user_name>;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO <user_name>;