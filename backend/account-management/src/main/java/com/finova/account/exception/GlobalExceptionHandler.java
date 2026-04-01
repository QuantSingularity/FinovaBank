package com.finova.account.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
    log.error("Runtime exception: {}", ex.getMessage(), ex);
    return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
    log.warn("Illegal argument: {}", ex.getMessage());
    return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
    Map<String, String> fieldErrors = new HashMap<>();
    ex.getBindingResult().getAllErrors().forEach(error -> {
      String fieldName = ((FieldError) error).getField();
      String message = error.getDefaultMessage();
      fieldErrors.put(fieldName, message);
    });
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now().toString());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Validation Failed");
    body.put("fieldErrors", fieldErrors);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now().toString());
    body.put("status", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("message", message);
    return ResponseEntity.status(status).body(body);
  }
}
