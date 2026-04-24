package dev.stuten.vps.models.dtos.full;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.models.dtos.template.ModifiedAtDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Full DTO for a contribution bundle with all related data
 */
@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class ContributionBundleDTO extends ModifiedAtDTO {

        @JsonProperty("status")
        private ContributionBundleStatusEnum status;

        @JsonProperty("note")
        private String note;

        @JsonProperty("contributions")
        private List<SimpleContributionDTO<? extends IdDTO>> contributions;

        @JsonProperty("submitter")
        private SimpleUserDTO submitter;
}