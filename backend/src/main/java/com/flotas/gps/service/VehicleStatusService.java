package com.flotas.gps.service;

import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.entity.VehicleStatus;
import com.flotas.gps.repository.GpsReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleStatusService {

    private static final long MOVING_THRESHOLD_SECONDS = 60;
    private static final long STOPPED_THRESHOLD_SECONDS = 60;
    private static final long NO_SIGNAL_THRESHOLD_SECONDS = 120;

    private static final double MIN_COORDINATE_DIFFERENCE = 0.0001;

    private final GpsReadingRepository gpsReadingRepository;

    public VehicleStatus calculateStatus(Long vehicleId, LocalDateTime currentTime) {
        List<GpsReading> latestReadings = gpsReadingRepository
                .findLatestTwoByVehicleId(vehicleId, PageRequest.of(0, 2));

        if (latestReadings.isEmpty()) {
            log.debug("No hay lecturas GPS para vehículo {}", vehicleId);
            return VehicleStatus.SIN_SENAL;
        }

        GpsReading latestReading = latestReadings.get(0);
        long secondsSinceLastUpdate = ChronoUnit.SECONDS.between(
                latestReading.getRecordedAt(), currentTime);

        if (secondsSinceLastUpdate > NO_SIGNAL_THRESHOLD_SECONDS) {
            log.debug("Vehículo {} sin señal por {} segundos",
                    vehicleId, secondsSinceLastUpdate);
            return VehicleStatus.SIN_SENAL;
        }

        if (latestReadings.size() < 2) {
            log.debug("Vehículo {} con solo una lectura, estado: EN_MOVIMIENTO", vehicleId);
            return VehicleStatus.EN_MOVIMIENTO;
        }

        GpsReading previousReading = latestReadings.get(1);
        long secondsBetweenReadings = ChronoUnit.SECONDS.between(
                previousReading.getRecordedAt(), latestReading.getRecordedAt());

        if (secondsBetweenReadings > STOPPED_THRESHOLD_SECONDS) {
            boolean sameLocation = isSameLocation(latestReading, previousReading);
            if (sameLocation) {
                log.debug("Vehículo {} detenido en misma ubicación por {} segundos",
                        vehicleId, secondsBetweenReadings);
                return VehicleStatus.DETENIDO;
            }
        }

        boolean hasMoved = hasCoordinatesChanged(latestReading, previousReading);
        if (hasMoved) {
            log.debug("Vehículo {} en movimiento, coordenadas cambiaron", vehicleId);
            return VehicleStatus.EN_MOVIMIENTO;
        }

        if (secondsSinceLastUpdate <= MOVING_THRESHOLD_SECONDS) {
            return VehicleStatus.EN_MOVIMIENTO;
        }

        return VehicleStatus.DETENIDO;
    }

    public VehicleStatus calculateStatusByDeviceId(String deviceId, LocalDateTime currentTime) {
        Optional<GpsReading> latestReadingOpt = gpsReadingRepository.findLatestByDeviceId(deviceId);

        if (latestReadingOpt.isEmpty()) {
            return VehicleStatus.SIN_SENAL;
        }

        GpsReading latestReading = latestReadingOpt.get();
        Long vehicleId = latestReading.getVehicle().getId();
        return calculateStatus(vehicleId, currentTime);
    }

    public VehicleStatus calculateStatus(Long vehicleId) {
        return calculateStatus(vehicleId, LocalDateTime.now());
    }

    public Optional<GpsReading> getLatestReading(Long vehicleId) {
        return gpsReadingRepository.findLatestByVehicleId(vehicleId);
    }

    boolean hasCoordinatesChanged(GpsReading current, GpsReading previous) {
        double latDiff = Math.abs(current.getLatitude() - previous.getLatitude());
        double lngDiff = Math.abs(current.getLongitude() - previous.getLongitude());
        return latDiff > MIN_COORDINATE_DIFFERENCE || lngDiff > MIN_COORDINATE_DIFFERENCE;
    }

    boolean isSameLocation(GpsReading current, GpsReading previous) {
        return !hasCoordinatesChanged(current, previous);
    }
}
