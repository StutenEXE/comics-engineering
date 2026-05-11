package dev.stuten.vps.db;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;

public class DatabaseConfig {

    private DatabaseConfig() {}

    public static DataSource createDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(System.getenv("PG_URL"));
        config.setUsername(System.getenv("PG_USER"));
        config.setPassword(System.getenv("PG_PASSWORD"));

        config.setMaximumPoolSize(
            Integer.parseInt(System.getProperty("db.pool.max", "5"))
        );
        config.setMinimumIdle(
            Integer.parseInt(System.getProperty("db.pool.min", "1"))
        );
            
        return new HikariDataSource(config);
    }
}
