package dev.stuten.vps.models.dtos.full;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;

public record OwnedEditionDTO (
    @JsonProperty("id") Integer id,
    
    @JsonProperty("date") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = LocalDateTimeSerializer.class) @JsonDeserialize(using = LocalDateTimeDeserializer.class) LocalDateTime date,

    @JsonProperty("read") Boolean read,

    @JsonProperty("dateRead") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") @JsonSerialize(using = LocalDateSerializer.class) @JsonDeserialize(using = LocalDateDeserializer.class) LocalDate dateRead,

    @JsonProperty("gift") Boolean gift,
    @JsonProperty("signed") Boolean signed,
    @JsonProperty("purchasePrice") BigDecimal purchasePrice,
    @JsonProperty("fees") BigDecimal fees,
    @JsonProperty("retailPrice") BigDecimal retailPrice,
    @JsonProperty("note") String note,

    @JsonProperty("edition") SimpleEditionDTO edition,
    @JsonProperty("user") SimpleUserDTO user
) {}