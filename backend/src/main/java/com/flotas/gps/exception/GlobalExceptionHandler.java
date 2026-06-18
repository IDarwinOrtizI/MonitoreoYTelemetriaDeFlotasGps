package com.flotas.gps.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============================================================
    // 400 - Validation Errors
    // ============================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationErrors(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Error de validación en los campos enviados"
        );
        problem.setTitle("Error de validación");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/validation"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of(
                        "field", fe.getField(),
                        "message", fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Valor inválido",
                        "rejectedValue", fe.getRejectedValue() != null ? fe.getRejectedValue().toString() : ""
                ))
                .toList());
        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleMalformedJson(HttpMessageNotReadableException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "El formato del JSON enviado es inválido"
        );
        problem.setTitle("JSON malformado");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/malformed-json"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleMissingParams(MissingServletRequestParameterException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                String.format("Falta el parámetro obligatorio: %s", ex.getParameterName())
        );
        problem.setTitle("Parámetro faltante");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/missing-parameter"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("parameter", ex.getParameterName());
        return problem;
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                String.format("El parámetro '%s' tiene un tipo de dato inválido", ex.getName())
        );
        problem.setTitle("Tipo de dato inválido");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/type-mismatch"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("parameter", ex.getName());
        problem.setProperty("expectedType", ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        return problem;
    }

    @ExceptionHandler(BadRequestException.class)
    public ProblemDetail handleBadRequest(BadRequestException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problem.setTitle("Solicitud inválida");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/bad-request"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // ============================================================
    // 404 - Resource Not Found
    // ============================================================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
        problem.setTitle("Recurso no encontrado");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(VehicleNotFoundException.class)
    public ProblemDetail handleVehicleNotFound(VehicleNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
        problem.setTitle("Vehículo no encontrado");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/vehicle-not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // ============================================================
    // 500 - Internal Server Error
    // ============================================================

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralErrors(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ha ocurrido un error interno del servidor"
        );
        problem.setTitle("Error interno del servidor");
        problem.setType(URI.create("https://api.gps-telemetry.com/errors/internal"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
