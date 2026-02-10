package dev.stuten.vps.models.daos;

import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;
import org.mindrot.jbcrypt.BCrypt;

import static dev.stuten.vps.jooq.tables.Users.USERS;
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

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, UserDTO> getDefaultMapper() {
        return UserMapper::mapToDTO;
    }

    @Override
    protected SelectWhereStep<? super Record> getDefaultSelectStatement() {
        return DSL().select(USERS.asterisk()).from(USERS);
    }

    public Optional<UserDTO> create(UserWithPasswordDTO dto) {
        // 12 log rounds for security and performance
        String hashedPwd = BCrypt.hashpw(dto.password(), BCrypt.gensalt(12));

        return DSL().insertInto(USERS)
                .set(USERS.USERNAME, dto.username())
                .set(USERS.EMAIL, dto.email())
                .set(USERS.PASSWORD, hashedPwd)
                .returning(USERS.asterisk())
                .fetchOptional(UserMapper::mapToDTO);
    }

    public Optional<UserDTO> findById(Integer id) {
        return selectOne(USERS.ID.eq(id));
    }

    public Optional<UserDTO> findByEmail(String email) {
        return selectOne(USERS.EMAIL.eq(email));
    }

    public Optional<UserWithPasswordDTO> findByEmailWithPassword(String email) {
        return selectOne(USERS.EMAIL.eq(email), UserMapper::mapToPasswordDTO);
    }

    public List<UserDTO> getUsers(Integer from, Integer limit) {
        return getDefaultSelectStatement()
                        .offset(from)
                        .limit(limit)
                        .fetch(getDefaultMapper());
    }

}