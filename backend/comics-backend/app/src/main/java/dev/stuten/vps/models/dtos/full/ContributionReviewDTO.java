package dev.stuten.vps.models.dtos.full;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.dtos.template.CreatedAtDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Full DTO for a contribution review
 */
@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class ContributionReviewDTO extends CreatedAtDTO {

    @JsonProperty("contribution")
    private SimpleContributionDTO<? extends IdDTO> contribution;

    @JsonProperty("reviewer")
    private SimpleUserDTO reviewer;

    @JsonProperty("comment")
    private String comment;
}