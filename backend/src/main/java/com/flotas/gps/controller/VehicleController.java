package com.flotas.gps.controller;

import com.flotas.gps.dto.VehicleStatusDTO;
import com.flotas.gps.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleStatusDTO>> getAllVehicles() {
        List<VehicleStatusDTO> vehicles = vehicleService.getAllVehiclesStatus();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleStatusDTO> getVehicleById(@PathVariable Long id) {
        VehicleStatusDTO vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Vehiculo eliminado exitosamente"
        ));
    }
}
