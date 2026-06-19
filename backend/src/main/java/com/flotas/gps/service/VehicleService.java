package com.flotas.gps.service;

import com.flotas.gps.dto.VehicleStatusDTO;
import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.entity.Vehicle;
import com.flotas.gps.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleStatusService vehicleStatusService;

    public List<VehicleStatusDTO> getAllVehiclesStatus() {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        return vehicles.stream()
                .map(this::mapToStatusDTO)
                .toList();
    }

    private VehicleStatusDTO mapToStatusDTO(Vehicle vehicle) {
        Optional<GpsReading> latestReadingOpt = vehicleStatusService
                .getLatestReading(vehicle.getId());

        Double lastLatitude = null;
        Double lastLongitude = null;
        Double lastSpeed = null;
        Double lastHeading = null;
        LocalDateTime lastRecordedAt = null;

        if (latestReadingOpt.isPresent()) {
            GpsReading reading = latestReadingOpt.get();
            lastLatitude = reading.getLatitude();
            lastLongitude = reading.getLongitude();
            lastSpeed = reading.getSpeed();
            lastHeading = reading.getHeading();
            lastRecordedAt = reading.getRecordedAt();
        }

        String status = vehicleStatusService.calculateStatus(vehicle.getId()).name();

        return VehicleStatusDTO.builder()
                .id(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .lastLatitude(lastLatitude)
                .lastLongitude(lastLongitude)
                .lastSpeed(lastSpeed)
                .lastHeading(lastHeading)
                .lastRecordedAt(lastRecordedAt)
                .status(status)
                .build();
    }
}
