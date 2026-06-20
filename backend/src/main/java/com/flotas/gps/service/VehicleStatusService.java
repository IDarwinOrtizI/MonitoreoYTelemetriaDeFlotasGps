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

    private static final long NO_SIGNAL_THRESHOLD_SECONDS = 120;

    private static final double MIN_COORDINATE_DIFFERENCE = 0.0001;

    private final GpsReadingRepository gpsReadingRepository;

    /**
     * Calcula el estado del vehiculo en tiempo real basado en:
     *   1. SIN_SENAL  → No se reciben coordenadas en mas de 120 segundos
     *   2. EN_MOVIMIENTO → Las coordenadas cambiaron respecto a la lectura anterior
     *   3. DETENIDO   → Las coordenadas son iguales (sin movimiento)
     */
    public VehicleStatus calculateStatus(Long vehicleId, LocalDateTime currentTime) {
        List<GpsReading> latestReadings = gpsReadingRepository
                .findLatestTwoByVehicleId(vehicleId, PageRequest.of(0, 2));

        if (latestReadings.isEmpty()) {
            log.debug("[{}] SIN_SENAL - No hay lecturas GPS", vehicleId);
            return VehicleStatus.SIN_SENAL;
        }

        GpsReading latestReading = latestReadings.get(0);
        long secondsSinceLastUpdate = ChronoUnit.SECONDS.between(
                latestReading.getRecordedAt(), currentTime);

        // 1. SIN_SENAL: Sin coordenadas en mas de 120 segundos
        if (secondsSinceLastUpdate > NO_SIGNAL_THRESHOLD_SECONDS) {
            log.info("[{}] SIN_SENAL - Ultima lectura hace {}s (limite: 120s)",
                    vehicleId, secondsSinceLastUpdate);
            return VehicleStatus.SIN_SENAL;
        }

        // Si solo hay una lectura, no se puede comparar → EN_MOVIMIENTO
        if (latestReadings.size() < 2) {
            log.debug("[{}] EN_MOVIMIENTO - Solo una lectura disponible", vehicleId);
            return VehicleStatus.EN_MOVIMIENTO;
        }

        GpsReading previousReading = latestReadings.get(1);

        // 2. EN_MOVIMIENTO: Las coordenadas cambiaron
        if (hasCoordinatesChanged(latestReading, previousReading)) {
            log.debug("[{}] EN_MOVIMIENTO - Coordenadas cambiaron: [{}, {}] -> [{}, {}]",
                    vehicleId,
                    previousReading.getLatitude(), previousReading.getLongitude(),
                    latestReading.getLatitude(), latestReading.getLongitude());
            return VehicleStatus.EN_MOVIMIENTO;
        }

        // 3. DETENIDO: Las coordenadas son iguales
        long secondsBetweenReadings = ChronoUnit.SECONDS.between(
                previousReading.getRecordedAt(), latestReading.getRecordedAt());
        log.debug("[{}] DETENIDO - Misma ubicacion, {}s entre lecturas, {}s desde ultima actualizacion",
                vehicleId, secondsBetweenReadings, secondsSinceLastUpdate);
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
