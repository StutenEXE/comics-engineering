package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;

import dev.stuten.vps.models.dtos.EditionDTO;
import dev.stuten.vps.models.mappers.EditionMapper;

public class EditionDAO extends DAO {

    public EditionDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, EditionDTO> getDefaultMapper() {
        return EditionMapper::mapToDTO;
    }

    @Override
    protected SelectWhereStep<? super Record> getDefaultSelectStatement() {
        return DSL().select(
                EDITIONS.asterisk(),
                PUBLISHERS.asterisk(),
                BOOKS.asterisk(),
                USERS.asterisk())
                .from(EDITIONS)
                .leftJoin(PUBLISHERS).on(EDITIONS.PUBLISHER_ID.eq(PUBLISHERS.ID))
                .leftJoin(BOOKS).on(EDITIONS.BOOK_ID.eq(BOOKS.ID))
                .leftJoin(USERS).on(EDITIONS.ADDED_BY.eq(USERS.ID));
    }

    public Optional<EditionDTO> create(EditionDTO dto) {
        return DSL().insertInto(EDITIONS)
                .set(EDITIONS.ISBN, dto.isbn())
                .set(EDITIONS.EAN, dto.ean())
                .set(EDITIONS.PRICE, dto.price())
                .set(EDITIONS.URL, dto.url())
                .set(EDITIONS.IMG_URL, dto.imgUrl())
                .set(EDITIONS.PARUTION_DATE, dto.parutionDate())
                .set(EDITIONS.PUBLISHER_ID, dto.publisher().id())
                .set(EDITIONS.BOOK_ID, dto.book().id())
                .set(EDITIONS.ADDED_BY, dto.addedBy().id())
                .returning(EDITIONS.asterisk())
                .fetchOptional(EditionMapper::mapToDTO);
    }

    public Optional<EditionDTO> findById(Integer id) {
        return super.selectOne(EDITIONS.ID.eq(id));
    }

}
