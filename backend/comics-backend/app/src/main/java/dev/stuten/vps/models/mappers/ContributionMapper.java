package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.ContributionBundles.CONTRIBUTION_BUNDLES;
import static dev.stuten.vps.jooq.tables.Contributions.CONTRIBUTIONS;

import java.util.Map;

import org.jooq.JSONB;
import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.dtos.full.ContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class ContributionMapper {

    private static Map<TableField<? extends Record, ? extends Object>, String> fieldMapping = Map.ofEntries(
            Map.entry(CONTRIBUTIONS.ID, "contribution_id"),
            Map.entry(CONTRIBUTIONS.BUNDLE_ID, "contribution_bundle_id"),
            Map.entry(CONTRIBUTIONS.LOCAL_REF, "contribution_local_ref"),
            Map.entry(CONTRIBUTIONS.ENTITY_TYPE, "contribution_entity_type"),
            Map.entry(CONTRIBUTIONS.ACTION, "contribution_action"),
            Map.entry(CONTRIBUTIONS.ENTITY_ID, "contribution_entity_id"),
            Map.entry(CONTRIBUTIONS.PROPOSED_DATA, "contribution_proposed_data"),
            Map.entry(CONTRIBUTIONS.ENTITY_SNAPSHOT, "contribution_entity_snapshot"),
            Map.entry(CONTRIBUTIONS.STATUS, "contribution_status"),
            Map.entry(CONTRIBUTIONS.RESOLVED_ENTITY_ID, "contribution_resolved_entity_id"));

    public static String getFieldName(TableField<? extends Record, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static ContributionDTO<? extends IdDTO> mapToDTO(Record r) {
        // Map bundle
        SimpleContributionBundleDTO bundle = MappingUtils.getSingleDTOFromRecord(r, CONTRIBUTION_BUNDLES,
                ContributionBundleMapper::mapToSimpleDTO);
        // Convert to jsonb 
        JSONB proposedDataJsonb = r.get(getFieldName(CONTRIBUTIONS.PROPOSED_DATA), JSONB.class);
        JSONB entitySnapshotJsonb = r.get(getFieldName(CONTRIBUTIONS.ENTITY_SNAPSHOT), JSONB.class);
        // Entity type
        ContributionTypeEnum type = r.get(getFieldName(CONTRIBUTIONS.ENTITY_TYPE), ContributionTypeEnum.class);
        // Map contribution bundle
        ContributionDTO<? extends IdDTO> dto = ContributionDTO.builder()
                .id(r.get(getFieldName(CONTRIBUTIONS.ID), Integer.class))
                .bundle(bundle)
                .localRef(r.get(getFieldName(CONTRIBUTIONS.LOCAL_REF), Integer.class))
                .entityType(type)
                .action(r.get(getFieldName(CONTRIBUTIONS.ACTION), ContributionActionEnum.class))
                .entityId(r.get(getFieldName(CONTRIBUTIONS.ENTITY_ID), Integer.class))
                .proposedData(MappingUtils.jsonbToIdDTO(proposedDataJsonb, type))
                .entitySnapshot(MappingUtils.jsonbToIdDTO(entitySnapshotJsonb, type))
                .status(r.get(getFieldName(CONTRIBUTIONS.STATUS), ContributionStatusEnum.class))
                .resolvedEntityId(r.get(getFieldName(CONTRIBUTIONS.RESOLVED_ENTITY_ID), Integer.class))
                .build();
        return dto;
    }

    public static SimpleContributionDTO<? extends IdDTO> mapToSimpleDTO(Record r) {
        // Convert to jsonb 
        JSONB proposedDataJsonb = r.get(getFieldName(CONTRIBUTIONS.PROPOSED_DATA), JSONB.class);
        JSONB entitySnapshotJsonb = r.get(getFieldName(CONTRIBUTIONS.ENTITY_SNAPSHOT), JSONB.class);
        // Entity type
        ContributionTypeEnum type = r.get(getFieldName(CONTRIBUTIONS.ENTITY_TYPE), ContributionTypeEnum.class);
        SimpleContributionDTO<? extends IdDTO> dto = SimpleContributionDTO.builder()
                .id(r.get(getFieldName(CONTRIBUTIONS.ID), Integer.class))
                .bundleId(r.get(getFieldName(CONTRIBUTIONS.BUNDLE_ID), Integer.class))
                .localRef(r.get(getFieldName(CONTRIBUTIONS.LOCAL_REF), Integer.class))
                .entityType(type)
                .action(r.get(getFieldName(CONTRIBUTIONS.ACTION), ContributionActionEnum.class))
                .entityId(r.get(getFieldName(CONTRIBUTIONS.ENTITY_ID), Integer.class))
                .proposedData(MappingUtils.jsonbToIdDTO(proposedDataJsonb, type))
                .entitySnapshot(MappingUtils.jsonbToIdDTO(entitySnapshotJsonb, type))
                .status(r.get(getFieldName(CONTRIBUTIONS.STATUS), ContributionStatusEnum.class))
                .resolvedEntityId(r.get(getFieldName(CONTRIBUTIONS.RESOLVED_ENTITY_ID), Integer.class))
                .build();
        return dto;
    }
}