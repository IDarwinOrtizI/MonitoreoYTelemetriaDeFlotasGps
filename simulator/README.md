# Simulador GPS

Simulador de vehículos GPS que envía coordenadas periódicamente al backend.

## Comportamiento
- 3 vehículos: `GPS-001` (Ruta Norte, en movimiento), `GPS-002` (Detenido), `GPS-003` (Ruta Sur, en movimiento)
- ~10% de requests son inválidos (para probar validaciones del backend)
- Intervalo de envío: aleatorio entre `MIN_INTERVAL` y `MAX_INTERVAL` segundos
- Reintentos con backoff exponencial ante errores de red (1s, 2s, 4s, máx 10s)

## Variables de entorno
- `API_URL`: URL del backend (default: `http://localhost:8080`)
- `MIN_INTERVAL`: segundos mínimos entre envíos (default: 3)
- `MAX_INTERVAL`: segundos máximos entre envíos (default: 5)
- `INVALID_RATE`: tasa de requests inválidos 0-1 (default: 0.1)
- `CONTROL_PORT`: puerto del servidor de control (default: 3001)

## Servidor de control (puerto 3001)
- `GET /status` → `{ "paused": ["GPS-001"] }`
- `POST /pause` body `{ "vehicleId": "GPS-001" }` → pausa las transmisiones de un vehículo (el backend lo marcará SIN_SENAL después de 120s)
- `POST /resume` body `{ "vehicleId": "GPS-001" }` → reanuda las transmisiones

### Ejemplo con curl
```bash
# Pausar GPS-002 para probar SIN_SENAL
curl -X POST http://localhost:3001/pause -H "Content-Type: application/json" -d '{"vehicleId":"GPS-002"}'

# Esperar 2+ minutos y ver el estado en el dashboard

# Reanudar
curl -X POST http://localhost:3001/resume -H "Content-Type: application/json" -d '{"vehicleId":"GPS-002"}'
```

## Comandos
```bash
npm install      # instalar dependencias
npm start        # ejecutar simulador
```

## Señales
- `Ctrl+C` o `SIGINT` → shutdown limpio con estadísticas
- `SIGTERM` (docker stop) → shutdown limpio con estadísticas
