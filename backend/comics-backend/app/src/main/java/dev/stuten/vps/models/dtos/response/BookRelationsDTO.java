package dev.stuten.vps.models.dtos.response;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

// Books related to a book through their issues
@Getter
@ToString
@NoArgsConstructor
public class BookRelationsDTO {
        // Books containing every issue of the book
        @JsonProperty("containedIn")
        private final List<SimpleBookDTO> containedIn = new ArrayList<>();

        // Books whose every issue is in the book
        @JsonProperty("contains")
        private final List<SimpleBookDTO> contains = new ArrayList<>();

        // Books having exactly the same issues as the book
        @JsonProperty("sameContent")
        private final List<SimpleBookDTO> sameContent = new ArrayList<>();
}
