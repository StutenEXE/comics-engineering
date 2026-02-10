package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Users.USERS;

import org.jooq.Record;

import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.dtos.UserWithPasswordDTO;

public class UserMapper {

    public static UserDTO mapToDTO(Record r) {
        UserDTO dto = new UserDTO(
                r.get(USERS.ID),
                r.get(USERS.USERNAME),
                r.get(USERS.EMAIL),
                r.get(USERS.IS_ADMIN),
                r.get(USERS.CREATED_AT),
                r.get(USERS.MODIFIED_AT));
        return dto;
    }

    public static UserWithPasswordDTO mapToPasswordDTO(Record r) {
        UserWithPasswordDTO dto = new UserWithPasswordDTO(
                r.get(USERS.ID),
                r.get(USERS.USERNAME),
                r.get(USERS.EMAIL),
                r.get(USERS.PASSWORD),
                r.get(USERS.IS_ADMIN),
                r.get(USERS.CREATED_AT),
                r.get(USERS.MODIFIED_AT));
        return dto;
    }
}
