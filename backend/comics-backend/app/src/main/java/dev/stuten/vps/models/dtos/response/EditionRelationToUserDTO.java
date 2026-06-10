package dev.stuten.vps.models.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EditionRelationToUserDTO(
        @JsonProperty("editionId") Integer editionId,
        @JsonProperty("userId") Integer userId,
        @JsonProperty("inCollection") Boolean inCollection) {

}
