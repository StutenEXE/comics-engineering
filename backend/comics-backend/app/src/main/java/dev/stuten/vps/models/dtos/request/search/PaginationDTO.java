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

    public static final int DEFAULT_LIMIT = 20;
    public static final int MAX_LIMIT = 100;

    // Number of elements to skip before the first returned element
    @JsonProperty("offset")
    private Integer offset = 0;

    // Maximum number of elements to return (size of the page)
    @JsonProperty("limit")
    private Integer limit = DEFAULT_LIMIT;

}
