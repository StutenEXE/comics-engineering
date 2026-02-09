package dev.stuten.vps.models.daos;

import org.jooq.DSLContext;

public abstract class DAO {
    private final DSLContext dsl;

    public DAO(DSLContext dsl) {
        this.dsl = dsl;
    }

    protected DSLContext DSL() {
        return dsl;
    }

}
