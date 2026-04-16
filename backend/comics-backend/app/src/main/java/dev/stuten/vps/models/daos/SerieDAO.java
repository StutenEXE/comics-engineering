package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
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

import dev.stuten.vps.models.dtos.SerieDTO;
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
    protected SelectWhereStep<? super Record> getDefaultSelectStatement() {
        return DSL().select(
                SERIES.asterisk(),
                USERS.asterisk(),
                // Books (1 to many)
                multiset(
                        select(BOOKS.asterisk())
                                .from(BOOKS)
                                .where(BOOKS.SERIES_ID.eq(SERIES.ID)))
                        .as("books"))
                .from(SERIES)
                .leftJoin(USERS).on(SERIES.ADDED_BY.eq(USERS.ID));
    }

    public Optional<SerieDTO> create(SerieDTO dto) {
        return DSL().insertInto(SERIES)
                .set(SERIES.NAME, dto.name())
                .set(SERIES.ONGOING, dto.ongoing())
                .set(SERIES.ONESHOT, dto.oneshot())
                .set(SERIES.NVOLUMES, dto.nvolumes())
                .set(SERIES.START_DATE, dto.startDate())
                .set(SERIES.END_DATE, dto.endDate())
                .set(SERIES.ADDED_BY, dto.addedBy().id())
                .returning(SERIES.asterisk())
                .fetchOptional(SerieMapper::mapToDTO);
    }

    public Optional<SerieDTO> findById(Integer id) {
        return super.selectOne(SERIES.ID.eq(id));
    }

    public List<SerieDTO> searchByName(String query) {
        String searchPattern = toSearchPattern(query);
        return super.selectMany(SERIES.NAME.likeIgnoreCase(searchPattern));
    }
}
