INSERT INTO vehicles (plate_number, brand, model, year, gps_device_id, status, created_at, updated_at)
SELECT * FROM (
    SELECT 'ABC-123' AS plate_number, 'Toyota' AS brand, 'Hilux' AS model, 2024 AS year, 'GPS-001' AS gps_device_id, 'SIN_SENAL' AS status, NOW() AS created_at, NOW() AS updated_at
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles WHERE gps_device_id = 'GPS-001'
) LIMIT 1;

INSERT INTO vehicles (plate_number, brand, model, year, gps_device_id, status, created_at, updated_at)
SELECT * FROM (
    SELECT 'DEF-456' AS plate_number, 'Nissan' AS brand, 'NP300' AS model, 2023 AS year, 'GPS-002' AS gps_device_id, 'SIN_SENAL' AS status, NOW() AS created_at, NOW() AS updated_at
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles WHERE gps_device_id = 'GPS-002'
) LIMIT 1;

INSERT INTO vehicles (plate_number, brand, model, year, gps_device_id, status, created_at, updated_at)
SELECT * FROM (
    SELECT 'GHI-789' AS plate_number, 'Hyundai' AS brand, 'Accent' AS model, 2025 AS year, 'GPS-003' AS gps_device_id, 'SIN_SENAL' AS status, NOW() AS created_at, NOW() AS updated_at
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles WHERE gps_device_id = 'GPS-003'
) LIMIT 1;
