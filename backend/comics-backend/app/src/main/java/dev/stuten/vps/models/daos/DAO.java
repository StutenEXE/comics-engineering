package dev.stuten.vps.models.daos;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;
import org.jooq.SelectLimitStep;

import dev.stuten.vps.models.dtos.request.search.PaginationDTO;

public abstract class DAO {
    private final DSLContext dsl;

    public DAO(DSLContext dsl) {
        this.dsl = dsl;
    }

    protected DSLContext DSL() {
        return dsl;
    }

    /**
     * Returns a mapper that should map to the DAO's full DTO
     * @param <T> The DTO class
     * @return A RecordMapper mapping a Record to a DTO
     */
    protected abstract <T> RecordMapper<? super Record, T> getDefaultMapper();

    /**
     * Returns the collection of select fields needed to fill a SimpleDTO for this object 
     * @return A collection of select fields
     */
    protected abstract Collection<SelectFieldOrAsterisk> getSimpleSelectFields();

    /**
     * Returns the jOOQ equivalent of the "select from join" SQL statement for the SimpleDTO variant of this object.
     * @return The jOOQ "select join from" statement 
     */
    protected abstract SelectJoinStep<? extends Record> getSimpleFromClause();

    /**
     * Returns the jOOQ equivalent of the "select from join" SQL statement for the Full DTO variant of this object 
     * @return The jOOQ "select join from" statement 
     */
    protected abstract SelectJoinStep<? extends Record> getFullFromClause();

    protected <T> Optional<T> selectOne(Condition where, RecordMapper<? super Record, T> mapper) {
        return getFullFromClause()
            .where(where)
            .fetchOptional(mapper);
    }

    protected <T> List<T> selectMany(Condition where, RecordMapper<? super Record, T> mapper) {
        return getFullFromClause()
            .where(where)
            .fetch(mapper);
    }
    
    protected <T> Optional<T> selectOne(Condition where) {
        return selectOne(where, getDefaultMapper());
    }

    protected <T> List<T> selectMany(Condition where) {
        return selectMany(where, getDefaultMapper());
    }

    /**
     * Same as selectMany, with ordering and pagination.
     * @param pagination The pagination, null to fetch every result
     * @param orderBy The ordering, should be deterministic for pagination to be stable
     */
    protected <T> List<T> selectMany(Condition where, PaginationDTO pagination, OrderField<?>... orderBy) {
        return selectPage(
            getFullFromClause()
                .where(where)
                .orderBy(orderBy),
            pagination,
            getDefaultMapper());
    }

    /**
     * Fetches one page of the given select.
     * @param pagination The pagination, null to fetch every result
     * @return The elements of the page
     */
    protected <T> List<T> selectPage(SelectLimitStep<? extends Record> select, PaginationDTO pagination,
            RecordMapper<? super Record, T> mapper) {
        if (pagination == null) {
            return select.fetch(mapper);
        }
        return select
            .offset(pagination.getFrom())
            .limit(pagination.getLimit())
            .fetch(mapper);
    }

    protected String toSearchPattern(String query) {
        return "%" + query + "%";
    }
}
