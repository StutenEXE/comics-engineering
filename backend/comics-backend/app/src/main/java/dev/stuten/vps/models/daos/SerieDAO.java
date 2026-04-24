package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;

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

import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.SerieMapper;

public class SerieDAO extends ContributableDAO<SerieDTO> {

    public SerieDAO(DSLContext dsl) {
        super(dsl);
    }

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

    @Override
    protected void replaceLocalRefs(SerieDTO proposal, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException {
    }

    @Override
    protected void insertUser(SerieDTO proposal, SimpleUserDTO user) {
        proposal.setAddedBy(user);
    }

    @Override
    public Optional<Integer> create(SerieDTO dto) {
        return DSL().insertInto(SERIES)
                .set(SERIES.NAME, dto.getName())
                .set(SERIES.ONGOING, dto.getOngoing())
                .set(SERIES.ONESHOT, dto.getOneshot())
                .set(SERIES.NVOLUMES, dto.getNvolumes())
                .set(SERIES.START_DATE, dto.getStartDate())
                .set(SERIES.END_DATE, dto.getEndDate())
                .set(SERIES.ADDED_BY, dto.getAddedBy().getId())
                .returning(SERIES.ID)
                .fetchOptional()
                .map(record -> record.get(SERIES.ID));
    }

    @Override
    public boolean update(SerieDTO dto) {
        return DSL().update(SERIES)
                .set(SERIES.NAME, dto.getName())
                .set(SERIES.ONGOING, dto.getOngoing())
                .set(SERIES.ONESHOT, dto.getOneshot())
                .set(SERIES.NVOLUMES, dto.getNvolumes())
                .set(SERIES.START_DATE, dto.getStartDate())
                .set(SERIES.END_DATE, dto.getEndDate())
                .set(SERIES.MODIFIED_AT, LocalDateTime.now())
                .where(SERIES.ID.eq(dto.getId()))
                .execute() > 0;
    }

    @Override
    public boolean delete(SerieDTO dto) {
        return DSL().delete(SERIES)
                .where(SERIES.ID.eq(dto.getId()))
                .execute() > 0;
    }

    @Override
    public Optional<SerieDTO> findById(Integer id) {
        return super.selectOne(SERIES.ID.eq(id));
    }

    public List<SerieDTO> searchByName(String query) {
        String searchPattern = toSearchPattern(query);
        return super.selectMany(SERIES.NAME.likeIgnoreCase(searchPattern));
    }
}
