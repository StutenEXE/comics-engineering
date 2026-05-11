package dev.stuten.vps.models.dtos.full;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
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
public class BookDTO extends ModifiedAtDTO {

    @JsonProperty("name")
    private String name;

    @JsonProperty("desc")
    private String desc;

    @JsonProperty("number")
    private Integer number;

    @JsonProperty("voContent")
    private String voContent;

    @JsonProperty("imgUrl")
    private String imgUrl;

    @JsonProperty("serie")
    private SimpleSerieDTO serie;

    @JsonProperty("editions")
    private List<SimpleEditionDTO> editions;

    @JsonProperty("issues")
    private List<SimpleIssueDTO> issues;

    @JsonProperty("addedBy")
    private SimpleUserDTO addedBy;
}
