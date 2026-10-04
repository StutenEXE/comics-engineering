package dev.stuten.vps.models.dtos.request.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// Filters of the user list, a null filter is not applied
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserFilterDTO {

    // Exact ID
    @JsonProperty("id")
    private Integer id;

    // Username containing this text (case insensitive)
    @JsonProperty("username")
    private String username;

    // Email containing this text (case insensitive)
    @JsonProperty("email")
    private String email;

    @JsonProperty("isAdmin")
    private Boolean isAdmin;

    @JsonProperty("isDeleted")
    private Boolean isDeleted;
}
