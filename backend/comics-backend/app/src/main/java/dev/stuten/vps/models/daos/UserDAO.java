package dev.stuten.vps.models.daos;

import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.mindrot.jbcrypt.BCrypt;

import dev.stuten.vps.jooq.tables.Users;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.dtos.UserWithPasswordDTO;
import dev.stuten.vps.models.mappers.UserMapper;

public class UserDAO extends DAO {

    public UserDAO(DSLContext dsl) {
        super(dsl);
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

        return DSL().insertInto(Users.USERS)
                .set(Users.USERS.USERNAME, dto.username())
                .set(Users.USERS.EMAIL, dto.email())
                .set(Users.USERS.PASSWORD, hashedPwd)
                .returning(Users.USERS.asterisk())
                .fetchOptional(UserMapper::mapToDTO);
    }

    public Optional<UserDTO> findById(Integer id) {
        return DSL().selectFrom(Users.USERS)
                .where(Users.USERS.ID.eq(id))
                .fetchOptional(UserMapper::mapToDTO);
    }

    public Optional<UserDTO> findByEmail(String email) {
        return DSL().selectFrom(Users.USERS)
                .where(Users.USERS.EMAIL.eq(email))
                .fetchOptional(UserMapper::mapToDTO);
    }

    public Optional<UserWithPasswordDTO> findByEmailWithPassword(String email) {
        return DSL().selectFrom(Users.USERS)
                .where(Users.USERS.EMAIL.eq(email))
                .fetchOptional(UserMapper::mapToPasswordDTO);
    }

}