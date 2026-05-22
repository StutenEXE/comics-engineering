package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

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

import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimplePublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.EditionMapper;

public class EditionDAO extends ContributableDAO<EditionDTO> {

    public EditionDAO(DSLContext dsl) {
        super(dsl);
    }

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
        return DSL().selectDistinct(getSimpleSelectFields()).from(EDITIONS)
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

    @Override
    protected void replaceLocalRefs(EditionDTO proposal, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException {
        // Publisher id
        SimplePublisherDTO publisher = proposal.getPublisher();
        super.replaceLocalRef(publisher, localRefs);
        // Book id
        SimpleBookDTO book = proposal.getBook();
        super.replaceLocalRef(book, localRefs);
    }

    @Override
    protected void insertUser(EditionDTO proposal, SimpleUserDTO user) {
        proposal.setAddedBy(user);
    }

    @Override
    public Optional<Integer> create(EditionDTO dto) {
        return DSL().insertInto(EDITIONS)
                .set(EDITIONS.ISBN, dto.getIsbn())
                .set(EDITIONS.EAN, dto.getEan())
                .set(EDITIONS.NPAGES, dto.getNpages())
                .set(EDITIONS.PRICE, dto.getPrice())
                .set(EDITIONS.URL, dto.getUrl())
                .set(EDITIONS.IMG_URL, dto.getImgUrl())
                .set(EDITIONS.COVER_TYPE, dto.getCoverType())
                .set(EDITIONS.PARUTION_DATE, dto.getParutionDate())
                .set(EDITIONS.PUBLISHER_ID, dto.getPublisher().getId())
                .set(EDITIONS.BOOK_ID, dto.getBook().getId())
                .set(EDITIONS.ADDED_BY, dto.getAddedBy().getId())
                .returning(EDITIONS.ID)
                .fetchOptional()
                .map(record -> record.get(EDITIONS.ID));
    }

    @Override
    public boolean update(EditionDTO dto) {
        return DSL().update(EDITIONS)
                .set(EDITIONS.ISBN, dto.getIsbn())
                .set(EDITIONS.EAN, dto.getEan())
                .set(EDITIONS.NPAGES, dto.getNpages())
                .set(EDITIONS.PRICE, dto.getPrice())
                .set(EDITIONS.URL, dto.getUrl())
                .set(EDITIONS.IMG_URL, dto.getImgUrl())
                .set(EDITIONS.COVER_TYPE, dto.getCoverType())
                .set(EDITIONS.PARUTION_DATE, dto.getParutionDate())
                .set(EDITIONS.PUBLISHER_ID, dto.getPublisher().getId())
                .set(EDITIONS.BOOK_ID, dto.getBook().getId())
                .set(EDITIONS.MODIFIED_AT, LocalDateTime.now())
                .where(EDITIONS.ID.eq(dto.getId()))
                .execute() > 0;
    }

    @Override
    public boolean delete(EditionDTO dto) {
        return DSL().delete(EDITIONS)
                .where(EDITIONS.ID.eq(dto.getId()))
                .execute() > 0;
    }

    @Override
    public Optional<EditionDTO> findById(Integer id) {
        return super.selectOne(EDITIONS.ID.eq(id));
    }

}
