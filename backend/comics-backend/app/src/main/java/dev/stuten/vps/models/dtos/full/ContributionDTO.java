package dev.stuten.vps.models.dtos.full;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.dtos.simple.SimpleContributionBundleDTO;

/**
 * Full DTO for an individual contribution
 */
public record ContributionDTO(
    @JsonProperty("id") Integer id,
    @JsonProperty("bundle") SimpleContributionBundleDTO bundle,
    @JsonProperty("localRef") String localRef,
    @JsonProperty("entityType") ContributionTypeEnum entityType,
    @JsonProperty("action") ContributionActionEnum action,
    @JsonProperty("entityId") Integer entityId,
    @JsonProperty("proposedData") Map<String, Object> proposedData,
    @JsonProperty("entitySnapshot") Map<String, Object> entitySnapshot,
    @JsonProperty("status") ContributionStatusEnum status,
    @JsonProperty("resolvedEntityId") Integer resolvedEntityId
) {}