# Frontend — Gps Monitoreo

Dashboard de monitoreo y telemetría de flotas GPS en tiempo real.

## Stack

- React 19 + TypeScript
- Vite 8
- React Leaflet 5 + Leaflet 1.9 (mapa con tiles oscuros de CartoDB)
- Axios para HTTP
- CSS Modules + variables CSS (tema oscuro)

## Requisitos

- Node.js 22+
- Backend corriendo en `http://localhost:8080` (o configurar `VITE_API_URL`)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # dev server en http://localhost:3000
npm run build    # build de producción
npm run lint     # linter
npm run preview  # preview del build
```

## Variables de entorno

- `VITE_API_URL`: URL base de la API (default: `/api`)

## Estructura

- `components/`: componentes UI (dashboard, layout, vehicles)
- `services/`: capa HTTP (axios)
- `hooks/`: lógica de estado reutilizable
- `types/`: tipos TypeScript compartidos
- `utils/`: formateo y helpers
- `config/`: configuración (instancia axios)
- `styles/`: variables CSS y estilos globales
