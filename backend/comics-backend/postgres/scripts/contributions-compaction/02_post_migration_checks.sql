-- ==========================================================================
-- AFTER V3__compact_contribution_data.sql - READ ONLY
-- psql -d <db> -f 02_post_migration_checks.sql
-- ==========================================================================
BEGIN READ ONLY;

\echo '== Migration applied'
SELECT version, description, success, installed_on FROM flyway_schema_history WHERE version = '3';

\echo '== Before / after per type / action'
SELECT c.entity_type, c.action, count(*),
       pg_size_pretty(sum(pg_column_size(b.proposed_data))::bigint)   AS proposed_before,
       pg_size_pretty(sum(pg_column_size(c.proposed_data))::bigint)   AS proposed_after,
       pg_size_pretty(sum(pg_column_size(b.entity_snapshot))::bigint) AS snapshot_before,
       pg_size_pretty(sum(pg_column_size(c.entity_snapshot))::bigint) AS snapshot_after
FROM contributions c JOIN backup.contributions_v3 b USING (id)
GROUP BY 1, 2 ORDER BY 1, 2;

\echo '== Sample of update snapshots (previous values of the changed fields)'
SELECT c.id, c.entity_type, c.status, c.entity_snapshot
FROM contributions c WHERE c.action = 'update' ORDER BY c.id DESC LIMIT 20;

\echo '== Every changed field must exist in the original snapshot with the same value (expected : 0)'
SELECT count(*) AS inconsistent_fields
FROM contributions c
JOIN backup.contributions_v3 b USING (id)
CROSS JOIN LATERAL jsonb_each(c.entity_snapshot) f
WHERE c.action = 'update'
  AND (b.entity_snapshot -> f.key) IS DISTINCT FROM f.value;

\echo '== Every kept field of proposed_data is unchanged (expected : 0)'
SELECT count(*) AS altered_fields
FROM contributions c
JOIN backup.contributions_v3 b USING (id)
CROSS JOIN LATERAL jsonb_each(c.proposed_data) f
WHERE (b.proposed_data -> f.key) IS DISTINCT FROM f.value;

ROLLBACK;
