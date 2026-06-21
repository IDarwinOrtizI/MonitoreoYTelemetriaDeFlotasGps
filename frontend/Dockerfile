# ============================================================
# Stage 1: build - compila el frontend Vite + React + TypeScript
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copiamos package.json y lock primero para cachear dependencias.
COPY package*.json ./
RUN npm install

# Copiamos el resto del codigo y construimos.
# "npm run build" ejecuta: tsc -b && vite build (definido en package.json)
COPY . .
RUN npm run build

# ============================================================
# Stage 2: serve - nginx sirve los estaticos y hace proxy al backend
# ============================================================
FROM nginx:alpine AS runtime

# Limpiar el sitio por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos el build de Vite (output en /app/dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuracion de nginx (proxy reverso + SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# La imagen nginx:alpine ya tiene un ENTRYPOINT/CMD adecuado
CMD ["nginx", "-g", "daemon off;"]
