-- ==========================================================================
-- AFTER the checks of 02_post_migration_checks.sql are OK
-- psql -d <db> -f 03_reclaim_space.sql   (as the tables owner)
--
-- The UPDATE of V3 leaves the previous row versions behind as dead tuples :
-- the disk space is only given back to the OS by a VACUUM FULL.
-- VACUUM FULL rewrites the table and holds an ACCESS EXCLUSIVE lock while it
-- runs (reads and writes on contributions wait) : a few seconds for a table
-- of a few MB. It cannot run inside a transaction, so it is not part of the
-- Flyway migration.
-- ==========================================================================

\echo '== Before'
SELECT pg_size_pretty(pg_total_relation_size('contributions')) AS contributions;

VACUUM (FULL, ANALYZE, VERBOSE) contributions;

\echo '== After'
SELECT pg_size_pretty(pg_total_relation_size('contributions')) AS contributions;

-- --------------------------------------------------------------------------
-- LATER, once the app has run fine with the compacted data for a while :
-- the backup holds the previous data, dropping it frees the remaining space.
-- /!\ Irreversible : the full previous snapshots are lost.
-- --------------------------------------------------------------------------
-- DROP SCHEMA backup CASCADE;
