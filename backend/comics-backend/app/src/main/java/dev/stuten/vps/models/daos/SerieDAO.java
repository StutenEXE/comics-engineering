package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.models.mappers.SerieMapper;

public class SerieDAO extends DAO {

    public SerieDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, SerieDTO> getDefaultMapper() {
        return SerieMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                SERIES.ID.as(SerieMapper.getFieldName(SERIES.ID)),
                SERIES.NAME.as(SerieMapper.getFieldName(SERIES.NAME)),
                SERIES.ONGOING.as(SerieMapper.getFieldName(SERIES.ONGOING)),
                SERIES.ONESHOT.as(SerieMapper.getFieldName(SERIES.ONESHOT)),
                SERIES.NVOLUMES.as(SerieMapper.getFieldName(SERIES.NVOLUMES)),
                SERIES.START_DATE.as(SerieMapper.getFieldName(SERIES.START_DATE)),
                SERIES.END_DATE.as(SerieMapper.getFieldName(SERIES.END_DATE)),
                SERIES.ADDED_BY.as(SerieMapper.getFieldName(SERIES.ADDED_BY)),
                SERIES.CREATED_AT.as(SerieMapper.getFieldName(SERIES.CREATED_AT)),
                SERIES.MODIFIED_AT.as(SerieMapper.getFieldName(SERIES.MODIFIED_AT)));
    }

    @Override
    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(SERIES);
    }

    @Override
    protected SelectJoinStep<? extends Record> getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                .select(multiset( // Books (1 to many)
                        select(new BookDAO(this.DSL()).getSimpleSelectFields())
                                .from(BOOKS)
                                .where(BOOKS.SERIES_ID.eq(SERIES.ID)))
                        .as("books"))
                .from(SERIES)
                .leftJoin(USERS).on(SERIES.ADDED_BY.eq(USERS.ID));
    }

    public Optional<Integer> create(SerieDTO dto) {
        return DSL().insertInto(SERIES)
                .set(SERIES.NAME, dto.name())
                .set(SERIES.ONGOING, dto.ongoing())
                .set(SERIES.ONESHOT, dto.oneshot())
                .set(SERIES.NVOLUMES, dto.nvolumes())
                .set(SERIES.START_DATE, dto.startDate())
                .set(SERIES.END_DATE, dto.endDate())
                .set(SERIES.ADDED_BY, dto.addedBy().id())
                .returning(SERIES.ID)
                .fetchOptional()
                .map(record -> record.get(SERIES.ID));
    }

    public Optional<SerieDTO> findById(Integer id) {
        return super.selectOne(SERIES.ID.eq(id));
    }

    public List<SerieDTO> searchByName(String query) {
        String searchPattern = toSearchPattern(query);
        return super.selectMany(SERIES.NAME.likeIgnoreCase(searchPattern));
    }
}
