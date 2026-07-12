package dev.stuten.vps.models.dtos.simple;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

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
public class SimpleOwnedEditionDTO extends IdDTO {

    @JsonProperty("date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime date;

    @JsonProperty("read")
    private Boolean read;

    @JsonProperty("dateRead")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate dateRead;

    @JsonProperty("gift")
    private Boolean gift;

    @JsonProperty("signed")
    private Boolean signed;

    @JsonProperty("purchasePrice")
    private BigDecimal purchasePrice;

    @JsonProperty("fees")
    private BigDecimal fees;

    @JsonProperty("retailPrice")
    private BigDecimal retailPrice;

    @JsonProperty("note")
    private String note;

    @JsonProperty("editionId")
    private Integer editionId;
}