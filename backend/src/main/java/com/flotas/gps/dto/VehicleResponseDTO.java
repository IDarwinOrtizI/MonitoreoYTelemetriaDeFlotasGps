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
public class VehicleResponseDTO {

    private Long id;
    private String plateNumber;
    private String brand;
    private String model;
    private Integer year;
    private String vinNumber;
    private String gpsDeviceId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
