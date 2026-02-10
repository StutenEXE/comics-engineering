package dev.stuten.vps.models.dtos;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.OffsetTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.OffsetDateTimeSerializer;

public record BookDTO(
                @JsonProperty("id") Integer id,
                @JsonProperty("name") String name,
                @JsonProperty("desc") String desc,
                @JsonProperty("number") Integer number,
                @JsonProperty("voContent") String voContent,
                @JsonProperty("serie") SerieDTO serie,
                @JsonProperty("editions") List<EditionDTO> editions,
                @JsonProperty("issues") List<IssueDTO> issues,

                @JsonProperty("createdAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime createdAt,

                @JsonProperty("modifiedAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime modifiedAt,

                @JsonProperty("addedBy") UserDTO addedBy) {
}
