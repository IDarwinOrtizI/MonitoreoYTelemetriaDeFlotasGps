package com.flotas.gps.repository;

import com.flotas.gps.entity.GpsReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GpsReadingRepository extends JpaRepository<GpsReading, Long> {

    List<GpsReading> findByVehicleIdOrderByRecordedAtDesc(Long vehicleId);

    @Query("SELECT gr FROM GpsReading gr WHERE gr.vehicle.id = :vehicleId " +
           "AND gr.recordedAt = (SELECT MAX(gr2.recordedAt) FROM GpsReading gr2 " +
           "WHERE gr2.vehicle.id = :vehicleId)")
    Optional<GpsReading> findLatestByVehicleId(@Param("vehicleId") Long vehicleId);

    List<GpsReading> findByVehicleIdAndRecordedAtBetweenOrderByRecordedAtAsc(
            Long vehicleId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT gr FROM GpsReading gr WHERE gr.vehicle.gpsDeviceId = :deviceId " +
           "AND gr.recordedAt = (SELECT MAX(gr2.recordedAt) FROM GpsReading gr2 " +
           "WHERE gr2.vehicle.gpsDeviceId = :deviceId)")
    Optional<GpsReading> findLatestByDeviceId(@Param("deviceId") String deviceId);

    @Query("SELECT gr FROM GpsReading gr WHERE gr.vehicle.id = :vehicleId " +
           "AND gr.recordedAt >= :since ORDER BY gr.recordedAt ASC")
    List<GpsReading> findHistorySince(@Param("vehicleId") Long vehicleId,
                                      @Param("since") LocalDateTime since);
}
