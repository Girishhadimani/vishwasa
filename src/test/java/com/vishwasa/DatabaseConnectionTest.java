package com.vishwasa;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.sql.Connection;
import java.sql.DriverManager;

@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
class DatabaseConnectionTest {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Test
    void testDatabaseConnection() {
        try {
            Connection connection = DriverManager.getConnection(url, username, password);
            if (connection != null) {
                System.out.println("✅ Supabase Cloud PostgreSQL Database Connection Successful!");
                System.out.println("Connected to: " + connection.getMetaData().getDatabaseProductName() + " v" + connection.getMetaData().getDatabaseProductVersion());
                connection.close();
            } else {
                System.out.println("❌ Failed to connect to database");
            }
        } catch (Exception e) {
            System.out.println("❌ Database connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
