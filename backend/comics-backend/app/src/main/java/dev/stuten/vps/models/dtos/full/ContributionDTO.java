package dev.stuten.vps.models.dtos.full;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.dtos.simple.SimpleContributionBundleDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Full DTO for an individual contribution
 */
@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class ContributionDTO<T extends IdDTO> extends IdDTO {

    @JsonProperty("bundle")
    private SimpleContributionBundleDTO bundle;

    @JsonProperty("localRef")
    private Integer localRef;

    @JsonProperty("entityType")
    private ContributionTypeEnum entityType;

    @JsonProperty("action")
    private ContributionActionEnum action;

    @JsonProperty("entityId")
    private Integer entityId;

    // @JsonProperty("proposedData") Map<String, Object> proposedData,
    // @JsonProperty("entitySnapshot") Map<String, Object> entitySnapshot,
    @JsonProperty("proposedData")
    private T proposedData;

    @JsonProperty("entitySnapshot")
    private T entitySnapshot;

    @JsonProperty("status")
    private ContributionStatusEnum status;

    @JsonProperty("resolvedEntityId")
    private Integer resolvedEntityId;
}