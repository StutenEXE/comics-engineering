package dev.stuten.vps.models.dtos.request.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

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
@JsonIgnoreProperties(ignoreUnknown = true)
public class SortingDTO<T extends Enum<T>> {

    @JsonProperty("sortField")
    private T field;

    @JsonProperty("sortDirection")
    private SortDirection order = SortDirection.ASCENDING;

    public enum SortDirection {
        @JsonProperty("asc")
        ASCENDING,
        @JsonProperty("desc")
        DESCENDING
    }

}
