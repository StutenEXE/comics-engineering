package dev.stuten.vps.models.dtos.simple;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;

public record SimpleContributionDTO(
    @JsonProperty("id") Integer id,
    @JsonProperty("bundleId") Integer bundleId,
    @JsonProperty("localRef") Integer localRef,
    @JsonProperty("entityType") ContributionTypeEnum entityType,
    @JsonProperty("action") ContributionActionEnum action,
    @JsonProperty("entityId") Integer entityId,
    @JsonProperty("proposedData") Map<String, Object> proposedData,
    @JsonProperty("entitySnapshot") Map<String, Object> entitySnapshot,
    @JsonProperty("status") ContributionStatusEnum status,
    @JsonProperty("resolvedEntityId") Integer resolvedEntityId
) { }
