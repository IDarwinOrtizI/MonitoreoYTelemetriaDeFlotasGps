package com.flotas.gps.controller;

import com.flotas.gps.dto.VehicleStatusDTO;
import com.flotas.gps.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
