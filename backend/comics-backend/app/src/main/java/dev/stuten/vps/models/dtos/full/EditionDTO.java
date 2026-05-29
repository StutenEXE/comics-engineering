package dev.stuten.vps.models.dtos.full;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimplePublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.dtos.template.ModifiedAtDTO;
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
public class EditionDTO extends ModifiedAtDTO {
    
    @JsonProperty("isbn")
    private String isbn;

    @JsonProperty("ean")
    private String ean;

    @JsonProperty("npages")
    private Integer npages;

    @JsonProperty("price")
    private Float price;

    @JsonProperty("url")
    private String url;

    @JsonProperty("imgUrl")
    private String imgUrl;

    @JsonProperty("coverType")
    private String coverType;

    @JsonProperty("parutionDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate parutionDate;

    @JsonProperty("publisher")
    private SimplePublisherDTO publisher;

    @JsonProperty("book")
    private SimpleBookDTO book;
    
    @JsonProperty("serie")
    private SimpleSerieDTO serie;

    @JsonProperty("addedBy")
    private SimpleUserDTO addedBy;
}
