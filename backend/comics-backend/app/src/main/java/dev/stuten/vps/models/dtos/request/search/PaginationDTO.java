package dev.stuten.vps.models.dtos.request.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaginationDTO {

    // Number of elements to skip
    @JsonProperty("from")
    private Integer from = 0;

    // Maximum number of elements to return
    @JsonProperty("limit")
    private Integer limit = 10;

}
