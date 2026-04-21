package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;

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

import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.mappers.BookMapper;

public class BookDAO extends ContributableDAO<BookDTO> {

        public BookDAO(DSLContext dsl) {
                super(dsl);
        }

        @Override
        protected RecordMapper<? super Record, BookDTO> getDefaultMapper() {
                return BookMapper::mapToDTO;
        }

        @Override
        protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
                return List.of(
                                BOOKS.ID.as(BookMapper.getFieldName(BOOKS.ID)),
                                BOOKS.NAME.as(BookMapper.getFieldName(BOOKS.NAME)),
                                BOOKS.DESC.as(BookMapper.getFieldName(BOOKS.DESC)),
                                BOOKS.NUMBER.as(BookMapper.getFieldName(BOOKS.NUMBER)),
                                BOOKS.VO_CONTENT.as(BookMapper.getFieldName(BOOKS.VO_CONTENT)),
                                BOOKS.IMG_URL.as(BookMapper.getFieldName(BOOKS.IMG_URL)),
                                BOOKS.SERIES_ID.as(BookMapper.getFieldName(BOOKS.SERIES_ID)),
                                SERIES.NAME.as(BookMapper.getFieldName(SERIES.NAME)),
                                BOOKS.ADDED_BY.as(BookMapper.getFieldName(BOOKS.ADDED_BY)),
                                BOOKS.CREATED_AT.as(BookMapper.getFieldName(BOOKS.CREATED_AT)),
                                BOOKS.MODIFIED_AT.as(BookMapper.getFieldName(BOOKS.MODIFIED_AT)));
        }

        @Override
        protected SelectJoinStep<? extends Record> getSimpleFromClause() {
                return DSL().select(getSimpleSelectFields()).from(BOOKS)
                                .leftJoin(SERIES).on(BOOKS.SERIES_ID.eq(SERIES.ID));
        }

        @Override
        protected SelectJoinStep<? extends Record> getFullFromClause() {
                return DSL().select(getSimpleSelectFields())
                                .select(new SerieDAO(this.DSL()).getSimpleSelectFields())
                                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                                .select(multiset( // Editions (1 to many)
                                                new EditionDAO(this.DSL())
                                                                .getSimpleFromClause()
                                                                .where(EDITIONS.BOOK_ID.eq(BOOKS.ID)))
                                                .as("editions"))
                                .select(multiset( // Issues (many to many)
                                                new IssueDAO(this.DSL())
                                                                .getSimpleFromClause()
                                                                .join(BOOKS_ISSUES)
                                                                .on(BOOKS_ISSUES.ISSUE_ID.eq(ISSUES.ID))
                                                                .where(BOOKS_ISSUES.BOOK_ID.eq(BOOKS.ID)))
                                                .as("issues"))
                                .from(BOOKS)
                                .leftJoin(SERIES).on(BOOKS.SERIES_ID.eq(SERIES.ID))
                                .leftJoin(USERS).on(BOOKS.ADDED_BY.eq(USERS.ID));
        }

        @Override
        public void replaceLocalRefs(Map<String, Object> proposedData, Map<Integer, Integer> localRefs) throws OperationNotSupportedException {
                // Serie id
                Map<String, Object> serieMap = (Map<String, Object>) proposedData.get("serie");
                super.replaceLocalRef(serieMap, localRefs);
                System.out.println(proposedData);
        }


        @Override
        protected BookDTO mapProposedDataToDTO(Map<String, Object> proposedData) {
                return BookMapper.mapGenericMapToDTO(proposedData);
        }

        @Override
        protected Integer getIdFromDTO(BookDTO dto) {
                return dto.id();
        }

        @Override
        public Optional<Integer> create(BookDTO dto) {
                return DSL().insertInto(BOOKS)
                                .set(BOOKS.NAME, dto.name())
                                .set(BOOKS.DESC, dto.desc())
                                .set(BOOKS.NUMBER, dto.number())
                                .set(BOOKS.VO_CONTENT, dto.voContent())
                                .set(BOOKS.IMG_URL, dto.imgUrl())
                                .set(BOOKS.SERIES_ID, dto.serie().id())
                                .set(BOOKS.ADDED_BY, dto.addedBy().id())
                                .returning(BOOKS.ID)
                                .fetchOptional()
                                .map(record -> record.get(BOOKS.ID));
        }

        @Override
        public boolean update(BookDTO dto) {
                return DSL().update(BOOKS)
                                .set(BOOKS.NAME, dto.name())
                                .set(BOOKS.DESC, dto.desc())
                                .set(BOOKS.NUMBER, dto.number())
                                .set(BOOKS.VO_CONTENT, dto.voContent())
                                .set(BOOKS.IMG_URL, dto.imgUrl())
                                .set(BOOKS.SERIES_ID, dto.serie().id())
                                .set(BOOKS.MODIFIED_AT, LocalDateTime.now())
                                .where(BOOKS.ID.eq(dto.id()))
                                .execute() > 0;
        }

        @Override
        public boolean delete(BookDTO dto) {
                return DSL().delete(BOOKS)
                                .where(BOOKS.ID.eq(dto.id()))
                                .execute() > 0;
        }

        @Override
        public Optional<BookDTO> findById(Integer id) {
                return super.selectOne(BOOKS.ID.eq(id));
        }

        public List<BookDTO> findBySerieId(Integer serieID) {
                return super.selectMany(BOOKS.SERIES_ID.eq(serieID));
        }

        public List<SimpleBookDTO> findLatest(Integer from, Integer limit) {
                return getSimpleFromClause()
                                .offset(from)
                                .limit(limit)
                                .fetch(BookMapper::mapToSimpleDTO);
        }

        public List<BookDTO> searchByName(String query) {
                String searchPattern = toSearchPattern(query);
                return super.selectMany(BOOKS.NAME.likeIgnoreCase(searchPattern));
        }
}
