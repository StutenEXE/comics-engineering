package dev.stuten.vps.models.dtos.full;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
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
public class SerieDTO extends ModifiedAtDTO {

        @JsonProperty("name")
        private String name;

        @JsonProperty("ongoing")
        private Boolean ongoing;

        @JsonProperty("oneshot")
        private Boolean oneshot;

        @JsonProperty("nvolumes")
        private Short nvolumes;

        @JsonProperty("books")
        private List<SimpleBookDTO> books;

        @JsonProperty("addedBy")
        private SimpleUserDTO addedBy;
}
