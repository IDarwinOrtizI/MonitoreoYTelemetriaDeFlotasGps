package com.flotas.gps.service;

import com.flotas.gps.dto.GPSRequestDTO;
import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.entity.Vehicle;
import com.flotas.gps.entity.VehicleStatus;
import com.flotas.gps.exception.VehicleNotFoundException;
import com.flotas.gps.repository.GpsReadingRepository;
import com.flotas.gps.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GpsService - Recepcion de coordenadas GPS")
class GpsServiceTest {

    @Mock
    private GpsReadingRepository gpsReadingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleStatusService vehicleStatusService;

    @InjectMocks
    private GpsService gpsService;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicle = Vehicle.builder()
                .id(1L)
                .plateNumber("ABC-123")
                .gpsDeviceId("GPS-001")
                .status(VehicleStatus.EN_MOVIMIENTO)
                .build();
    }

    private GPSRequestDTO buildRequest() {
        return GPSRequestDTO.builder()
                .vehicleId("GPS-001")
                .lat(-12.0)
                .lng(-77.0)
                .timestamp("2026-06-19T12:00:00Z")
                .speed(60.0)
                .heading(180.0)
                .altitude(150.0)
                .ignition(true)
                .build();
    }

    // ================================================================
    // saveGpsReading - exito
    // ================================================================

    @Nested
    @DisplayName("saveGpsReading - Casos exitosos")
    class SaveGpsReadingExito {

        @Test
        @DisplayName("Debe guardar la lectura GPS y retornarla")
        void debeGuardarLectura() {
            GPSRequestDTO request = buildRequest();
            when(vehicleRepository.findByGpsDeviceId("GPS-001"))
                    .thenReturn(Optional.of(vehicle));
            when(gpsReadingRepository.save(any(GpsReading.class)))
                    .thenAnswer(inv -> {
                        GpsReading reading = inv.getArgument(0);
                        reading.setId(1L);
                        return reading;
                    });
            when(vehicleStatusService.calculateStatus(eq(1L), any(java.time.LocalDateTime.class)))
                    .thenReturn(VehicleStatus.EN_MOVIMIENTO);

            GpsReading result = gpsService.saveGpsReading(request);

            assertThat(result).isNotNull();
            assertThat(result.getLatitude()).isEqualTo(-12.0);
            assertThat(result.getLongitude()).isEqualTo(-77.0);
            assertThat(result.getSpeed()).isEqualTo(60.0);
            verify(vehicleRepository).save(vehicle);
        }

        @Test
        @DisplayName("Debe usar valores por defecto cuando speed, heading, altitude son null")
        void valoresNull_DebeUsarDefaults() {
            GPSRequestDTO request = GPSRequestDTO.builder()
                    .vehicleId("GPS-001")
                    .lat(-12.0)
                    .lng(-77.0)
                    .timestamp("2026-06-19T12:00:00Z")
                    .build();

            when(vehicleRepository.findByGpsDeviceId("GPS-001"))
                    .thenReturn(Optional.of(vehicle));
            when(gpsReadingRepository.save(any(GpsReading.class)))
                    .thenAnswer(inv -> inv.getArgument(0));
            when(vehicleStatusService.calculateStatus(eq(1L), any(java.time.LocalDateTime.class)))
                    .thenReturn(VehicleStatus.EN_MOVIMIENTO);

            GpsReading result = gpsService.saveGpsReading(request);

            assertThat(result.getSpeed()).isEqualTo(0.0);
            assertThat(result.getHeading()).isEqualTo(0.0);
            assertThat(result.getAltitude()).isEqualTo(0.0);
            assertThat(result.getIgnition()).isFalse();
        }

        @Test
        @DisplayName("Debe actualizar el estado del vehiculo despues de guardar")
        void debeActualizarEstadoVehiculo() {
            GPSRequestDTO request = buildRequest();
            when(vehicleRepository.findByGpsDeviceId("GPS-001"))
                    .thenReturn(Optional.of(vehicle));
            when(gpsReadingRepository.save(any(GpsReading.class)))
                    .thenAnswer(inv -> inv.getArgument(0));
            when(vehicleStatusService.calculateStatus(eq(1L), any(java.time.LocalDateTime.class)))
                    .thenReturn(VehicleStatus.DETENIDO);

            gpsService.saveGpsReading(request);

            assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.DETENIDO);
            verify(vehicleRepository).save(vehicle);
        }
    }

    // ================================================================
    // saveGpsReading - error
    // ================================================================

    @Nested
    @DisplayName("saveGpsReading - Casos de error")
    class SaveGpsReadingError {

        @Test
        @DisplayName("Debe lanzar VehicleNotFoundException cuando el dispositivo no existe")
        void dispositivoNoExiste_DebeLanzarExcepcion() {
            GPSRequestDTO request = buildRequest();
            when(vehicleRepository.findByGpsDeviceId("GPS-001"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> gpsService.saveGpsReading(request))
                    .isInstanceOf(VehicleNotFoundException.class)
                    .hasMessageContaining("GPS-001");

            verify(gpsReadingRepository, never()).save(any());
            verify(vehicleRepository, never()).save(any());
        }
    }
}
