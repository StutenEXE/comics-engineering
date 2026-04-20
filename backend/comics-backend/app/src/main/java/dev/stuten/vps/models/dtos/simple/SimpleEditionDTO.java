package dev.stuten.vps.models.dtos.simple;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

public record SimpleEditionDTO(
                @JsonProperty("id") Integer id,
                @JsonProperty("isbn") String isbn,
                @JsonProperty("ean") String ean,
                @JsonProperty("npages") Integer npages,
                @JsonProperty("price") Float price,
                @JsonProperty("url") String url,
                @JsonProperty("imgUrl") String imgUrl,
                @JsonProperty("coverType") String coverType,

                @JsonProperty("parutionDate") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") @JsonSerialize(using = LocalDateSerializer.class) @JsonDeserialize(using = LocalDateDeserializer.class) LocalDate parutionDate,

                @JsonProperty("publisherId") Integer publisherId,
                @JsonProperty("publisherName") String publisherName,

                @JsonProperty("bookId") Integer bookId) {
}
