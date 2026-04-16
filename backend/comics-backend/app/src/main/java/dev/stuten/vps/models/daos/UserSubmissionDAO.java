package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.UserSubmissions.USER_SUBMISSIONS;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;

import dev.stuten.vps.jooq.enums.SubmissionActionEnum;
import dev.stuten.vps.jooq.enums.SubmissionTypeEnum;
import dev.stuten.vps.models.dtos.UserSubmissionDTO;
import dev.stuten.vps.models.mappers.UserSubmissionMapper;

public class UserSubmissionDAO extends DAO {

    public UserSubmissionDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, UserSubmissionDTO> getDefaultMapper() {
        return UserSubmissionMapper::mapToDTO;
    }

    @Override
    protected SelectWhereStep<Record> getDefaultSelectStatement() {
        return DSL().select(
                USER_SUBMISSIONS.asterisk(),
                USERS.asterisk(),
                // children (1 to many)
                multiset(
                        select(USER_SUBMISSIONS.asterisk())
                                .from(USER_SUBMISSIONS)
                                .where(USER_SUBMISSIONS.RELATED_TO.eq(USER_SUBMISSIONS.ID)))
                        .as("issues"))
                .from(USER_SUBMISSIONS)
                .leftJoin(USER_SUBMISSIONS).on(USER_SUBMISSIONS.RELATED_TO.eq(USER_SUBMISSIONS.ID))
                .leftJoin(USERS).on(USER_SUBMISSIONS.USER_ID.eq(USERS.ID));
    }

    @SuppressWarnings("null")
    public Optional<UserSubmissionDTO> create(UserSubmissionDTO dto) {
        return DSL().insertInto(USER_SUBMISSIONS)
                .set(USER_SUBMISSIONS.USER_ID, dto.addedBy().id())
                .set(USER_SUBMISSIONS.RELATED_TO, dto.relatedTo() != null ? dto.relatedTo().id() : null)
                .set(USER_SUBMISSIONS.SUBMISSION_TYPE, SubmissionTypeEnum.valueOf(dto.submissionType().getValue()))
                .set(USER_SUBMISSIONS.SUBMISSION_ACTION, SubmissionActionEnum.valueOf(dto.submissionAction().getValue()))
                .set(USER_SUBMISSIONS.SUBMISSION_DATA, dto.submissionData())
                .set(USER_SUBMISSIONS.NOTE, dto.note())
                .set(USER_SUBMISSIONS.VALIDATED, dto.validated())
                .returning(USER_SUBMISSIONS.asterisk())
                .fetchOptional(UserSubmissionMapper::mapToDTO);
    }

}
