package dev.stuten.vps.models.dtos.response;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;

public record ContributionsStatsDTO(
                @JsonProperty("total") Integer total,
                @JsonProperty("status") Map<ContributionStatusEnum, ContributionStatusStatsDTO> status) {

        public record ContributionStatusStatsDTO(
                        @JsonProperty("total") Integer total,
                        @JsonProperty("types") Map<ContributionTypeEnum, Integer> types) {
        }
}
