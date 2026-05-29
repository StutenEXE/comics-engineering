package dev.stuten.vps.models.dtos.simple;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;
import dev.stuten.vps.models.dtos.template.ModifiedAtDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Simple DTO for an individual contribution in a bundle submission
 */
@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleContributionBundleDTO extends ModifiedAtDTO {

        @JsonProperty("submitterId")
        private Integer submitterId;

        @JsonProperty("submitterUsername")
        private String submitterUsername;

        @JsonProperty("status")
        private ContributionBundleStatusEnum status;

        @JsonProperty("note")
        private String note;
}