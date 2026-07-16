package dev.stuten.vps.models.dtos.response;

import java.math.BigDecimal;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserMonthlyReadingStatsDTO(

        @JsonProperty("readingPerMonth") Map<String, Map<ReadingPerMonthStats, BigDecimal>> readingPerMonth,
        @JsonProperty("nBooksReadWithNoDate") Integer nBooksReadWithNoDate) {

    public enum ReadingPerMonthStats {

        @JsonProperty("numberOfBooksRead")
        NUMBER_BOOKS_READ,
        @JsonProperty("numberOfPagesRead")
        NUMBER_PAGES_READ;
    }
}