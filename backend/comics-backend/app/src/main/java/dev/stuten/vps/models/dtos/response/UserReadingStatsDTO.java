package dev.stuten.vps.models.dtos.response;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserReadingStatsDTO(
                @JsonProperty("totalBooksRead") Integer totalBooksRead,
                @JsonProperty("totalBooksNotRead") Integer totalBooksNotRead,

                @JsonProperty("totalPagesRead") Integer totalPagesRead,
                @JsonProperty("totalPagesNotRead") Integer totalPagesNotRead,

                // In meters
                @JsonProperty("distanceRead") BigDecimal distanceRead,
                // In meters
                @JsonProperty("distanceNotRead") BigDecimal distanceNotRead) {
}