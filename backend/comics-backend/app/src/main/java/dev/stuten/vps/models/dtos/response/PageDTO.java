package dev.stuten.vps.models.dtos.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * One page of a paginated list
 *
 * @param items  The elements of the page
 * @param total  The total number of elements matching the request (all pages)
 * @param offset The number of elements skipped before this page
 * @param limit  The maximum number of elements of a page
 */
public record PageDTO<T>(
        @JsonProperty("items") List<T> items,
        @JsonProperty("total") Integer total,
        @JsonProperty("offset") Integer offset,
        @JsonProperty("limit") Integer limit) {
}
