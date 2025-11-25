package com.mustudy.reactweb_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/db-food_order_system")
@CrossOrigin(origins = "http://localhost:5173")
public class DatabaseTestController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @GetMapping("/food_order_system")
    public String testConnection() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return "数据库连接成功！测试结果: " + result;
        } catch (Exception e) {
            return "数据库连接失败: " + e.getMessage();
        }
    }
    
    @GetMapping("/tables")
    public List<Map<String, Object>> getTables() {
        return jdbcTemplate.queryForList("SHOW TABLES");
    }
    
    @GetMapping("/customers")
    public List<Map<String, Object>> getCustomers() {
        return jdbcTemplate.queryForList("SELECT * FROM customer WHERE isValidate = TRUE");
    }
}