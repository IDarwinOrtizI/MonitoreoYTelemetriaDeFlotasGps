package com.flotas.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleStatusDTO {

    private Long id;
    private String plateNumber;
    private Double lastLatitude;
    private Double lastLongitude;
    private Double lastSpeed;
    private Double lastHeading;
    private LocalDateTime lastRecordedAt;
    private String status;
}
