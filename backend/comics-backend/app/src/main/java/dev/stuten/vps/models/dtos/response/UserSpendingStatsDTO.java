package dev.stuten.vps.models.dtos.response;

import java.math.BigDecimal;
import java.util.Map;

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
        @JsonProperty("bestDealObtainedByReduction") SimpleOwnedEditionDTO bestDealObtainedByReduction,

        @JsonProperty("spendingPerMonth") Map<String, Map<SpendingPerMonthStats, BigDecimal>> spendingPerMonth) {

    public enum SpendingPerMonthStats {

        @JsonProperty("totalPurchasePrice")
        TOTAL_PURCHASE_PRICE("totalPurchasePrice"),
        @JsonProperty("totalFees")
        TOTAL_FEES("totalFees"),
        @JsonProperty("totalSpent")
        TOTAL_SPENT("totalSpent");

        private final String literal;

        private SpendingPerMonthStats(String literal) {
            this.literal = literal;
        }

        public String getLiteral() {
            return literal;
        }

        public String toString() {
            return literal;
        }
    }
}