package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDateTime;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.UsersRecord;
import dev.stuten.vps.models.dtos.full.UserDTO;
import dev.stuten.vps.models.dtos.full.UserWithPasswordDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;

public class UserMapper {
    private static Map<TableField<UsersRecord, ? extends Object>, String> fieldMapping = Map.of(
            USERS.ID, "user_id",
            USERS.USERNAME, "user_username",
            USERS.EMAIL, "user_email",
            USERS.PASSWORD, "user_password",
            USERS.IS_ADMIN, "user_is_admin",
            USERS.CREATED_AT, "user_created_at",
            USERS.MODIFIED_AT, "user_modified_at");

    public static String getFieldName(TableField<UsersRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    @SuppressWarnings("null")
    public static UserDTO mapToDTO(Record r) {
        UserDTO dto = UserDTO.builder()
                .id(r.get(getFieldName(USERS.ID), Integer.class))
                .username(r.get(getFieldName(USERS.USERNAME), String.class))
                .email(r.get(getFieldName(USERS.EMAIL), String.class))
                .isAdmin(r.get(getFieldName(USERS.IS_ADMIN), Boolean.class))
                .createdAt(r.get(getFieldName(USERS.CREATED_AT), LocalDateTime.class))
                .modifiedAt(r.get(getFieldName(USERS.MODIFIED_AT), LocalDateTime.class))
                .build();
        return dto;
    }

    @SuppressWarnings("null")
    public static SimpleUserDTO mapToSimpleDTO(Record r) {
        SimpleUserDTO dto = SimpleUserDTO.builder()
                .id(r.get(getFieldName(USERS.ID), Integer.class))
                .username(r.get(getFieldName(USERS.USERNAME), String.class))
                .build();
        return dto;
    }

    @SuppressWarnings("null")
    public static UserWithPasswordDTO mapToPasswordDTO(Record r) {
        UserWithPasswordDTO dto = UserWithPasswordDTO.builder()
                .id(r.get(getFieldName(USERS.ID), Integer.class))
                .username(r.get(getFieldName(USERS.USERNAME), String.class))
                .email(r.get(getFieldName(USERS.EMAIL), String.class))
                .password(r.get(getFieldName(USERS.PASSWORD), String.class))
                .isAdmin(r.get(getFieldName(USERS.IS_ADMIN), Boolean.class))
                .createdAt(r.get(getFieldName(USERS.CREATED_AT), LocalDateTime.class))
                .modifiedAt(r.get(getFieldName(USERS.MODIFIED_AT), LocalDateTime.class))
                .build();
        return dto;
    }

    // public static SimpleUserDTO mapGenericMapToSimpleDTO(Map<String, Object> map)
    // {
    // SimpleUserDTO dto = new SimpleUserDTO(
    // (Integer) map.get("id"),
    // (String) map.get("username"));
    // return dto;
    // }
}
