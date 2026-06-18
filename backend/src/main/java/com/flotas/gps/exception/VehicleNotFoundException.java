package com.flotas.gps.exception;

public class VehicleNotFoundException extends RuntimeException {

    public VehicleNotFoundException(String vehicleId) {
        super("Vehículo no encontrado con ID: " + vehicleId);
    }
}
