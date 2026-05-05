package dev.stuten.vps.models.dtos.simple;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.dtos.simple.deserializer.SimpleContributionDTODeserializer;
import dev.stuten.vps.models.dtos.template.IdDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@JsonDeserialize(using = SimpleContributionDTODeserializer.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleContributionDTO<T extends IdDTO> extends IdDTO {
    @JsonProperty("bundleId")
    private Integer bundleId;

    @JsonProperty("localRef")
    private Integer localRef;

    @JsonProperty("entityType")
    private ContributionTypeEnum entityType;

    @JsonProperty("action")
    private ContributionActionEnum action;

    @JsonProperty("entityId")
    private Integer entityId;

    @JsonProperty("proposedData")
    private T proposedData;

    @JsonProperty("entitySnapshot")
    private T entitySnapshot;

    @JsonProperty("status")
    private ContributionStatusEnum status;

    @JsonProperty("resolvedEntityId")
    private Integer resolvedEntityId;
}
