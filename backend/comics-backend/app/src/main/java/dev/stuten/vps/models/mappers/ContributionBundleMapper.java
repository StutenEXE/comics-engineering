package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.ContributionBundles.CONTRIBUTION_BUNDLES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class ContributionBundleMapper {

    private static Map<TableField<? extends Record, ? extends Object>, String> fieldMapping = Map.ofEntries(
            Map.entry(CONTRIBUTION_BUNDLES.ID, "bundle_id"),
            Map.entry(CONTRIBUTION_BUNDLES.STATUS, "bundle_status"),
            Map.entry(CONTRIBUTION_BUNDLES.NOTE, "bundle_note"),
            Map.entry(CONTRIBUTION_BUNDLES.SUBMITTER_ID, "bundle_submitter_id"),
            Map.entry(CONTRIBUTION_BUNDLES.CREATED_AT, "bundle_created_at"),
            Map.entry(CONTRIBUTION_BUNDLES.MODIFIED_AT, "bundle_modified_at"),
            Map.entry(USERS.USERNAME, "bundle_submitter_username"));

    public static String getFieldName(TableField<? extends Record, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static ContributionBundleDTO mapToDTO(Record r) {
        // Map contributions
        List<SimpleContributionDTO> contributions = MappingUtils.getMultipleDTOFromRecord(r, "contributions", ContributionMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        // Map contribution bundle
        ContributionBundleDTO dto = new ContributionBundleDTO(
                r.get(getFieldName(CONTRIBUTION_BUNDLES.ID), Integer.class),
                r.get(getFieldName(CONTRIBUTION_BUNDLES.STATUS), ContributionBundleStatusEnum.class),
                r.get(getFieldName(CONTRIBUTION_BUNDLES.NOTE), String.class),
                contributions,
                user,
                r.get(getFieldName(CONTRIBUTION_BUNDLES.CREATED_AT), LocalDateTime.class),
                r.get(getFieldName(CONTRIBUTION_BUNDLES.MODIFIED_AT), LocalDateTime.class));
        return dto;
    }

    public static SimpleContributionBundleDTO mapToSimpleDTO(Record r) {
        SimpleContributionBundleDTO dto = new SimpleContributionBundleDTO(
            r.get(getFieldName(CONTRIBUTION_BUNDLES.ID), Integer.class),
            r.get(getFieldName(CONTRIBUTION_BUNDLES.SUBMITTER_ID), Integer.class),
            r.get(getFieldName(USERS.USERNAME), String.class),
            r.get(getFieldName(CONTRIBUTION_BUNDLES.STATUS), ContributionBundleStatusEnum.class),
            r.get(getFieldName(CONTRIBUTION_BUNDLES.NOTE), String.class),
            r.get(getFieldName(CONTRIBUTION_BUNDLES.CREATED_AT), LocalDateTime.class),
            r.get(getFieldName(CONTRIBUTION_BUNDLES.MODIFIED_AT), LocalDateTime.class)
        );
        return dto;
    }
}