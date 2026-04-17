package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectWhereStep;

import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.mappers.IssueMapper;

public class IssueDAO extends DAO {

        public IssueDAO(DSLContext dsl) {
                super(dsl);
        }

        @SuppressWarnings("unchecked")
        @Override
        protected RecordMapper<? super Record, IssueDTO> getDefaultMapper() {
                return IssueMapper::mapToDTO;
        }

        @Override
        protected Collection<SelectFieldOrAsterisk> getSimpleSelectStatement() {
                return List.of(
                                ISSUES.ID.as(IssueMapper.getFieldName(ISSUES.ID)),
                                ISSUES.NAME.as(IssueMapper.getFieldName(ISSUES.NAME)),
                                ISSUES.NUMBER.as(IssueMapper.getFieldName(ISSUES.NUMBER)),
                                ISSUES.COVER_DATE.as(IssueMapper.getFieldName(ISSUES.COVER_DATE)),
                                ISSUES.PARUTION_DATE.as(IssueMapper.getFieldName(ISSUES.PARUTION_DATE)),
                                ISSUES.SERIES_ID.as(IssueMapper.getFieldName(ISSUES.SERIES_ID)),
                                ISSUES.ADDED_BY.as(IssueMapper.getFieldName(ISSUES.ADDED_BY)),
                                ISSUES.CREATED_AT.as(IssueMapper.getFieldName(ISSUES.CREATED_AT)),
                                ISSUES.MODIFIED_AT.as(IssueMapper.getFieldName(ISSUES.MODIFIED_AT)));
        }

        @Override
        protected SelectWhereStep<? extends Record> getDefaultSelectStatement() {
                return DSL().select(getSimpleSelectStatement())
                                .select(new IssueSerieDAO(this.DSL()).getSimpleSelectStatement())
                                .select(new UserDAO(this.DSL()).getSimpleSelectStatement())
                                .select(multiset( // Books (many to many)
                                                select(new BookDAO(this.DSL())
                                                                .getSimpleSelectStatement())
                                                                .from(BOOKS_ISSUES)
                                                                .join(BOOKS)
                                                                .on(BOOKS_ISSUES.BOOK_ID.eq(BOOKS.ID))
                                                                .where(BOOKS_ISSUES.ISSUE_ID
                                                                                .eq(ISSUES.ID)))
                                                .as("books"))
                                .from(ISSUES)
                                .leftJoin(ISSUE_SERIES).on(ISSUES.SERIES_ID.eq(ISSUE_SERIES.ID))
                                .leftJoin(USERS).on(ISSUES.ADDED_BY.eq(USERS.ID));
        }

        public Optional<IssueDTO> create(IssueDTO dto) {
                return DSL().insertInto(ISSUES)
                                .set(ISSUES.NAME, dto.name())
                                .set(ISSUES.NUMBER, dto.number())
                                .set(ISSUES.COVER_DATE, dto.coverDate())
                                .set(ISSUES.PARUTION_DATE, dto.parutionDate())
                                .set(ISSUES.SERIES_ID, dto.issueSerie().id())
                                .set(ISSUES.ADDED_BY, dto.addedBy().id())
                                .returning(ISSUES.asterisk())
                                .fetchOptional(IssueMapper::mapToDTO);
        }

        public Optional<IssueDTO> findById(Integer id) {
                return super.selectOne(ISSUES.ID.eq(id));
        }

        public List<IssueDTO> findByBookId(Integer bookID) {
                return super.selectMany(ISSUES.ID.in(
                                select(BOOKS_ISSUES.ISSUE_ID)
                                                .from(BOOKS_ISSUES)
                                                .where(BOOKS_ISSUES.BOOK_ID.eq(bookID))));
        }
}
