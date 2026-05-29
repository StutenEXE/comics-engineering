package dev.stuten.vps.models.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;

public record UpdateContributionBundleStatusDTO (
    @JsonProperty("bundleId") Integer bundleId,
    @JsonProperty("newStatus") ContributionBundleStatusEnum newStatus
) { }
