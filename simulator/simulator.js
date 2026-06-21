import axios from 'axios';
import http from 'http';

// ============================================================
// Configuracion
// ============================================================

const API_URL = process.env.API_URL || 'http://localhost:8080';
const MIN_INTERVAL = 3000;
const MAX_INTERVAL = 5000;
const INVALID_RATE = 0.1;

// ============================================================
// Colores para consola
// ============================================================

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// ============================================================
// Definicion de vehiculos
// ============================================================

const vehicles = [
  {
    id: 'GPS-001',
    name: 'Vehiculo 1 (Ruta Norte)',
    lat: 4.6500,
    lng: -74.0500,
    speed: 60,
    behavior: 'moving',
    ignition: true,
    // Direccion de movimiento: Sureste
    dirLat: -0.0003,
    dirLng: 0.0002,
  },
  {
    id: 'GPS-002',
    name: 'Vehiculo 2 (Detenido)',
    lat: 4.6090,
    lng: -74.0810,
    speed: 0,
    behavior: 'stopped',
    ignition: true,
  },
  {
    id: 'GPS-003',
    name: 'Vehiculo 3 (Ruta Sur)',
    lat: 4.5800,
    lng: -74.1200,
    speed: 45,
    behavior: 'moving',
    ignition: true,
    // Direccion de movimiento: Noroeste (ruta diferente a GPS-001)
    dirLat: 0.0002,
    dirLng: -0.0003,
  },
];

// ============================================================
// Movimiento
// ============================================================

function moveVehicle(vehicle) {
  // Vehiculo detenido: nunca cambia coordenadas
  if (vehicle.behavior === 'stopped') {
    return { ...vehicle };
  }

  // Vehiculo en movimiento: aplica delta constante + variacion aleatoria
  const jitterLat = (Math.random() - 0.5) * 0.0001;
  const jitterLng = (Math.random() - 0.5) * 0.0001;

  return {
    ...vehicle,
    lat: vehicle.lat + vehicle.dirLat + jitterLat,
    lng: vehicle.lng + vehicle.dirLng + jitterLng,
    speed: 40 + Math.random() * 40,
  };
}

// ============================================================
// Requests
// ============================================================

function buildValidRequest(vehicle) {
  return {
    vehicleId: vehicle.id,
    lat: parseFloat(vehicle.lat.toFixed(6)),
    lng: parseFloat(vehicle.lng.toFixed(6)),
    timestamp: new Date().toISOString(),
    speed: parseFloat(vehicle.speed.toFixed(1)),
    heading: Math.floor(Math.random() * 360),
    altitude: 150 + Math.floor(Math.random() * 50),
    ignition: vehicle.ignition,
  };
}

function buildInvalidRequest(vehicle) {
  const errorType = Math.floor(Math.random() * 4);
  switch (errorType) {
    case 0: return { lat: -12.0, lng: -77.0, timestamp: new Date().toISOString() };
    case 1: return { vehicleId: vehicle.id, lat: 999, lng: -77.0, timestamp: new Date().toISOString() };
    case 2: return { vehicleId: vehicle.id, lat: -12.0, lng: -77.0, timestamp: 'invalid-date' };
    default: return {};
  }
}

// ============================================================
// Estadisticas
// ============================================================

const stats = { sent: 0, success: 0, failed: 0, invalid: 0, notFound: 0, connErrors: 0 };

// ============================================================
// Vehiculos pausados (mecanismo de pausa por vehiculo)
// ============================================================

const pausedVehicles = new Set();

// ============================================================
// Envio con reintentos (backoff exponencial)
// ============================================================

