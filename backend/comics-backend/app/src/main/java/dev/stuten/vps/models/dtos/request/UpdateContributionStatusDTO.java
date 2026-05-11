package dev.stuten.vps.models.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionStatusEnum;

public record UpdateContributionStatusDTO (
    @JsonProperty("contributionId") Integer contributionId,
    @JsonProperty("newStatus") ContributionStatusEnum newStatus
) { }
