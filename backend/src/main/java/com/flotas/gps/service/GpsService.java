package com.flotas.gps.service;

import com.flotas.gps.dto.GPSRequestDTO;
import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.entity.Vehicle;
import com.flotas.gps.exception.VehicleNotFoundException;
import com.flotas.gps.repository.GpsReadingRepository;
import com.flotas.gps.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class GpsService {

    private final GpsReadingRepository gpsReadingRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public GpsReading saveGpsReading(GPSRequestDTO request) {
        Vehicle vehicle = vehicleRepository.findByGpsDeviceId(request.getVehicleId())
                .orElseThrow(() -> new VehicleNotFoundException(request.getVehicleId()));

        LocalDateTime recordedAt = OffsetDateTime.parse(request.getTimestamp()).toLocalDateTime();

        GpsReading reading = GpsReading.builder()
                .vehicle(vehicle)
                .latitude(request.getLat())
                .longitude(request.getLng())
                .speed(request.getSpeed() != null ? request.getSpeed() : 0.0)
                .heading(request.getHeading() != null ? request.getHeading() : 0.0)
                .altitude(request.getAltitude() != null ? request.getAltitude() : 0.0)
                .ignition(request.getIgnition() != null ? request.getIgnition() : false)
                .recordedAt(recordedAt)
                .build();

        return gpsReadingRepository.save(reading);
    }
}
