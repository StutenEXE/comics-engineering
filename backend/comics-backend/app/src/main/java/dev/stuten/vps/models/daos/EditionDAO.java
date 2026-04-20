package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.mappers.EditionMapper;

public class EditionDAO extends DAO {

    public EditionDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, ?> getDefaultMapper() {
        return EditionMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                EDITIONS.ID.as(EditionMapper.getFieldName(EDITIONS.ID)),
                EDITIONS.ISBN.as(EditionMapper.getFieldName(EDITIONS.ISBN)),
                EDITIONS.EAN.as(EditionMapper.getFieldName(EDITIONS.EAN)),
                EDITIONS.NPAGES.as(EditionMapper.getFieldName(EDITIONS.NPAGES)),
                EDITIONS.PRICE.as(EditionMapper.getFieldName(EDITIONS.PRICE)),
                EDITIONS.URL.as(EditionMapper.getFieldName(EDITIONS.URL)),
                EDITIONS.IMG_URL.as(EditionMapper.getFieldName(EDITIONS.IMG_URL)),
                EDITIONS.COVER_TYPE.as(EditionMapper.getFieldName(EDITIONS.COVER_TYPE)),
                EDITIONS.PARUTION_DATE.as(EditionMapper.getFieldName(EDITIONS.PARUTION_DATE)),
                EDITIONS.PUBLISHER_ID.as(EditionMapper.getFieldName(EDITIONS.PUBLISHER_ID)),
                PUBLISHERS.NAME.as(EditionMapper.getFieldName(PUBLISHERS.NAME)),
                EDITIONS.BOOK_ID.as(EditionMapper.getFieldName(EDITIONS.BOOK_ID)),
                EDITIONS.ADDED_BY.as(EditionMapper.getFieldName(EDITIONS.ADDED_BY)),
                EDITIONS.CREATED_AT.as(EditionMapper.getFieldName(EDITIONS.CREATED_AT)),
                EDITIONS.MODIFIED_AT.as(EditionMapper.getFieldName(EDITIONS.MODIFIED_AT)));
    }

    @Override
    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(EDITIONS)
            .leftJoin(PUBLISHERS).on(EDITIONS.PUBLISHER_ID.eq(PUBLISHERS.ID));
    }

    @Override
    protected SelectJoinStep<? extends Record> getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .select(new PublisherDAO(this.DSL()).getSimpleSelectFields())
                .select(new BookDAO(this.DSL()).getSimpleSelectFields())
                .select(new SerieDAO(this.DSL()).getSimpleSelectFields())
                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                .from(EDITIONS)
                .leftJoin(PUBLISHERS).on(EDITIONS.PUBLISHER_ID.eq(PUBLISHERS.ID))
                .leftJoin(BOOKS).on(EDITIONS.BOOK_ID.eq(BOOKS.ID))
                .leftJoin(SERIES).on(BOOKS.SERIES_ID.eq(SERIES.ID))
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
