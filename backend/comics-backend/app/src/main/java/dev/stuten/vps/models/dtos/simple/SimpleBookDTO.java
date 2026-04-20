package dev.stuten.vps.models.dtos.simple;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SimpleBookDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("desc") String desc,
        @JsonProperty("number") Integer number,
        @JsonProperty("voContent") String voContent,
        @JsonProperty("imgUrl") String imgUrl,
        @JsonProperty("serieId") Integer serieId,
        @JsonProperty("serieName") String serieName
) {
}
