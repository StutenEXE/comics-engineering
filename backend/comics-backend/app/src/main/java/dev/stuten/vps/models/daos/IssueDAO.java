package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.naming.OperationNotSupportedException;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.IssueMapper;

public class IssueDAO extends ContributableDAO<IssueDTO> {

        public IssueDAO(DSLContext dsl) {
                super(dsl);
        }

        @Override
        protected RecordMapper<? super Record, IssueDTO> getDefaultMapper() {
                return IssueMapper::mapToDTO;
        }

        @Override
        protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
                return List.of(
                                ISSUES.ID.as(IssueMapper.getFieldName(ISSUES.ID)),
                                ISSUES.NAME.as(IssueMapper.getFieldName(ISSUES.NAME)),
                                ISSUES.NUMBER.as(IssueMapper.getFieldName(ISSUES.NUMBER)),
                                ISSUES.COVER_DATE.as(IssueMapper.getFieldName(ISSUES.COVER_DATE)),
                                ISSUES.PARUTION_DATE.as(IssueMapper.getFieldName(ISSUES.PARUTION_DATE)),
                                ISSUES.FANDOM_URL.as(IssueMapper.getFieldName(ISSUES.FANDOM_URL)),
                                ISSUES.SERIES_ID.as(IssueMapper.getFieldName(ISSUES.SERIES_ID)),
                                ISSUE_SERIES.NAME.as(IssueMapper.getFieldName(ISSUE_SERIES.NAME)),
                                ISSUES.ADDED_BY.as(IssueMapper.getFieldName(ISSUES.ADDED_BY)),
                                ISSUES.CREATED_AT.as(IssueMapper.getFieldName(ISSUES.CREATED_AT)),
                                ISSUES.MODIFIED_AT.as(IssueMapper.getFieldName(ISSUES.MODIFIED_AT)));
        }

        protected SelectJoinStep<? extends Record> getSimpleFromClause() {
                return DSL().selectDistinct(getSimpleSelectFields()).from(ISSUES)
                                .leftJoin(ISSUE_SERIES).on(ISSUES.SERIES_ID.eq(ISSUE_SERIES.ID));
        }

        @Override
        protected SelectJoinStep<? extends Record> getFullFromClause() {
                return DSL().select(getSimpleSelectFields())
                                .select(new IssueSerieDAO(this.DSL()).getSimpleSelectFields())
                                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                                .select(multiset( // Books (many to many)
                                                new BookDAO(this.DSL())
                                                                .getSimpleFromClause()
                                                                .join(BOOKS_ISSUES)
                                                                .on(BOOKS_ISSUES.BOOK_ID.eq(BOOKS.ID))
                                                                .where(BOOKS_ISSUES.ISSUE_ID
                                                                                .eq(ISSUES.ID)))
                                                .as("books"))
                                .from(ISSUES)
                                .leftJoin(ISSUE_SERIES).on(ISSUES.SERIES_ID.eq(ISSUE_SERIES.ID))
                                .leftJoin(USERS).on(ISSUES.ADDED_BY.eq(USERS.ID));
        }

        @Override
        protected void replaceLocalRefs(IssueDTO proposal, Map<Integer, Integer> localRefs)
                        throws OperationNotSupportedException {
                // IssueSerie id
                SimpleIssueSerieDTO issueSerie = proposal.getIssueSerie();
                super.replaceLocalRef(issueSerie, localRefs);
        }

        @Override
        protected void insertUser(IssueDTO proposal, SimpleUserDTO user) {
                proposal.setAddedBy(user);
        }

        @Override
        public Optional<Integer> create(IssueDTO dto) {
                return DSL().insertInto(ISSUES)
                                .set(ISSUES.NAME, dto.getName())
                                .set(ISSUES.NUMBER, dto.getNumber())
                                .set(ISSUES.COVER_DATE, dto.getCoverDate())
                                .set(ISSUES.PARUTION_DATE, dto.getParutionDate())
                                .set(ISSUES.FANDOM_URL, dto.getFandomUrl())
                                .set(ISSUES.SERIES_ID, dto.getIssueSerie().getId())
                                .set(ISSUES.ADDED_BY, dto.getAddedBy().getId())
                                .returning(ISSUES.ID)
                                .fetchOptional()
                                .map(record -> record.get(ISSUES.ID));
        }

        @Override
        public boolean update(IssueDTO dto) {
                return DSL().update(ISSUES)
                                .set(ISSUES.NAME, dto.getName())
                                .set(ISSUES.NUMBER, dto.getNumber())
                                .set(ISSUES.COVER_DATE, dto.getCoverDate())
                                .set(ISSUES.PARUTION_DATE, dto.getParutionDate())
                                .set(ISSUES.FANDOM_URL, dto.getFandomUrl())
                                .set(ISSUES.SERIES_ID, dto.getIssueSerie().getId())
                                .set(ISSUES.MODIFIED_AT, LocalDateTime.now())
                                .where(ISSUES.ID.eq(dto.getId()))
                                .execute() > 0;
        }

        @Override
        public boolean delete(IssueDTO dto) {
                return DSL().delete(ISSUES)
                                .where(ISSUES.ID.eq(dto.getId()))
                                .execute() > 0;
        }

        @Override
        public Optional<IssueDTO> findById(Integer id) {
                return super.selectOne(ISSUES.ID.eq(id));
        }

        public List<IssueDTO> searchByName(String query) {
                String searchPattern = toSearchPattern(query);
                return super.selectMany(ISSUES.NAME.likeIgnoreCase(searchPattern));
        }

        public List<IssueDTO> findByBookId(Integer bookID) {
                return super.selectMany(ISSUES.ID.in(
                                select(BOOKS_ISSUES.ISSUE_ID)
                                                .from(BOOKS_ISSUES)
                                                .where(BOOKS_ISSUES.BOOK_ID.eq(bookID))));
        }

}
