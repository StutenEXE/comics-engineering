# ─────────────────────────────────────────────────────────
# Stage 1 – Build  (Gradle)
# ─────────────────────────────────────────────────────────
FROM gradle:8-jdk21 AS builder

WORKDIR /build

# Copy version catalog + build files for dependency caching
COPY gradlew .
COPY gradle ./gradle
COPY settings.gradle ./
COPY app/build.gradle ./app/
RUN gradle dependencies --no-daemon -q

# Build the fat JAR
COPY app/src ./app/src
COPY app/build/generated-src ./app/build/generated-src
RUN gradle shadowJar --no-daemon -q -x generateJooq

# ─────────────────────────────────────────────────────────
# Stage 2 – Runtime  (slim JRE image)
# ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copy only the fat JAR from the builder stage
COPY --from=builder /build/app/build/libs/*-all.jar app.jar

# Javalin default port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]