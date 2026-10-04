package dev.stuten.vps.models.dtos.request.search;

import static dev.stuten.vps.jooq.tables.Users.USERS;

import org.jooq.Field;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum UserSortingFields implements SortableField {
    @JsonProperty("id")
    ID(USERS.ID),
    @JsonProperty("username")
    USERNAME(USERS.USERNAME),
    @JsonProperty("email")
    EMAIL(USERS.EMAIL),
    @JsonProperty("createdAt")
    CREATED_AT(USERS.CREATED_AT),
    @JsonProperty("isAdmin")
    IS_ADMIN(USERS.IS_ADMIN),
    @JsonProperty("isDeleted")
    IS_DELETED(USERS.IS_DELETED);

    private Field<?> field;

    UserSortingFields(Field<?> field) {
        this.field = field;
    }

    @Override
    public Field<?> getTableField() {
        return this.field;
    }
}
