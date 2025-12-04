package com.mustudy.reactweb_backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")

public class ApiController {
    private static List<User> userList = new ArrayList<>();
    private static AtomicLong idCounter = new AtomicLong(1);

    // static {
    //     userList.add(new User(idCounter.getAndIncrement(), "Alice", "alice@example.com"));
    //     userList.add(new User(idCounter.getAndIncrement(), "Bob", "bob@example.com"));
    // }

    @GetMapping("/health")
    public String healthCheck() {
        return "Backend is running! Time: " + java.time.LocalDateTime.now();
    }

    @GetMapping("/hello/{name}")
    public String hello(@PathVariable String name) {
        return "Hello " + name + " from Spring Boot!";
    }

    @PostMapping("/user")
    public User createUser(@RequestBody User user) {
        Long newId = idCounter.getAndIncrement();
        user.setId(newId);
        userList.add(user);
        System.out.println("Add new user: " + user.getName() + ", current user count: " + userList.size());
        return user;
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        System.out.println("User count: " + userList.size());
        return userList;
    }
}

class User {
    private Long id;
    private String name;
    private String email;

    public User() {
    }

    public User(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}