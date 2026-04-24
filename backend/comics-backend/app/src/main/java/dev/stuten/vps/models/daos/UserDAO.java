package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;
import org.mindrot.jbcrypt.BCrypt;

import dev.stuten.vps.models.dtos.full.UserDTO;
import dev.stuten.vps.models.dtos.full.UserWithPasswordDTO;
import dev.stuten.vps.models.mappers.UserMapper;

public class UserDAO extends DAO {

    public UserDAO(DSLContext dsl) {
        super(dsl);
    }

    public static boolean checkPassword(String hash, String password) {
        return BCrypt.checkpw(password, hash);
    }

    public static UserDTO removePassword(UserWithPasswordDTO user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .isAdmin(user.getIsAdmin())
                .createdAt(user.getCreatedAt())
                .modifiedAt(user.getModifiedAt())
                .build();
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, UserDTO> getDefaultMapper() {
        return UserMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                USERS.ID.as(UserMapper.getFieldName(USERS.ID)),
                USERS.USERNAME.as(UserMapper.getFieldName(USERS.USERNAME)),
                USERS.EMAIL.as(UserMapper.getFieldName(USERS.EMAIL)),
                USERS.PASSWORD.as(UserMapper.getFieldName(USERS.PASSWORD)),
                USERS.IS_ADMIN.as(UserMapper.getFieldName(USERS.IS_ADMIN)),
                USERS.CREATED_AT.as(UserMapper.getFieldName(USERS.CREATED_AT)),
                USERS.MODIFIED_AT.as(UserMapper.getFieldName(USERS.MODIFIED_AT)));
    }

    @Override
    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(USERS);
    }

    @Override
    protected SelectJoinStep<? extends Record> getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .from(USERS);
    }

    public Optional<Integer> create(UserWithPasswordDTO dto) {
        // 12 log rounds for security and performance
        String hashedPwd = BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt(12));
        return DSL().insertInto(USERS)
                .set(USERS.USERNAME, dto.getUsername())
                .set(USERS.EMAIL, dto.getEmail())
                .set(USERS.PASSWORD, hashedPwd)
                .returning(USERS.ID)
                .fetchOptional()
                .map(record -> record.get(USERS.ID));
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
        return getFullFromClause()
                .offset(from)
                .limit(limit)
                .fetch(getDefaultMapper());
    }

}