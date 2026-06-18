package com.flotas.gps.dto;

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
        regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:?\\d{2})?$",
        message = "timestamp debe ser una fecha ISO 8601 válida (ej: 2024-01-15T10:30:00Z)"
    )
    private String timestamp;

    private Double speed;

    private Double heading;

    private Double altitude;

    private Boolean ignition;
}
