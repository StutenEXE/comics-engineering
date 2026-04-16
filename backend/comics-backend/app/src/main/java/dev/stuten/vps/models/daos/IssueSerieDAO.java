package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;

import dev.stuten.vps.models.dtos.IssueSerieDTO;
import dev.stuten.vps.models.mappers.IssueSerieMapper;

public class IssueSerieDAO extends DAO {

    public IssueSerieDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, IssueSerieDTO> getDefaultMapper() {
        return IssueSerieMapper::mapToDTO;
    }

    @Override
    protected SelectWhereStep<? super Record> getDefaultSelectStatement() {
        return DSL().select(
                ISSUE_SERIES.asterisk(),
                USERS.asterisk(),
                // Issues (1 to many)
                multiset(
                        select(ISSUES.asterisk())
                                .from(ISSUES)
                                .where(ISSUES.SERIES_ID.eq(ISSUE_SERIES.ID)))
                        .as("issues"))
                .from(ISSUE_SERIES)
                .leftJoin(USERS).on(ISSUE_SERIES.ADDED_BY.eq(USERS.ID));
    }

    public Optional<IssueSerieDTO> create(IssueSerieDTO dto) {
        return DSL().insertInto(ISSUE_SERIES)
                .set(ISSUE_SERIES.NAME, dto.name())
                .set(ISSUE_SERIES.DESC, dto.desc())
                .set(ISSUE_SERIES.START_DATE, dto.startDate())
                .set(ISSUE_SERIES.END_DATE, dto.endDate())
                .set(BOOKS.ADDED_BY, dto.addedBy().id())
                .returning(ISSUE_SERIES.asterisk())
                .fetchOptional(IssueSerieMapper::mapToDTO);
    }

    public Optional<IssueSerieDTO> findById(Integer id) {
        return super.selectOne(ISSUE_SERIES.ID.eq(id));
    }

}
