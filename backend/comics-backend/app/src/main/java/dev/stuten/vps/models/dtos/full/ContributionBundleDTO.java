package dev.stuten.vps.models.dtos.full;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;

/**
 * Full DTO for a contribution bundle with all related data
 */
public record ContributionBundleDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("status") ContributionBundleStatusEnum status,
        @JsonProperty("note") String note,
        @JsonProperty("contributions") List<SimpleContributionDTO> contributions,
        @JsonProperty("submitter") SimpleUserDTO submitter,
        
        @JsonProperty("createdAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = LocalDateTimeSerializer.class) @JsonDeserialize(using = LocalDateTimeDeserializer.class) LocalDateTime createdAt,

        @JsonProperty("modifiedAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = LocalDateTimeSerializer.class) @JsonDeserialize(using = LocalDateTimeDeserializer.class) LocalDateTime modifiedAt

) {
}