# ============================================================
# Stage 1: build - compila el proyecto Spring Boot con Maven
# ============================================================
# Se usa la imagen oficial maven:3.9-eclipse-temurin-17 que ya
# trae JDK 17 + Maven 3.9 preinstalados (no necesitamos ./mvnw).
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copiamos primero el pom.xml para cachear dependencias.
# Mientras el pom.xml no cambie, las dependencias se reusan.
COPY pom.xml ./
RUN mvn -B -e -ntp dependency:go-offline

# Ahora copiamos el codigo fuente y construimos el JAR.
COPY src src
RUN mvn -B -e -ntp clean package -DskipTests

# ============================================================
# Stage 2: runtime - imagen minima solo con JRE
# ============================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Copiamos el JAR generado. Usamos wildcard porque Spring Boot
# genera "<artifactId>-<version>.jar" (gps-telemetry-0.0.1-SNAPSHOT.jar)
# y renombrarlo a "app.jar" evita depender del nombre exacto.
COPY --from=build /app/target/*.jar app.jar

# Puerto por defecto de Spring Boot (configurado en application.properties)
EXPOSE 8080

# El JAR se ejecuta con java -jar. Usamos exec form para que las
# senales (SIGTERM) se envien correctamente al proceso Java y
# Spring Boot pueda cerrarse limpiamente.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
