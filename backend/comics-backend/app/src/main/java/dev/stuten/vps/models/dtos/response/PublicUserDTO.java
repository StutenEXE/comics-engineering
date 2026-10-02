package dev.stuten.vps.models.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.stuten.vps.models.dtos.template.CreatedAtDTO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

// Publicly visible user information (no email or sensitive data)
@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class PublicUserDTO extends CreatedAtDTO {
        @JsonProperty("username")
        private String username;

        @JsonProperty("isAdmin")
        private Boolean isAdmin;
}
