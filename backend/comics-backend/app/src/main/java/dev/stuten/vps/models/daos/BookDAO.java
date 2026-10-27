package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.naming.OperationNotSupportedException;

import org.jooq.DSLContext;
import org.jooq.InsertSetMoreStep;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;
import org.jooq.impl.DSL;

import dev.stuten.vps.jooq.tables.records.BooksIssuesRecord;
import dev.stuten.vps.models.daos.utils.ImageUploader;
import dev.stuten.vps.models.dtos.request.search.PaginationDTO;
import dev.stuten.vps.models.dtos.response.BookRelationsDTO;
import dev.stuten.vps.models.dtos.response.PageDTO;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.BookMapper;

public class BookDAO extends ContributableDAO<BookDTO> {

        public BookDAO(DSLContext dsl) {
                super(dsl);
        }

        public BookDAO(DSLContext dsl, ImageUploader images) {
                super(dsl, images);
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
                return DSL().selectDistinct(getSimpleSelectFields()).from(BOOKS)
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
        protected void replaceLocalRefs(BookDTO proposal, Map<Integer, Integer> localRefs)
                        throws OperationNotSupportedException {
                // Serie id
                SimpleSerieDTO serie = proposal.getSerie();
                super.replaceLocalRef(serie, localRefs);
                // Issues ids
                for (SimpleIssueDTO issue : proposal.getIssues()) {
                        super.replaceLocalRef(issue, localRefs);
                }
        }

        @Override
        protected void insertUser(BookDTO proposal, SimpleUserDTO user) {
                proposal.setAddedBy(user);
        }

        private void linkToIssues(Integer bookId, List<SimpleIssueDTO> issues) {
                if (issues == null || issues.isEmpty()) {
                        return;
                }
                Optional<BookDTO> currBook = findById(bookId);
                List<InsertSetMoreStep<BooksIssuesRecord>> issueLinks = issues.stream()
                                .filter(issue -> {
                                        // If the book is not found, then all issues can be created
                                        if (currBook.isEmpty()) {
                                                return true;
                                        }
                                        // If issue and book are already linked, filter it out
                                        return !currBook.get().getIssues()
                                                        .stream()
                                                        .anyMatch(issue2 -> issue.getId().equals(issue2.getId()));
                                })
                                // Create the batch of insertions in the linking table
                                .map(issue -> DSL().insertInto(BOOKS_ISSUES)
                                                .set(BOOKS_ISSUES.BOOK_ID, bookId)
                                                .set(BOOKS_ISSUES.ISSUE_ID, issue.getId()))
                                .toList();
                DSL().batch(issueLinks).execute();
        }

        @Override
        public Optional<Integer> create(BookDTO dto) {
                String imgUrl = images().uploadImage(dto.getImgUrl());
                Optional<Integer> result = DSL().insertInto(BOOKS)
                                .set(BOOKS.NAME, dto.getName())
                                .set(BOOKS.DESC, dto.getDesc())
                                .set(BOOKS.NUMBER, dto.getNumber())
                                .set(BOOKS.VO_CONTENT, dto.getVoContent())
                                .set(BOOKS.IMG_URL, imgUrl)
                                .set(BOOKS.SERIES_ID, dto.getSerie().getId())
                                .set(BOOKS.ADDED_BY, dto.getAddedBy().getId())
                                .returning(BOOKS.ID)
                                .fetchOptional()
                                .map(record -> record.get(BOOKS.ID));
                if (result.isEmpty()) {
                        return result;
                }
                // Special handling for many-to-many relation with issues
                Integer bookId = result.get();
                List<SimpleIssueDTO> issues = dto.getIssues();
                linkToIssues(bookId, issues);
                return result;
        }

        @Override
        public boolean update(BookDTO dto) {
                // Generate new image url if needed
                String currentImgUrl = DSL().select(BOOKS.IMG_URL).from(BOOKS).where(BOOKS.ID.eq(dto.getId()))
                                .fetchSingle((Record r) -> r.get(BOOKS.IMG_URL));
                String newImgUrl = images().deleteAndCreateImage(currentImgUrl, dto.getImgUrl());
                linkToIssues(dto.getId(), dto.getIssues());
                return DSL().update(BOOKS)
                                .set(BOOKS.NAME, dto.getName())
                                .set(BOOKS.DESC, dto.getDesc())
                                .set(BOOKS.NUMBER, dto.getNumber())
                                .set(BOOKS.VO_CONTENT, dto.getVoContent())
                                .set(BOOKS.IMG_URL, newImgUrl)
                                .set(BOOKS.SERIES_ID, dto.getSerie().getId())
                                .set(BOOKS.MODIFIED_AT, LocalDateTime.now())
                                .where(BOOKS.ID.eq(dto.getId()))
                                .execute() > 0;
        }

        @Override
        public boolean delete(BookDTO dto) {
                images().deleteImage(dto.getImgUrl());
                return DSL().delete(BOOKS)
                                .where(BOOKS.ID.eq(dto.getId()))
                                .execute() > 0;
        }

        @Override
        public Optional<BookDTO> findById(Integer id) {
                return super.selectOne(BOOKS.ID.eq(id));
        }

        public List<BookDTO> findBySerieId(Integer serieID) {
                return super.selectMany(BOOKS.SERIES_ID.eq(serieID));
        }

        public PageDTO<SimpleBookDTO> findLatest(PaginationDTO pagination) {
                return fetchPage(this::getSimpleFromClause, DSL.noCondition(),
                                List.of(BOOKS.CREATED_AT.desc(), BOOKS.ID.desc()),
                                pagination, BookMapper::mapToSimpleDTO);
        }

        public List<BookDTO> searchByName(String query, PaginationDTO pagination) {
                String searchPattern = toSearchPattern(query);
                return super.selectMany(BOOKS.NAME.likeIgnoreCase(searchPattern), pagination,
                                BOOKS.NAME.asc(), BOOKS.ID.asc());
        }

        /**
         * Finds the books related to the given one through their issues : the books
         * containing all of its issues, the books whose issues are all in it, and the
         * books having exactly the same issues. A book without issues has no relation.
         */
        public BookRelationsDTO findRelations(Integer bookId) {
                BookRelationsDTO relations = new BookRelationsDTO();
                int total = DSL().fetchCount(BOOKS_ISSUES, BOOKS_ISSUES.BOOK_ID.eq(bookId));
                if (total == 0) {
                        return relations;
                }

                // Number of issues shared with each other book
                var self = BOOKS_ISSUES.as("self");
                var other = BOOKS_ISSUES.as("other");
                var count = DSL.count();
                Map<Integer, Integer> shared = DSL().select(other.BOOK_ID, count)
                                .from(self)
                                .join(other).on(other.ISSUE_ID.eq(self.ISSUE_ID))
                                .where(self.BOOK_ID.eq(bookId))
                                .and(other.BOOK_ID.ne(bookId))
                                .groupBy(other.BOOK_ID)
                                .fetchMap(other.BOOK_ID, count);
                if (shared.isEmpty()) {
                        return relations;
                }

                // Total number of issues of each of these books
                Map<Integer, Integer> totals = DSL().select(BOOKS_ISSUES.BOOK_ID, count)
                                .from(BOOKS_ISSUES)
                                .where(BOOKS_ISSUES.BOOK_ID.in(shared.keySet()))
                                .groupBy(BOOKS_ISSUES.BOOK_ID)
                                .fetchMap(BOOKS_ISSUES.BOOK_ID, count);

                // Sorted in Java, as the simple select is distinct
                List<SimpleBookDTO> books = new ArrayList<>(getSimpleFromClause()
                                .where(BOOKS.ID.in(shared.keySet()))
                                .fetch(BookMapper::mapToSimpleDTO));
                books.sort(Comparator
                                .comparing(SimpleBookDTO::getSerieName,
                                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                                .thenComparing(SimpleBookDTO::getNumber, Comparator.nullsLast(Integer::compare))
                                .thenComparing(SimpleBookDTO::getId));

                for (SimpleBookDTO book : books) {
                        int common = shared.get(book.getId());
                        boolean hasAllIssues = common == total; // Every issue of this book is in the other one
                        boolean isPartOf = common == totals.get(book.getId()); // Every issue of the other one is in this book
                        if (hasAllIssues && isPartOf) {
                                relations.getSameContent().add(book);
                        } else if (hasAllIssues) {
                                relations.getContainedIn().add(book);
                        } else if (isPartOf) {
                                relations.getContains().add(book);
                        }
                }
                return relations;
        }
}
