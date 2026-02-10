package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;

import dev.stuten.vps.models.dtos.PublisherDTO;
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
    protected SelectWhereStep<? super Record> getDefaultSelectStatement() {
        return DSL().select(
                PUBLISHERS.asterisk(),
                // Editions (1 to many)
                multiset(
                        select(EDITIONS.asterisk())
                                .from(EDITIONS)
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
