package dev.stuten.vps.models.dtos.request.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@SuperBuilder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OwnedEditionFilterDTO {

    @JsonProperty("bookName")
    private String bookName;

    @JsonProperty("serieName")
    private String serieName;

    @JsonProperty("publisherId")
    private Integer publisherId;

    @JsonProperty("read")
    private Boolean read;
}
