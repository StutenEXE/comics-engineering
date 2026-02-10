package dev.stuten.vps.models.daos;

import java.util.List;
import java.util.Optional;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectWhereStep;

public abstract class DAO {
    private final DSLContext dsl;

    public DAO(DSLContext dsl) {
        this.dsl = dsl;
    }

    protected DSLContext DSL() {
        return dsl;
    }

    protected abstract <T> RecordMapper<? super Record, T> getDefaultMapper();

    protected abstract SelectWhereStep<? super Record> getDefaultSelectStatement();

    protected <T> Optional<T> selectOne(Condition where, RecordMapper<? super Record, T> mapper) {
        return getDefaultSelectStatement()
            .where(where)
            .fetchOptional(mapper);
    }

    protected <T> List<T> selectMany(Condition where, RecordMapper<? super Record, T> mapper) {
        return getDefaultSelectStatement()
            .where(where)
            .fetch(mapper);
    }
    
    protected <T> Optional<T> selectOne(Condition where) {
        return selectOne(where, getDefaultMapper());
    }

    protected <T> List<T> selectMany(Condition where) {
        return selectMany(where, getDefaultMapper());
    }

    protected String toSearchPattern(String query) {
        return "%" + query + "%";
    }
}
