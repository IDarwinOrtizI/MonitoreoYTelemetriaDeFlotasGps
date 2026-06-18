package com.flotas.gps.repository;

import com.flotas.gps.entity.Vehicle;
import com.flotas.gps.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByPlateNumber(String plateNumber);

    Optional<Vehicle> findByGpsDeviceId(String gpsDeviceId);

    List<Vehicle> findByStatus(VehicleStatus status);

    boolean existsByPlateNumber(String plateNumber);

    boolean existsByGpsDeviceId(String gpsDeviceId);
}