async function sendWithRetry(payload, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await axios.post(`${API_URL}/gps`, payload, { timeout: 5000 });
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ============================================================
// Envio
// ============================================================

async function sendGpsData(vehicle) {
  const isInvalid = Math.random() < INVALID_RATE;
  const request = isInvalid ? buildInvalidRequest(vehicle) : buildValidRequest(vehicle);
  const ts = new Date().toLocaleTimeString('es-PE');
  const label = `${c.cyan}[${vehicle.id}]${c.reset}`;

  try {
    await sendWithRetry(request);

    stats.sent++;
    stats.success++;

    if (isInvalid) {
      stats.invalid++;
      console.log(`${c.gray}${ts}${c.reset} ${label} ${c.yellow}⚠ Invalid request${c.reset}`);
    } else {
      const isMoving = vehicle.behavior === 'moving';
      const sColor = isMoving ? c.green : c.yellow;
      const sText = isMoving ? 'MOVING' : 'STOPPED';
      console.log(`${c.gray}${ts}${c.reset} ${label} ${sColor}${sText}${c.reset} | ${request.lat}, ${request.lng} | ${request.speed} km/h`);
    }
  } catch (error) {
    stats.sent++;
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message;

    if (!error.response) {
      stats.connErrors++;
      console.log(`${c.gray}${ts}${c.reset} ${label} ${c.red}✗ Connection error${c.reset} | ${c.dim}${error.message}${c.reset}`);
    } else if (status === 404) {
      stats.notFound++;
      stats.failed++;
      console.log(`${c.gray}${ts}${c.reset} ${label} ${c.red}✗ 404 NotFound${c.reset} | ${c.dim}${detail}${c.reset}`);
    } else if (status === 400) {
      stats.invalid++;
      stats.failed++;
      console.log(`${c.gray}${ts}${c.reset} ${label} ${c.yellow}✗ 400 Validation${c.reset} | ${c.dim}${detail}${c.reset}`);
    } else {
      stats.failed++;
      console.log(`${c.gray}${ts}${c.reset} ${label} ${c.red}✗ ${status}${c.reset} | ${c.dim}${detail}${c.reset}`);
    }
  }
}

// ============================================================
// Health check
// ============================================================

async function checkBackend() {
  try {
    await axios.get(`${API_URL}/vehicles`, { timeout: 5000 });
    return true;
  } catch (error) {
    if (error.response) return true;
    return false;
  }
}

// ============================================================
// Main
// ============================================================

function printHeader() {
  console.log('\n' + '='.repeat(72));
  console.log(`${c.bold}GPS VEHICLE SIMULATOR${c.reset}`);
  console.log('='.repeat(72));
  console.log(`  API URL:      ${API_URL}`);
  console.log(`  Interval:     ${MIN_INTERVAL / 1000}s - ${MAX_INTERVAL / 1000}s`);
  console.log(`  Invalid rate: ${INVALID_RATE * 100}%`);
  console.log('='.repeat(72));
  console.log(`  ${c.green}[GPS-001] MOVING${c.reset}   Chapinero → Sureste`);
  console.log(`  ${c.yellow}[GPS-002] STOPPED${c.reset}  La Candelaria (Centro)`);
  console.log(`  ${c.green}[GPS-003] MOVING${c.reset}   Kennedy → Noroeste`);
  console.log('-'.repeat(72) + '\n');
}

function printStats() {
  console.log(`\n${c.bold}--- Estadisticas ---${c.reset}`);
  console.log(`  Enviados:    ${stats.sent}`);
  console.log(`  ${c.green}Exitosos:   ${stats.success}${c.reset}`);
  console.log(`  ${c.red}Fallidos:   ${stats.failed}${c.reset}`);
  console.log(`  ${c.yellow}Invalidos:  ${stats.invalid}${c.reset}`);
  console.log(`  ${c.red}404 NotFound: ${stats.notFound}${c.reset}`);
  console.log(`  ${c.gray}Conn Errors:  ${stats.connErrors}${c.reset}`);
  console.log(`${c.bold}--------------------${c.reset}\n`);
}

async function main() {
  printHeader();

  console.log(`${c.cyan}Verificando backend...${c.reset}`);
  const backendOk = await checkBackend();

  if (!backendOk) {
    console.log(`\n${c.red}${c.bold}ERROR: No se pudo conectar al backend en ${API_URL}${c.reset}`);
    console.log(`${c.yellow}Verifica que el backend este ejecutandose:${c.reset}`);
    console.log(`  cd backend && ./mvnw spring-boot:run\n`);
    process.exit(1);
  }
  console.log(`${c.green}Backend conectado${c.reset}\n`);

  const scheduleNext = (vehicle) => {
    const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    setTimeout(async () => {
      vehicle = moveVehicle(vehicle);
      if (pausedVehicles.has(vehicle.id)) {
        return; // saltar este envío, el backend lo marcará SIN_SENAL después de 120s
      }
      await sendGpsData(vehicle);
      const idx = vehicles.findIndex(v => v.id === vehicle.id);
      if (idx !== -1) vehicles[idx] = vehicle;
      scheduleNext(vehicle);
    }, delay);
  };

  vehicles.forEach((vehicle) => {
    const initialDelay = Math.random() * 2000;
    setTimeout(() => {
      if (pausedVehicles.has(vehicle.id)) {
        return; // saltar este envío, el backend lo marcará SIN_SENAL después de 120s
      }
      sendGpsData(vehicle);
      scheduleNext(vehicle);
    }, initialDelay);
  });

  setInterval(printStats, 30000);

  process.on('SIGINT', () => {
    console.log('\n');
    printStats();
    console.log(`${c.cyan}Simulador detenido.${c.reset}\n`);
    process.exit(0);
  });
}

// ============================================================
// Senales del sistema
// ============================================================

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] SIGTERM recibido, terminando...');
  printStats();
  process.exit(0);
});

// ============================================================
// Servidor de control (pausa/reanudacion por vehiculo)
// ============================================================

const controlServer = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/pause') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { vehicleId } = JSON.parse(body);
        if (vehicleId) {
          pausedVehicles.add(vehicleId);
          console.log(`[PAUSE] Vehiculo ${vehicleId} pausado. Backend lo marcara SIN_SENAL despues de 120s.`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'paused', vehicleId, paused: Array.from(pausedVehicles) }));
        }
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/resume') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { vehicleId } = JSON.parse(body);
        if (vehicleId) {
          pausedVehicles.delete(vehicleId);
          console.log(`[RESUME] Vehiculo ${vehicleId} reanudado.`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'resumed', vehicleId, paused: Array.from(pausedVehicles) }));
        }
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ paused: Array.from(pausedVehicles) }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const CONTROL_PORT = process.env.CONTROL_PORT || 3001;
controlServer.listen(CONTROL_PORT, () => {
  console.log(`[CONTROL] Servidor de control escuchando en puerto ${CONTROL_PORT}`);
  console.log(`  POST /pause   { "vehicleId": "GPS-001" }`);
  console.log(`  POST /resume  { "vehicleId": "GPS-001" }`);
  console.log(`  GET  /status`);
});

main();
