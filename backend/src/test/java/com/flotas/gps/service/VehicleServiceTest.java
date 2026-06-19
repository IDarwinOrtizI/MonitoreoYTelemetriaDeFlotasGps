package com.flotas.gps.service;

import com.flotas.gps.dto.VehicleStatusDTO;
import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.entity.Vehicle;
import com.flotas.gps.entity.VehicleStatus;
import com.flotas.gps.exception.VehicleNotFoundException;
import com.flotas.gps.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleService - Servicio de vehiculos")
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleStatusService vehicleStatusService;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;
    private GpsReading latestReading;

    @BeforeEach
    void setUp() {
        vehicle = Vehicle.builder()
                .id(1L)
                .plateNumber("ABC-123")
                .brand("Toyota")
                .model("Hilux")
                .year(2024)
                .gpsDeviceId("GPS-001")
                .status(VehicleStatus.EN_MOVIMIENTO)
                .build();

        latestReading = GpsReading.builder()
                .id(1L)
                .vehicle(vehicle)
                .latitude(-12.0)
                .longitude(-77.0)
                .speed(60.0)
                .heading(180.0)
                .altitude(150.0)
                .ignition(true)
                .recordedAt(LocalDateTime.of(2026, 6, 19, 11, 55, 0))
                .build();
    }

    // ================================================================
    // getAllVehiclesStatus
    // ================================================================

    @Nested
    @DisplayName("getAllVehiclesStatus")
    class GetAllVehiclesStatus {

        @Test
        @DisplayName("Debe retornar lista vacia cuando no hay vehiculos")
        void noHayVehiculos_DebeRetornarListaVacia() {
            when(vehicleRepository.findAll()).thenReturn(Collections.emptyList());

            List<VehicleStatusDTO> result = vehicleService.getAllVehiclesStatus();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Debe retornar DTOs con datos de la ultima lectura")
        void hayVehiculos_DebeRetornarDTOs() {
            when(vehicleRepository.findAll()).thenReturn(List.of(vehicle));
            when(vehicleStatusService.getLatestReading(1L))
                    .thenReturn(Optional.of(latestReading));
            when(vehicleStatusService.calculateStatus(1L))
                    .thenReturn(VehicleStatus.EN_MOVIMIENTO);

            List<VehicleStatusDTO> result = vehicleService.getAllVehiclesStatus();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(0).getPlateNumber()).isEqualTo("ABC-123");
            assertThat(result.get(0).getLastLatitude()).isEqualTo(-12.0);
            assertThat(result.get(0).getLastLongitude()).isEqualTo(-77.0);
            assertThat(result.get(0).getLastSpeed()).isEqualTo(60.0);
            assertThat(result.get(0).getStatus()).isEqualTo("EN_MOVIMIENTO");
        }

        @Test
        @DisplayName("Debe retornar campos null cuando no hay lecturas GPS")
        void noHayLecturas_DebeRetornarCamposNull() {
            when(vehicleRepository.findAll()).thenReturn(List.of(vehicle));
            when(vehicleStatusService.getLatestReading(1L))
                    .thenReturn(Optional.empty());
            when(vehicleStatusService.calculateStatus(1L))
                    .thenReturn(VehicleStatus.SIN_SENAL);

            List<VehicleStatusDTO> result = vehicleService.getAllVehiclesStatus();

            assertThat(result.get(0).getLastLatitude()).isNull();
            assertThat(result.get(0).getLastLongitude()).isNull();
            assertThat(result.get(0).getLastSpeed()).isNull();
            assertThat(result.get(0).getStatus()).isEqualTo("SIN_SENAL");
        }
    }

    // ================================================================
    // getVehicleById
    // ================================================================

    @Nested
    @DisplayName("getVehicleById")
    class GetVehicleById {

        @Test
        @DisplayName("Debe retornar el DTO cuando el vehiculo existe")
        void vehiculoExiste_DebeRetornarDTO() {
            when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
            when(vehicleStatusService.getLatestReading(1L))
                    .thenReturn(Optional.of(latestReading));
            when(vehicleStatusService.calculateStatus(1L))
                    .thenReturn(VehicleStatus.EN_MOVIMIENTO);

            VehicleStatusDTO result = vehicleService.getVehicleById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getPlateNumber()).isEqualTo("ABC-123");
        }

        @Test
        @DisplayName("Debe lanzar VehicleNotFoundException cuando el vehiculo no existe")
        void vehiculoNoExiste_DebeLanzarExcepcion() {
            when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vehicleService.getVehicleById(99L))
                    .isInstanceOf(VehicleNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    // ================================================================
    // deleteVehicle
    // ================================================================

    @Nested
    @DisplayName("deleteVehicle")
    class DeleteVehicle {

        @Test
        @DisplayName("Debe eliminar el vehiculo cuando existe")
        void vehiculoExiste_DebeEliminar() {
            when(vehicleRepository.existsById(1L)).thenReturn(true);

            vehicleService.deleteVehicle(1L);

            verify(vehicleRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Debe lanzar VehicleNotFoundException cuando el vehiculo no existe")
        void vehiculoNoExiste_DebeLanzarExcepcion() {
            when(vehicleRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> vehicleService.deleteVehicle(99L))
                    .isInstanceOf(VehicleNotFoundException.class)
                    .hasMessageContaining("99");

            verify(vehicleRepository, never()).deleteById(anyLong());
        }
    }
}
