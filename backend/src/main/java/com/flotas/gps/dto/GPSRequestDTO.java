package com.flotas.gps.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GPSRequestDTO {

    @NotBlank(message = "vehicle_id es obligatorio")
    private String vehicleId;

    @NotNull(message = "lat es obligatorio")
    @Min(value = -90, message = "lat debe estar entre -90 y 90")
    @Max(value = 90, message = "lat debe estar entre -90 y 90")
    private Double lat;

    @NotNull(message = "lng es obligatorio")
    @Min(value = -180, message = "lng debe estar entre -180 y 180")
    @Max(value = 180, message = "lng debe estar entre -180 y 180")
    private Double lng;

    @NotNull(message = "timestamp es obligatorio")
    @Pattern(
        regexp = "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,9})?(Z|[+-][0-9]{2}:[0-9]{2})$",
        message = "timestamp debe ser una fecha ISO 8601 válida con zona horaria (ej: 2024-01-15T10:30:00.000Z o 2024-01-15T10:30:00+00:00)"
    )
    private String timestamp;

    @DecimalMin(value = "0.0", message = "speed debe estar entre 0.0 y 500.0")
    @DecimalMax(value = "500.0", message = "speed debe estar entre 0.0 y 500.0")
    private Double speed;

    @DecimalMin(value = "0.0", message = "heading debe estar entre 0.0 y 360.0")
    @DecimalMax(value = "360.0", message = "heading debe estar entre 0.0 y 360.0")
    private Double heading;

    @DecimalMin(value = "-500.0", message = "altitude debe estar entre -500.0 y 9000.0")
    @DecimalMax(value = "9000.0", message = "altitude debe estar entre -500.0 y 9000.0")
    private Double altitude;

    private Boolean ignition;
}
