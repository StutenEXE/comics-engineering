package dev.stuten.vps.models.dtos.request.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// Filters of the contribution bundle list, a null filter is not applied
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContributionBundleFilterDTO {

    // Exact ID
    @JsonProperty("id")
    private Integer id;

    // Submitter username containing this text (case insensitive)
    @JsonProperty("submitter")
    private String submitter;

    // Note containing this text (case insensitive)
    @JsonProperty("note")
    private String note;

    @JsonProperty("status")
    private ContributionBundleStatusEnum status;
}
