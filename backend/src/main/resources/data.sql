-- Idempotente: solo inserta si no existe
-- status usa valores del ENUM: EN_MOVIMIENTO | DETENIDO | SIN_SENAL
INSERT INTO vehicles (brand, model, year, plate_number, vin_number, gps_device_id, status, created_at, updated_at)
SELECT * FROM (SELECT 'Toyota' AS brand, 'Hilux' AS model, 2023 AS year, 'ABC-001' AS plate_number, 'VIN001' AS vin_number, 'GPS-001' AS gps_device_id, 'DETENIDO' AS status, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE gps_device_id = 'GPS-001');

INSERT INTO vehicles (brand, model, year, plate_number, vin_number, gps_device_id, status, created_at, updated_at)
SELECT * FROM (SELECT 'Ford' AS brand, 'Ranger' AS model, 2024 AS year, 'ABC-002' AS plate_number, 'VIN002' AS vin_number, 'GPS-002' AS gps_device_id, 'DETENIDO' AS status, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE gps_device_id = 'GPS-002');

INSERT INTO vehicles (brand, model, year, plate_number, vin_number, gps_device_id, status, created_at, updated_at)
SELECT * FROM (SELECT 'Chevrolet' AS brand, 'S10' AS model, 2022 AS year, 'ABC-003' AS plate_number, 'VIN003' AS vin_number, 'GPS-003' AS gps_device_id, 'DETENIDO' AS status, NOW() AS created_at, NOW() AS updated_at) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE gps_device_id = 'GPS-003');
