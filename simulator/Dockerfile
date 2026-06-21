# ============================================================
# Simulador de vehiculos GPS
# ============================================================
# Imagen liviana (alpine) con Node 20 (LTS).
# El paquete.json declara "type": "module" por lo que simulator.js
# se ejecuta como ESM directamente.
FROM node:22-alpine

WORKDIR /app

# Copiamos manifests primero para cachear dependencias
COPY package*.json ./

# Instalamos solo dependencias de produccion (no devDependencies)
RUN npm install --omit=dev

# Copiamos el codigo del simulador
COPY . .

# API_URL por defecto apunta al servicio "backend" en la red de docker.
# Se puede sobreescribir en docker-compose.yml o con un .env
ENV API_URL=http://backend:8080

# El script "start" ejecuta "node simulator.js"
CMD ["npm", "start"]
