package dev.stuten.vps.models.daos;

import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.mindrot.jbcrypt.BCrypt;

import dev.stuten.vps.jooq.tables.Users;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.dtos.UserWithPasswordDTO;

public class UserDAO {

    private final DSLContext dsl;

    public UserDAO(DSLContext dsl) {
        this.dsl = dsl;
    }

    public static boolean checkPassword(String hash, String password) {
        return BCrypt.checkpw(password, hash);
    }

    public static UserDTO removePassword(UserWithPasswordDTO user) {
        return new UserDTO(
                user.id(), user.username(), user.email(), user.isAdmin(), user.createdAt(), user.modifiedAt());
    }

    public Optional<UserDTO> create(UserWithPasswordDTO dto) {
        // 12 log rounds for security and performance
        String hashedPwd = BCrypt.hashpw(dto.password(), BCrypt.gensalt(12));

        return dsl.insertInto(Users.USERS)
                .set(Users.USERS.USERNAME, dto.username())
                .set(Users.USERS.EMAIL, dto.email())
                .set(Users.USERS.PASSWORD, hashedPwd)
                .returning(Users.USERS.asterisk())
                .fetchOptional(this::mapToDTO);
    }

    public Optional<UserDTO> findById(Integer id) {
        return dsl.selectFrom(Users.USERS)
                .where(Users.USERS.ID.eq(id))
                .fetchOptional(this::mapToDTO);
    }

    public Optional<UserDTO> findByEmail(String email) {
        return dsl.selectFrom(Users.USERS)
                .where(Users.USERS.EMAIL.eq(email))
                .fetchOptional(this::mapToDTO);
    }

    public Optional<UserWithPasswordDTO> findByEmailWithPassword(String email) {
        return dsl.selectFrom(Users.USERS)
                .where(Users.USERS.EMAIL.eq(email))
                .fetchOptional(this::mapToPasswordDTO);
    }

    private UserDTO mapToDTO(Record r) {
        UserDTO dto = new UserDTO(
                r.get(Users.USERS.ID),
                r.get(Users.USERS.USERNAME),
                r.get(Users.USERS.EMAIL),
                r.get(Users.USERS.IS_ADMIN),
                r.get(Users.USERS.CREATED_AT).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                r.get(Users.USERS.MODIFIED_AT).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return dto;
    }

    private UserWithPasswordDTO mapToPasswordDTO(Record r) {
        UserWithPasswordDTO dto = new UserWithPasswordDTO(
                r.get(Users.USERS.ID),
                r.get(Users.USERS.USERNAME),
                r.get(Users.USERS.EMAIL),
                r.get(Users.USERS.PASSWORD),
                r.get(Users.USERS.IS_ADMIN),
                r.get(Users.USERS.CREATED_AT).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                r.get(Users.USERS.MODIFIED_AT).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return dto;
    }

}