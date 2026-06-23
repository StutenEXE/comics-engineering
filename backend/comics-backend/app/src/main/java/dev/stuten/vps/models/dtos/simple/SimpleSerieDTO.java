package dev.stuten.vps.models.dtos.simple;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

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
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleSerieDTO extends IdDTO {

        @JsonProperty("name")
        private String name;

        @JsonProperty("ongoing")
        private Boolean ongoing;

        @JsonProperty("oneshot")
        private Boolean oneshot;

        @JsonProperty("nvolumes")
        private Short nvolumes;
}
