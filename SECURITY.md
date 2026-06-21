# Notas de Seguridad

## Contraseña expuesta en historial de Git

⚠️ **ACCIÓN REQUERIDA**: La contraseña `SeB*A12#` estuvo hardcodeada en `backend/src/main/resources/application.properties` y está expuesta en el historial de Git de forma permanente.

**Acciones recomendadas:**
1. Rotar la contraseña en MySQL inmediatamente
2. (Opcional) Purgar el historial con `git filter-branch` o BFG Repo-Cleaner
3. Las nuevas credenciales se configuran vía variables de entorno (`SPRING_DATASOURCE_PASSWORD`)

## Configuración de credenciales

Las credenciales ahora se leen de variables de entorno (con defaults en código que NO son secretos reales). En Docker, están configuradas en `docker-compose.yml`. Para desarrollo local, copia `.env.example` a `.env` y edita los valores.
