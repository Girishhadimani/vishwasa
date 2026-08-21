package com.vishwasa;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.sql.Connection;
import java.sql.DriverManager;

@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
class DatabaseConnectionTest {

    @Test
    void testDatabaseConnection() {
        String url = "jdbc:postgresql://localhost:5432/vishwasa";
        String username = "postgres"; // Update with your credentials
        String password = "Girish@9701"; // Update with your credentials

        try {
            Connection connection = DriverManager.getConnection(url, username, password);
            if (connection != null) {
                System.out.println("✅ Database connection successful!");
                System.out.println("Connected to: " + connection.getMetaData().getDatabaseProductName());
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
