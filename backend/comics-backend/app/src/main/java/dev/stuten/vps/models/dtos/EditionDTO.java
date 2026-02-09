package dev.stuten.vps.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EditionDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("isbn") String isbn,
        @JsonProperty("ean") String ean,
        @JsonProperty("price") Float price,
        @JsonProperty("url") String url,
        @JsonProperty("imgUrl") String imgUrl,
        @JsonProperty("coverType") String coverType,
        @JsonProperty("parutionDate") String parutionDate,
        @JsonProperty("publisher") PublisherDTO publisher,
        @JsonProperty("book") BookDTO book,
        @JsonProperty("createdAt") String createdAt,
        @JsonProperty("modifiedAt") String modifiedAt,
        @JsonProperty("addedBy") UserDTO addedBy
    ) {
}
