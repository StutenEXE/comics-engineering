package dev.stuten.vps.db;

import javax.sql.DataSource;

import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

public class JooqProvider {
    private static DSLContext dsl;

    private JooqProvider() {}

    public static DSLContext get() {
        if (dsl == null) {
            DataSource ds = DatabaseConfig.createDataSource();
            dsl = DSL.using(ds, SQLDialect.POSTGRES);
        }
        return dsl;
    }
}