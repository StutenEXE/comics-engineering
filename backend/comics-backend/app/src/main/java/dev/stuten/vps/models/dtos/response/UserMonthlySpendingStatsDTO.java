package dev.stuten.vps.models.dtos.response;

import java.math.BigDecimal;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserMonthlySpendingStatsDTO(

        @JsonProperty("spendingPerMonth") Map<String, Map<SpendingPerMonthStats, BigDecimal>> spendingPerMonth) {

    public enum SpendingPerMonthStats {

        @JsonProperty("totalPurchasePrice")
        TOTAL_PURCHASE_PRICE,
        @JsonProperty("totalFees")
        TOTAL_FEES,
        @JsonProperty("totalSpent")
        TOTAL_SPENT;
    }
}