package dev.stuten.vps.models.dtos.response;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.simple.SimpleOwnedEditionDTO;

public record UserSpendingStatsDTO(
        @JsonProperty("totalSpent") BigDecimal totalSpent,
        @JsonProperty("totalPurchasePrice") BigDecimal totalPurchasePrice,
        @JsonProperty("totalFees") BigDecimal totalFees,
        @JsonProperty("totalRetailPrice") BigDecimal totalRetailPrice,

        @JsonProperty("totalSavings") BigDecimal totalSavings,
        @JsonProperty("totalSavingsPercentage") BigDecimal totalSavingsPercentage,

        @JsonProperty("mostCostlyEdition") SimpleOwnedEditionDTO mostCostlyEdition,
        @JsonProperty("mostValuableEdition") SimpleOwnedEditionDTO mostValuableEdition,
        @JsonProperty("bestDealObtainedByPrice") SimpleOwnedEditionDTO bestDealObtainedByPrice,
        @JsonProperty("bestDealObtainedByReduction") SimpleOwnedEditionDTO bestDealObtainedByReduction) {
}