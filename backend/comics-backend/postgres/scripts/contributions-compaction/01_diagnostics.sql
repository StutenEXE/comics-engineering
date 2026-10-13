-- ==========================================================================
-- BEFORE V3__compact_contribution_data.sql - READ ONLY, safe to run on production
-- psql -d <db> -f 01_diagnostics.sql
-- ==========================================================================
BEGIN READ ONLY;

\echo '== Server / migration state'
SELECT version();
SELECT version, description, success, installed_on FROM flyway_schema_history ORDER BY installed_rank;

\echo '== Table size (incl. TOAST and indexes)'
SELECT pg_size_pretty(pg_total_relation_size('contributions')) AS total,
       pg_size_pretty(pg_relation_size('contributions'))       AS heap,
       pg_size_pretty(pg_indexes_size('contributions'))        AS indexes;

\echo '== Stored size per type / action'
SELECT entity_type, action, count(*),
       pg_size_pretty(sum(pg_column_size(proposed_data))::bigint)   AS proposed_data,
       pg_size_pretty(sum(pg_column_size(entity_snapshot))::bigint) AS entity_snapshot,
       pg_size_pretty(max(pg_column_size(entity_snapshot))::bigint) AS biggest_snapshot
FROM contributions GROUP BY 1, 2 ORDER BY 1, 2;

\echo '== Stored size per status'
SELECT status, count(*),
       pg_size_pretty(sum(pg_column_size(proposed_data) + coalesce(pg_column_size(entity_snapshot), 0))::bigint) AS data
FROM contributions GROUP BY 1 ORDER BY 1;

\echo '== Biggest top level keys (proposed_data)'
SELECT entity_type, k.key, count(*), pg_size_pretty(sum(pg_column_size(k.value))::bigint) AS size
FROM contributions c, jsonb_each(c.proposed_data) k
WHERE jsonb_typeof(c.proposed_data) = 'object'
GROUP BY 1, 2 ORDER BY sum(pg_column_size(k.value)) DESC LIMIT 15;

\echo '== Biggest top level keys (entity_snapshot)'
SELECT entity_type, k.key, count(*), pg_size_pretty(sum(pg_column_size(k.value))::bigint) AS size
FROM contributions c, jsonb_each(c.entity_snapshot) k
WHERE jsonb_typeof(c.entity_snapshot) = 'object'
GROUP BY 1, 2 ORDER BY sum(pg_column_size(k.value)) DESC LIMIT 15;

\echo '== Edge cases (all counts are expected to be 0, except create_with_snapshot)'
SELECT
    count(*) FILTER (WHERE jsonb_typeof(proposed_data) <> 'object')                          AS proposed_not_object,
    count(*) FILTER (WHERE entity_snapshot IS NOT NULL
                       AND jsonb_typeof(entity_snapshot) <> 'object')                        AS snapshot_not_object,
    count(*) FILTER (WHERE action = 'create' AND entity_snapshot IS NOT NULL)                AS create_with_snapshot,
    count(*) FILTER (WHERE action <> 'create' AND entity_snapshot IS NULL)                   AS update_delete_without_snapshot
FROM contributions;

\echo '== Free disk space check : the migration keeps a full copy of both columns until it is dropped'
SELECT pg_size_pretty(sum(pg_column_size(proposed_data) + coalesce(pg_column_size(entity_snapshot), 0))::bigint)
       AS backup_size_estimate
FROM contributions;

ROLLBACK;
