package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static org.jooq.impl.DSL.multiset;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.models.mappers.PublisherMapper;

public class PublisherDAO extends DAO {

    public PublisherDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, PublisherDTO> getDefaultMapper() {
        return PublisherMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                PUBLISHERS.ID.as(PublisherMapper.getFieldName(PUBLISHERS.ID)),
                PUBLISHERS.NAME.as(PublisherMapper.getFieldName(PUBLISHERS.NAME)),
                PUBLISHERS.CREATED_AT.as(PublisherMapper.getFieldName(PUBLISHERS.CREATED_AT)),
                PUBLISHERS.MODIFIED_AT.as(PublisherMapper.getFieldName(PUBLISHERS.MODIFIED_AT)));
    }

    @Override
    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(PUBLISHERS);
    }

    @Override
    protected SelectJoinStep<? extends Record> getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .select(multiset( // Editions (1 to many)
                        new EditionDAO(this.DSL())
                                .getSimpleFromClause()
                                .where(EDITIONS.PUBLISHER_ID.eq(PUBLISHERS.ID)))
                        .as("editions"))
                .from(PUBLISHERS);
    }

    public Optional<PublisherDTO> create(PublisherDTO dto) {
        return DSL().insertInto(PUBLISHERS)
                .set(PUBLISHERS.NAME, dto.name())
                .returning(EDITIONS.asterisk())
                .fetchOptional(PublisherMapper::mapToDTO);
    }

    public Optional<PublisherDTO> findById(Integer id) {
        return super.selectOne(PUBLISHERS.ID.eq(id));
    }

}
