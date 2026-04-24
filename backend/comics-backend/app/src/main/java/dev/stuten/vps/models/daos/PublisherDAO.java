package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
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

import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.PublisherMapper;

public class PublisherDAO extends ContributableDAO<PublisherDTO> {

    public PublisherDAO(DSLContext dsl) {
        super(dsl);
    }

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

    @Override
    protected void replaceLocalRefs(PublisherDTO proposal, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException {
    }

    @Override
    protected void insertUser(PublisherDTO proposal, SimpleUserDTO user) { }

    @Override
    public Optional<Integer> create(PublisherDTO dto) {
        return DSL().insertInto(PUBLISHERS)
                .set(PUBLISHERS.NAME, dto.getName())
                .returning(PUBLISHERS.ID)
                .fetchOptional()
                .map(record -> record.get(PUBLISHERS.ID));
    }

    @Override
    public boolean update(PublisherDTO dto) {
        return DSL().update(PUBLISHERS)
                .set(PUBLISHERS.NAME, dto.getName())
                .set(PUBLISHERS.MODIFIED_AT, LocalDateTime.now())
                .where(PUBLISHERS.ID.eq(dto.getId()))
                .execute() > 0;
    }

    @Override
    public boolean delete(PublisherDTO dto) {
        return DSL().delete(PUBLISHERS)
                .where(PUBLISHERS.ID.eq(dto.getId()))
                .execute() > 0;
    }

    @Override
    public Optional<PublisherDTO> findById(Integer id) {
        return super.selectOne(PUBLISHERS.ID.eq(id));
    }
}
