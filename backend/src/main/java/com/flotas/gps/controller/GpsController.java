package com.flotas.gps.controller;

import com.flotas.gps.dto.GPSRequestDTO;
import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.service.GpsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/gps")
@RequiredArgsConstructor
public class GpsController {

    private final GpsService gpsService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> receiveGpsCoordinates(
            @Valid @RequestBody GPSRequestDTO request) {

        GpsReading savedReading = gpsService.saveGpsReading(request);

        Map<String, Object> response = Map.of(
                "status", "success",
                "message", "Coordenada GPS guardada exitosamente",
                "readingId", savedReading.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
