package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;

import dev.stuten.vps.models.dtos.BookDTO;
import dev.stuten.vps.models.mappers.BookMapper;

public class BookDAO extends DAO {

        public BookDAO(DSLContext dsl) {
                super(dsl);
        }

        @SuppressWarnings("unchecked")
        @Override
        protected RecordMapper<? super Record, BookDTO> getDefaultMapper() {
                return BookMapper::mapToDTO;
        }

        @Override
        protected SelectWhereStep<Record> getDefaultSelectStatement() {
                return DSL().select(
                                BOOKS.asterisk(),
                                SERIES.asterisk(),
                                USERS.asterisk(),
                                // Editions (1 to many)
                                multiset(
                                                select(EDITIONS.asterisk())
                                                                .from(EDITIONS)
                                                                .where(EDITIONS.BOOK_ID.eq(BOOKS.ID)))
                                                .as("editions"),
                                // Issues (many to many)
                                multiset(
                                                select(ISSUES.asterisk())
                                                                .from(BOOKS_ISSUES)
                                                                .join(ISSUES).on(BOOKS_ISSUES.ISSUE_ID.eq(ISSUES.ID))
                                                                .where(BOOKS_ISSUES.BOOK_ID.eq(BOOKS.ID)))
                                                .as("issues"))
                                .from(BOOKS)
                                .leftJoin(SERIES).on(BOOKS.SERIES_ID.eq(SERIES.ID))
                                .leftJoin(USERS).on(BOOKS.ADDED_BY.eq(USERS.ID));
        }

        public Optional<BookDTO> create(BookDTO dto) {
                return DSL().insertInto(BOOKS)
                                .set(BOOKS.NAME, dto.name())
                                .set(BOOKS.DESC, dto.desc())
                                .set(BOOKS.NUMBER, dto.number())
                                .set(BOOKS.VO_CONTENT, dto.voContent())
                                .set(BOOKS.IMG_URL, dto.imgUrl())
                                .set(BOOKS.SERIES_ID, dto.serie().id())
                                .set(BOOKS.ADDED_BY, dto.addedBy().id())
                                .returning(BOOKS.asterisk())
                                .fetchOptional(BookMapper::mapToDTO);
        }

        public Optional<BookDTO> findById(Integer id) {
                return super.selectOne(BOOKS.ID.eq(id));
        }

        public List<BookDTO> findBySerieId(Integer serieID) {
                return super.selectMany(BOOKS.SERIES_ID.eq(serieID));
        }

        public List<BookDTO> findLatest(Integer from, Integer limit) {
                return getDefaultSelectStatement()
                                .offset(from)
                                .limit(limit)
                                .fetch(getDefaultMapper());
        }

        public List<BookDTO> searchByName(String query) {
                String searchPattern = toSearchPattern(query);
                return super.selectMany(BOOKS.NAME.likeIgnoreCase(searchPattern));
        }
}
