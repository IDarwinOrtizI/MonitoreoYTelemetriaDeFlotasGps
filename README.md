# Monitoreo y Telemetría de Flotas GPS

Sistema de monitoreo y telemetría de flotas de vehículos GPS.
Consta de:

- **Backend**: API REST en Spring Boot 3 (Java 17) con MySQL 8.
- **Frontend**: Dashboard en React + TypeScript + Vite, con mapa en tiempo real (Leaflet).
- **Simulator**: Generador de telemetría GPS (Node.js) para pruebas.

---

## Levantar el stack con Docker

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
- (Opcional) Crear un archivo `.env` en la raíz copiando `.env.example`:
  ```bash
  cp .env.example .env   # Linux/Mac
  copy .env.example .env # Windows PowerShell
  ```
  Si no lo creas, Docker Compose usará los valores por defecto.

### Comandos

| Acción | Comando |
|---|---|
| Construir y levantar todo | `docker-compose up --build` |
| Levantar en background | `docker-compose up -d --build` |
| Ver logs en vivo | `docker-compose logs -f` |
| Logs de un servicio | `docker-compose logs -f backend` |
| Detener todo | `docker-compose down` |
| Detener y borrar datos (⚠) | `docker-compose down -v` |

### URLs una vez levantado

| Servicio | URL | Notas |
|---|---|---|
| **Frontend** | http://localhost | Dashboard de la flota |
| **Backend API** | http://localhost:8080 | Endpoints REST (vía nginx: `/api/...`) |
| **Backend API** (directo) | http://localhost:8080 | Sin pasar por nginx |
| **MySQL** | `localhost:3306` | User: `gpsuser`, Pass: `gpspass` (ver `.env.example`) |

### Arquitectura de red

```
  Browser
     │
     ▼ (puerto 80)
  ┌──────────┐    /api/*    ┌──────────┐
  │ frontend │ ───────────▶ │ backend  │ ──▶ MySQL (puerto 3306, interno)
  │ (nginx)  │              │ (Spring) │
  └──────────┘              └──────────┘
                                  ▲
                                  │ POST /gps, GET /vehicles
                              ┌──────────┐
                              │simulator │
                              │ (Node)   │
                              └──────────┘
```

Todos los servicios están en la red bridge `gps-net` y se resuelven
por nombre de servicio (`mysql`, `backend`, `frontend`, `simulator`).

### Notas importantes

- **Prefijo `/api`**: El frontend llama a `/api/vehicles`, pero nginx
  lo reescribe a `/vehicles` antes de enviarlo al backend (igual que
  hace Vite en desarrollo). El backend expone sus endpoints en la raíz
  (`/gps`, `/vehicles`, etc.).
- **Persistencia**: Los datos de MySQL se guardan en el volumen
  `mysql_data`. Sobreviven a `docker-compose down` pero se borran con
  `docker-compose down -v`.
- **Primera inicialización**: La primera vez que se levanta, MySQL
  tarda ~30s en estar listo. El `healthcheck` lo detecta y el backend
  espera automáticamente.

---

## Desarrollo local (sin Docker)

Si prefieres correr los servicios por separado:

### Backend
```bash
cd backend
./mvnw spring-boot:run    # Linux/Mac
mvnw.cmd spring-boot:run  # Windows
```
Requiere MySQL corriendo en `localhost:3306` y Java 17 instalado.

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```
El proxy de Vite redirige `/api/*` a `http://localhost:8080`.

### Simulator
```bash
cd simulator
npm install
npm start                 # usa API_URL=http://localhost:8080
```

---

## Estructura del proyecto

```
.
├── backend/          # Spring Boot (Java 17 + Maven)
├── frontend/         # React + Vite + TypeScript
├── simulator/        # Node.js (generador de telemetría)
├── docker-compose.yml
├── .env.example
└── README.md
```
