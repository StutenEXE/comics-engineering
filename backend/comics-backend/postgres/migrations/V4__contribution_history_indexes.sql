-- Change history of an entity (ContributionDAO.findHistory), shown on every item page :
-- - its modifications are found by entity id
-- - its creation is found by resolved entity id (known once approved)
CREATE INDEX IF NOT EXISTS contributions_entity_idx
    ON contributions (entity_type, entity_id) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS contributions_resolved_entity_idx
    ON contributions (entity_type, resolved_entity_id) WHERE status = 'approved';
