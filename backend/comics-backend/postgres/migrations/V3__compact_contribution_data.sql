-- ==========================================================================
-- Compacts the data stored with the contributions
-- ==========================================================================
-- Until now each contribution stored :
-- - proposed_data   : the full proposed entity, including derived data
-- - entity_snapshot : the full entity before the change, including derived
--                     data (a publisher's snapshot held all its editions...)
--
-- From now on (same rules as ContributionDataUtils.java, both must stay in sync) :
-- - proposed_data   : without derived data (audit fields, relations owned by
--                     another entity), it is never applied anyway
-- - entity_snapshot :
--     create -> NULL
--     update -> the previous value of the fields changed by the proposal only
--               ({} when nothing changed)
--     delete -> the deleted entity, without derived data
--
-- Change of a field = previous value in entity_snapshot -> new value in proposed_data
--
-- /!\ This migration rewrites data : a full copy of the previous values is kept
-- in backup.contributions_v3 (outside of the public schema so the API and jOOQ
-- ignore it). Drop it once the result has been checked.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. Safety net
-- --------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS backup;

CREATE TABLE backup.contributions_v3 AS
SELECT id, proposed_data, entity_snapshot, now() AS backed_up_at
FROM contributions;

-- --------------------------------------------------------------------------
-- 2. Helpers (pg_temp : dropped automatically at the end of the session)
-- --------------------------------------------------------------------------

-- Removes the derived fields of an entity, NULL if the data is not an entity
CREATE FUNCTION pg_temp.ce_compact(entity_type contribution_type_enum, data jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
    SELECT CASE WHEN jsonb_typeof(data) = 'object' THEN
        data
            - ARRAY['createdAt', 'modifiedAt', 'addedBy']
            - CASE entity_type
                WHEN 'book'       THEN ARRAY['editions']
                WHEN 'serie'      THEN ARRAY['books']
                WHEN 'issue'      THEN ARRAY['books']
                WHEN 'issueserie' THEN ARRAY['issues', 'books']
                WHEN 'publisher'  THEN ARRAY['editions']
                ELSE ARRAY[]::text[]
              END
    END
$$;

-- An object with a non null id
CREATE FUNCTION pg_temp.ce_is_reference(v jsonb)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
    SELECT jsonb_typeof(v) = 'object' AND coalesce(jsonb_typeof(v -> 'id'), 'null') <> 'null'
$$;

-- An array of references only
CREATE FUNCTION pg_temp.ce_is_reference_list(v jsonb)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
    SELECT jsonb_typeof(v) = 'array'
       AND NOT EXISTS (
           SELECT 1 FROM jsonb_array_elements(v) e WHERE NOT pg_temp.ce_is_reference(e.value)
       )
$$;

-- Ids of a list of references, sorted
CREATE FUNCTION pg_temp.ce_sorted_ids(v jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
    SELECT coalesce(jsonb_agg(e.value ->> 'id' ORDER BY e.value ->> 'id' COLLATE "C"), '[]'::jsonb)
    FROM jsonb_array_elements(v) e
$$;

-- Two values are the same when :
-- - both are references to the same id
-- - both are lists of references to the same ids, whatever their order
-- - both are equal (jsonb compares numbers by value : 1.50 = 1.5)
-- A missing value is the same as null
CREATE FUNCTION pg_temp.ce_same_value(a jsonb, b jsonb)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    a := coalesce(a, 'null'::jsonb);
    b := coalesce(b, 'null'::jsonb);
    IF pg_temp.ce_is_reference(a) AND pg_temp.ce_is_reference(b) THEN
        RETURN pg_temp.ce_same_value(a -> 'id', b -> 'id');
    END IF;
    IF pg_temp.ce_is_reference_list(a) AND pg_temp.ce_is_reference_list(b) THEN
        RETURN pg_temp.ce_sorted_ids(a) = pg_temp.ce_sorted_ids(b);
    END IF;
    RETURN a = b;
END
$$;

-- What must be kept of the entity's previous state
CREATE FUNCTION pg_temp.ce_snapshot(entity_type contribution_type_enum, action contribution_action_enum,
                                    snapshot jsonb, proposed jsonb)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    previous jsonb := pg_temp.ce_compact(entity_type, snapshot);
    compacted_proposed jsonb := pg_temp.ce_compact(entity_type, proposed);
BEGIN
    IF previous IS NULL OR action = 'create' THEN
        RETURN NULL;
    END IF;
    IF action = 'delete' THEN
        RETURN previous;
    END IF;
    -- Update : previous values of the changed fields only
    RETURN coalesce(
        (SELECT jsonb_object_agg(f.key, f.value)
         FROM jsonb_each(previous) f
         WHERE NOT pg_temp.ce_same_value(f.value, compacted_proposed -> f.key)),
        '{}'::jsonb);
END
$$;

-- --------------------------------------------------------------------------
-- 3. Compaction (both expressions read the values from before the update)
-- --------------------------------------------------------------------------
UPDATE contributions c
SET proposed_data   = coalesce(pg_temp.ce_compact(c.entity_type, c.proposed_data), c.proposed_data),
    entity_snapshot = pg_temp.ce_snapshot(c.entity_type, c.action, c.entity_snapshot, c.proposed_data);

-- --------------------------------------------------------------------------
-- 4. Checks : any failure rolls the whole migration back
-- --------------------------------------------------------------------------
DO $$
DECLARE
    n_backup integer := (SELECT count(*) FROM backup.contributions_v3);
    n_contributions integer := (SELECT count(*) FROM contributions);
    n_bad_snapshots integer;
BEGIN
    IF n_backup <> n_contributions THEN
        RAISE EXCEPTION 'Backup has % rows, contributions has %', n_backup, n_contributions;
    END IF;
    -- An update or delete that had a snapshot must still have one
    SELECT count(*) INTO n_bad_snapshots
    FROM contributions c
    JOIN backup.contributions_v3 b ON b.id = c.id
    WHERE c.action <> 'create'
      AND jsonb_typeof(b.entity_snapshot) = 'object'
      AND jsonb_typeof(c.entity_snapshot) IS DISTINCT FROM 'object';
    IF n_bad_snapshots > 0 THEN
        RAISE EXCEPTION '% update/delete contributions lost their snapshot', n_bad_snapshots;
    END IF;
END
$$;

COMMENT ON COLUMN contributions.proposed_data IS
    'Proposed entity, without derived data (see ContributionDataUtils)';
COMMENT ON COLUMN contributions.entity_snapshot IS
    'create: NULL, update: previous values of the changed fields only, delete: deleted entity (see ContributionDataUtils)';
