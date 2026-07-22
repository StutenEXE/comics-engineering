package dev.stuten.vps.models.dtos.response;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserMonthlyReadingStatsDTO(

        @JsonProperty("readingPerMonth") Map<String, Map<ReadingPerMonthStats, Integer>> readingPerMonth,
        @JsonProperty("nBooksReadWithNoDate") Integer nBooksReadWithNoDate) {

    public enum ReadingPerMonthStats {

        @JsonProperty("numberOfBooksRead")
        NUMBER_BOOKS_READ,
        @JsonProperty("numberOfIssuesRead")
        NUMBER_ISSUES_READ,
        @JsonProperty("numberOfPagesRead")
        NUMBER_PAGES_READ;
    }
}