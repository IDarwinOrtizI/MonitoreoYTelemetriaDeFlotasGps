package com.flotas.gps.service;

import com.flotas.gps.entity.GpsReading;
import com.flotas.gps.entity.Vehicle;
import com.flotas.gps.entity.VehicleStatus;
import com.flotas.gps.repository.GpsReadingRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleStatusService - Logica de estado del vehiculo")
class VehicleStatusServiceTest {

    @Mock
    private GpsReadingRepository gpsReadingRepository;

    @InjectMocks
    private VehicleStatusService vehicleStatusService;

    private Vehicle vehicle;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        vehicle = Vehicle.builder()
                .id(1L)
                .plateNumber("ABC-123")
                .gpsDeviceId("GPS-001")
                .build();
        now = LocalDateTime.of(2026, 6, 19, 12, 0, 0);
    }

    private GpsReading buildReading(double lat, double lng, double speed, LocalDateTime recordedAt) {
        return GpsReading.builder()
                .id(1L)
                .vehicle(vehicle)
                .latitude(lat)
                .longitude(lng)
                .speed(speed)
                .heading(0.0)
                .altitude(0.0)
                .ignition(true)
                .recordedAt(recordedAt)
                .build();
    }

    // ================================================================
    // SIN_SENAL: Sin coordenadas en mas de 120 segundos
    // ================================================================

    @Nested
    @DisplayName("SIN_SENAL - Sin lecturas o sin conexion")
    class SinSenal {

        @Test
        @DisplayName("Debe retornar SIN_SENAL cuando no hay lecturas GPS")
        void sinLecturas_DebeRetornarSinSenal() {
            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(Collections.emptyList());

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.SIN_SENAL);
        }

        @Test
        @DisplayName("Debe retornar SIN_SENAL cuando la ultima lectura tiene mas de 120 segundos")
        void ultimaLecturaMayor120Segundos_DebeRetornarSinSenal() {
            GpsReading oldReading = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(121));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(oldReading));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.SIN_SENAL);
        }

        @Test
        @DisplayName("No debe retornar SIN_SENAL cuando la ultima lectura tiene exactamente 120 segundos")
        void ultimaLecturaExactamente120Segundos_NoDebeRetornarSinSenal() {
            GpsReading reading = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(120));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(reading));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isNotEqualTo(VehicleStatus.SIN_SENAL);
        }

        @Test
        @DisplayName("Debe retornar SIN_SENAL con dos lecturas viejas (>120s)")
        void dosLecturasViejas_DebeRetornarSinSenal() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(200));
            GpsReading current = buildReading(-12.0, -77.0, 0.0, now.minusSeconds(130));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.SIN_SENAL);
        }
    }

    // ================================================================
    // EN_MOVIMIENTO: Coordenadas cambiaron
    // ================================================================

    @Nested
    @DisplayName("EN_MOVIMIENTO - Coordenadas cambiaron")
    class EnMovimiento {

        @Test
        @DisplayName("Debe retornar EN_MOVIMIENTO con una sola lectura reciente")
        void unaUnicaLectura_DebeRetornarEnMovimiento() {
            GpsReading reading = buildReading(-12.0, -77.0, 60.0, now.minusSeconds(10));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(reading));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.EN_MOVIMIENTO);
        }

        @Test
        @DisplayName("Debe retornar EN_MOVIMIENTO cuando las coordenadas cambiaron")
        void coordenadasCambiaron_DebeRetornarEnMovimiento() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(30));
            GpsReading current = buildReading(-12.001, -77.001, 60.0, now.minusSeconds(5));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.EN_MOVIMIENTO);
        }

        @Test
        @DisplayName("Debe retornar EN_MOVIMIENTO cuando solo cambio latitud")
        void soloLatitudCambio_DebeRetornarEnMovimiento() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(10));
            GpsReading current = buildReading(-12.001, -77.0, 55.0, now.minusSeconds(5));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.EN_MOVIMIENTO);
        }

        @Test
        @DisplayName("Debe retornar EN_MOVIMIENTO cuando solo cambio longitud")
        void soloLongitudCambio_DebeRetornarEnMovimiento() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(10));
            GpsReading current = buildReading(-12.0, -77.001, 55.0, now.minusSeconds(5));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.EN_MOVIMIENTO);
        }
    }

    // ================================================================
    // DETENIDO: Coordenadas iguales (sin movimiento)
    // ================================================================

    @Nested
    @DisplayName("DETENIDO - Coordenadas iguales")
    class Detenido {

        @Test
        @DisplayName("Debe retornar DETENIDO cuando coordenadas son iguales (simulador detenido)")
        void coordenadasIguales_DebeRetornarDetenido() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(10));
            GpsReading current = buildReading(-12.0, -77.0, 0.0, now.minusSeconds(5));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.DETENIDO);
        }

        @Test
        @DisplayName("Debe retornar DETENIDO cuando coordenadas iguales con tiempo corto entre lecturas")
        void coordenadasIgualesTiempoCorto_DebeRetornarDetenido() {
            GpsReading previous = buildReading(-12.0, -77.0, 30.0, now.minusSeconds(4));
            GpsReading current = buildReading(-12.0, -77.0, 0.0, now.minusSeconds(1));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.DETENIDO);
        }

        @Test
        @DisplayName("Debe retornar DETENIDO cuando coordenadas iguales con tiempo largo entre lecturas")
        void coordenadasIgualesTiempoLargo_DebeRetornarDetenido() {
            GpsReading previous = buildReading(-12.0, -77.0, 30.0, now.minusSeconds(200));
            GpsReading current = buildReading(-12.0, -77.0, 0.0, now.minusSeconds(100));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.DETENIDO);
        }

        @Test
        @DisplayName("Debe retornar DETENIDO cuando coordenadas iguales con velocidad 0")
        void coordenadasIgualesVelocidadCero_DebeRetornarDetenido() {
            GpsReading previous = buildReading(-12.0, -77.0, 60.0, now.minusSeconds(30));
            GpsReading current = buildReading(-12.0, -77.0, 0.0, now.minusSeconds(5));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.DETENIDO);
        }
    }

    // ================================================================
    // Casos borde - Coordenadas
    // ================================================================

    @Nested
    @DisplayName("Casos borde - Coordenadas")
    class CasosBordeCoordenadas {

        @Test
        @DisplayName("Debe detectar movimiento con diferencia minima de coordenadas (0.00011)")
        void diferenciaMinima_DebeDetectarMovimiento() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(30));
            GpsReading current = buildReading(-12.00011, -77.0, 50.0, now.minusSeconds(5));

            boolean changed = vehicleStatusService.hasCoordinatesChanged(current, previous);

            assertThat(changed).isTrue();
        }

        @Test
        @DisplayName("No debe detectar movimiento con diferencia menor a 0.0001")
        void diferenciaInferior_NoDebeDetectarMovimiento() {
            GpsReading previous = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(30));
            GpsReading current = buildReading(-12.00005, -77.0, 50.0, now.minusSeconds(5));

            boolean changed = vehicleStatusService.hasCoordinatesChanged(current, previous);

            assertThat(changed).isFalse();
        }

        @Test
        @DisplayName("isSameLocation debe retornar true para coordenadas identicas")
        void coordenadasIdenticas_DebeRetornarMismaUbicacion() {
            GpsReading reading1 = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(30));
            GpsReading reading2 = buildReading(-12.0, -77.0, 0.0, now.minusSeconds(5));

            boolean sameLocation = vehicleStatusService.isSameLocation(reading1, reading2);

            assertThat(sameLocation).isTrue();
        }
    }

    // ================================================================
    // Casos borde - Tiempo (limites exactos)
    // ================================================================

    @Nested
    @DisplayName("Casos borde - Limites de tiempo exactos")
    class LimitesTiempoExactos {

        @Test
        @DisplayName("121 segundos sin lectura -> SIN_SENAL")
        void exactamente121Segundos_DebeRetornarSinSenal() {
            GpsReading reading = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(121));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(reading));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.SIN_SENAL);
        }

        @Test
        @DisplayName("119 segundos sin lectura -> no SIN_SENAL")
        void exactamente119Segundos_NoDebeRetornarSinSenal() {
            GpsReading reading = buildReading(-12.0, -77.0, 50.0, now.minusSeconds(119));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(reading));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isNotEqualTo(VehicleStatus.SIN_SENAL);
        }
    }

    // ================================================================
    // Escenario real: Simulador con vehiculo detenido
    // ================================================================

    @Nested
    @DisplayName("Escenario real - Simulador")
    class EscenarioSimulador {

        @Test
        @DisplayName("Vehiculo detenido en simulador: coordenadas iguales cada 3s -> DETENIDO")
        void vehiculoDetenidoSimulador_DebeRetornarDetenido() {
            GpsReading previous = buildReading(-12.0510, -77.0400, 50.0, now.minusSeconds(4));
            GpsReading current = buildReading(-12.0510, -77.0400, 0.0, now.minusSeconds(1));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.DETENIDO);
        }

        @Test
        @DisplayName("Vehiculo movil en simulador: coordenadas diferentes cada 3s -> EN_MOVIMIENTO")
        void vehiculoMovilSimulador_DebeRetornarEnMovimiento() {
            GpsReading previous = buildReading(-12.0464, -77.0428, 60.0, now.minusSeconds(4));
            GpsReading current = buildReading(-12.0461, -77.0430, 65.0, now.minusSeconds(1));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(current, previous));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.EN_MOVIMIENTO);
        }

        @Test
        @DisplayName("Simulador detenido por 3 minutos -> SIN_SENAL")
        void simuladorDetenido3Minutos_DebeRetornarSinSenal() {
            GpsReading lastReading = buildReading(-12.0510, -77.0400, 0.0, now.minusSeconds(181));

            when(gpsReadingRepository.findLatestTwoByVehicleId(eq(1L), any()))
                    .thenReturn(List.of(lastReading));

            VehicleStatus status = vehicleStatusService.calculateStatus(1L, now);

            assertThat(status).isEqualTo(VehicleStatus.SIN_SENAL);
        }
    }

    // ================================================================
    // getLatestReading
    // ================================================================

    @Nested
    @DisplayName("getLatestReading")
    class GetLatestReading {

        @Test
        @DisplayName("Debe retornar Optional vacio cuando no hay lecturas")
        void noHayLecturas_DebeRetornarVacio() {
            when(gpsReadingRepository.findLatestByVehicleId(1L))
                    .thenReturn(Optional.empty());

            Optional<GpsReading> result = vehicleStatusService.getLatestReading(1L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Debe retornar la lectura cuando existe")
        void hayLectura_DebeRetornarla() {
            GpsReading reading = buildReading(-12.0, -77.0, 50.0, now);
            when(gpsReadingRepository.findLatestByVehicleId(1L))
                    .thenReturn(Optional.of(reading));

            Optional<GpsReading> result = vehicleStatusService.getLatestReading(1L);

            assertThat(result).isPresent();
            assertThat(result.get().getLatitude()).isEqualTo(-12.0);
        }
    }
}
