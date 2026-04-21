package dev.stuten.vps.models.dtos.simple;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;

/**
 * Simple DTO for an individual contribution in a bundle submission
 */
public record SimpleContributionBundleDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("submitterId") Integer submitterId,
        @JsonProperty("submitterUsername") String submitterUsername,
        @JsonProperty("status") ContributionBundleStatusEnum status,
        @JsonProperty("note") String note,
        
        @JsonProperty("createdAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = LocalDateTimeSerializer.class) @JsonDeserialize(using = LocalDateTimeDeserializer.class) LocalDateTime createdAt,

        @JsonProperty("modifiedAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = LocalDateTimeSerializer.class) @JsonDeserialize(using = LocalDateTimeDeserializer.class) LocalDateTime modifiedAt
) { }