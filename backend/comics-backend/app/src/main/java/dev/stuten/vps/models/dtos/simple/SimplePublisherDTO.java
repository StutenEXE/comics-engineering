package dev.stuten.vps.models.dtos.simple;

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
public class SimplePublisherDTO extends IdDTO {
    
    @JsonProperty("name")
    private String name;
}
