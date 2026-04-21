package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.models.mappers.IssueSerieMapper;

public class IssueSerieDAO extends ContributableDAO<IssueSerieDTO> {

    public IssueSerieDAO(DSLContext dsl) {
        super(dsl);
    }

    @Override
    protected RecordMapper<? super Record, IssueSerieDTO> getDefaultMapper() {
        return IssueSerieMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                ISSUE_SERIES.ID.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.ID)),
                ISSUE_SERIES.NAME.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.NAME)),
                ISSUE_SERIES.DESC.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.DESC)),
                ISSUE_SERIES.START_DATE.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.START_DATE)),
                ISSUE_SERIES.END_DATE.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.END_DATE)),
                ISSUE_SERIES.ADDED_BY.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.ADDED_BY)),
                ISSUE_SERIES.CREATED_AT.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.CREATED_AT)),
                ISSUE_SERIES.MODIFIED_AT.as(IssueSerieMapper.getFieldName(ISSUE_SERIES.MODIFIED_AT)));
    }

    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(ISSUE_SERIES);
    }

    @Override
    protected SelectJoinStep<? extends Record> getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                .select(multiset( // Issues (1 to many)
                        new IssueDAO(this.DSL())
                                .getSimpleFromClause()
                                .where(ISSUES.SERIES_ID.eq(ISSUE_SERIES.ID)))
                        .as("issues"))
                .select(multiset( // Books (1 to many through Issues)
                        new BookDAO(this.DSL()).getSimpleFromClause()
                                .join(BOOKS_ISSUES).on(BOOKS.ID.eq(BOOKS_ISSUES.BOOK_ID))
                                .join(ISSUES).on(BOOKS_ISSUES.ISSUE_ID.eq(ISSUES.ID))
                                .where(ISSUES.SERIES_ID.eq(ISSUE_SERIES.ID)))
                        .as("books"))
                .from(ISSUE_SERIES)
                .leftJoin(USERS).on(ISSUE_SERIES.ADDED_BY.eq(USERS.ID));
    }

    @Override
    public void replaceLocalRefs(Map<String, Object> proposedData, Map<Integer, Integer> localRefs) { }

    @Override
    protected IssueSerieDTO mapProposedDataToDTO(Map<String, Object> proposedData) {
        return IssueSerieMapper.mapGenericMapToDTO(proposedData);
    }

    @Override
    protected Integer getIdFromDTO(IssueSerieDTO dto) {
        return dto.id();
    }

    @Override
    public Optional<Integer> create(IssueSerieDTO dto) {
        return DSL().insertInto(ISSUE_SERIES)
                .set(ISSUE_SERIES.NAME, dto.name())
                .set(ISSUE_SERIES.DESC, dto.desc())
                .set(ISSUE_SERIES.START_DATE, dto.startDate())
                .set(ISSUE_SERIES.END_DATE, dto.endDate())
                .set(ISSUE_SERIES.ADDED_BY, dto.addedBy().id())
                .returning(ISSUE_SERIES.ID)
                .fetchOptional()
                .map(record -> record.get(ISSUE_SERIES.ID));
    }

    @Override
    public boolean update(IssueSerieDTO dto) {
        return DSL().update(ISSUE_SERIES)
                .set(ISSUE_SERIES.NAME, dto.name())
                .set(ISSUE_SERIES.DESC, dto.desc())
                .set(ISSUE_SERIES.START_DATE, dto.startDate())
                .set(ISSUE_SERIES.END_DATE, dto.endDate())
                .set(ISSUE_SERIES.MODIFIED_AT, LocalDateTime.now())
                .where(ISSUE_SERIES.ID.eq(dto.id()))
                .execute() > 0;
    }

    @Override
    public boolean delete(IssueSerieDTO dto) {
        return DSL().delete(ISSUE_SERIES)
                .where(ISSUE_SERIES.ID.eq(dto.id()))
                .execute() > 0;
    }

    @Override
    public Optional<IssueSerieDTO> findById(Integer id) {
        return super.selectOne(ISSUE_SERIES.ID.eq(id));
    }
}
