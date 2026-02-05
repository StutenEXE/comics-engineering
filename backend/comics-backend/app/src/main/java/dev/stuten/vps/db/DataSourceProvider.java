package dev.stuten.vps.db;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;

public class DataSourceProvider {
    private static HikariDataSource dataSource;

    public static DataSource get() {
        if (dataSource == null) {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(System.getProperty("db.url"));
            config.setUsername(System.getProperty("db.user"));
            config.setPassword(System.getProperty("db.password"));

            config.setMaximumPoolSize(
                Integer.parseInt(System.getProperty("db.pool.max", "5"))
            );
            config.setMinimumIdle(
                Integer.parseInt(System.getProperty("db.pool.min", "1"))
            );
            
            dataSource = new HikariDataSource(config);
        }
        return dataSource;
    }
}
