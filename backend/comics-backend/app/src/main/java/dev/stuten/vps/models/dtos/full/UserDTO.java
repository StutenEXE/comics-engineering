package dev.stuten.vps.models.dtos.full;

import com.fasterxml.jackson.annotation.JsonProperty;

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
public class UserDTO extends ModifiedAtDTO {
        @JsonProperty("username")
        private String username;

        @JsonProperty("email")
        private String email;

        @JsonProperty("isAdmin")
        private Boolean isAdmin;

        @JsonProperty("isDeleted")
        private Boolean isDeleted;
}
