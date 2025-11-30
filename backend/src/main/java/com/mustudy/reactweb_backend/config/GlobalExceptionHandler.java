package com.mustudy.reactweb_backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle 404 errors for static resources (like empty paths, favicon, etc.)
     * This prevents the "No static resource" error from cluttering the logs
     */
    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<?> handleResourceNotFoundException(Exception e) {
        // Silently handle 404 errors - return empty response
        // This prevents error messages for missing static resources like favicon, empty paths, etc.
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}

