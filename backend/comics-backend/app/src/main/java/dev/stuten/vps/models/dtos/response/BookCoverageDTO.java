package dev.stuten.vps.models.dtos.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

// Issues of an issue serie contained in a book
public record BookCoverageDTO(
        @JsonProperty("bookId") Integer bookId,
        @JsonProperty("issueIds") List<Integer> issueIds) {

}
