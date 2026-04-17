package dev.stuten.vps.models.dtos.simple;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

public record SimpleIssueDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("number") Integer number,

        @JsonProperty("coverDate") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") @JsonSerialize(using = LocalDateSerializer.class) @JsonDeserialize(using = LocalDateDeserializer.class) LocalDate coverDate,

        @JsonProperty("parutionDate") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") @JsonSerialize(using = LocalDateSerializer.class) @JsonDeserialize(using = LocalDateDeserializer.class) LocalDate parutionDate,

        @JsonProperty("issueSerieId") Integer issueSerieId) {
}
