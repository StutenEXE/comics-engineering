package dev.stuten.vps.models.dtos.full;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
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
public class PublisherDTO extends ModifiedAtDTO {

    @JsonProperty("name")
    private String name;

    @JsonProperty("editions")
    private List<SimpleEditionDTO> editions;
}
