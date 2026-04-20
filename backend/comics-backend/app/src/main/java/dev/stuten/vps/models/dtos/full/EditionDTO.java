package dev.stuten.vps.models.dtos.full;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.OffsetTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.OffsetDateTimeSerializer;

import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimplePublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;

public record EditionDTO(
                @JsonProperty("id") Integer id,
                @JsonProperty("isbn") String isbn,
                @JsonProperty("ean") String ean,
                @JsonProperty("npages") Integer npages,
                @JsonProperty("price") Float price,
                @JsonProperty("url") String url,
                @JsonProperty("imgUrl") String imgUrl,
                @JsonProperty("coverType") String coverType,

                @JsonProperty("parutionDate") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") @JsonSerialize(using = LocalDateSerializer.class) @JsonDeserialize(using = LocalDateDeserializer.class) LocalDate parutionDate,

                @JsonProperty("publisher") SimplePublisherDTO publisher,
                @JsonProperty("book") SimpleBookDTO book,
                @JsonProperty("serie") SimpleSerieDTO serie,

                @JsonProperty("createdAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime createdAt,

                @JsonProperty("modifiedAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime modifiedAt,

                @JsonProperty("addedBy") SimpleUserDTO addedBy) {
}
