package dev.stuten.vps.models.dtos;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.OffsetTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.OffsetDateTimeSerializer;

public record EditionDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("isbn") String isbn,
        @JsonProperty("ean") String ean,
        @JsonProperty("price") Float price,
        @JsonProperty("url") String url,
        @JsonProperty("imgUrl") String imgUrl,
        @JsonProperty("coverType") String coverType,

        @JsonProperty("parutionDate") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime parutionDate,

        @JsonProperty("publisher") PublisherDTO publisher,
        @JsonProperty("book") BookDTO book,

        @JsonProperty("createdAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime createdAt,

        @JsonProperty("modifiedAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime modifiedAt,

        @JsonProperty("addedBy") UserDTO addedBy) {
}
