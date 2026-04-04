# FinovaBank Service Dockerfile
# Multi-stage build for Spring Boot microservices
# Usage: docker build --build-arg SERVICE_NAME=account-management -t finovabank/<service> .

ARG JAVA_VERSION=21
ARG MAVEN_VERSION=3.9.6

# ─── Stage 1: Dependency cache ────────────────────────────────────────────────
FROM maven:${MAVEN_VERSION}-eclipse-temurin-${JAVA_VERSION}-alpine AS deps
WORKDIR /build
COPY pom.xml .
COPY */pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B --no-transfer-progress

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM deps AS builder
ARG SERVICE_NAME
WORKDIR /build
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -pl ${SERVICE_NAME} -am \
        -DskipTests \
        -B --no-transfer-progress \
    && mkdir -p /build/extracted \
    && java -Djarmode=layertools \
        -jar /build/${SERVICE_NAME}/target/*.jar extract \
        --destination /build/extracted

# ─── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:${JAVA_VERSION}-jre-alpine AS runtime

# Security: create non-root user
RUN addgroup -S finovaapp && adduser -S -G finovaapp finovaapp

WORKDIR /app

# Copy layered JAR content for optimal layer caching
COPY --from=builder --chown=finovaapp:finovaapp /build/extracted/dependencies/ ./
COPY --from=builder --chown=finovaapp:finovaapp /build/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=finovaapp:finovaapp /build/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=finovaapp:finovaapp /build/extracted/application/ ./

# Create writable tmp directory (required for Spring Boot with readOnlyRootFilesystem)
RUN mkdir -p /tmp && chown finovaapp:finovaapp /tmp

USER finovaapp

# JVM tuning for containers
ENV JAVA_OPTS="\
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -XX:+ExitOnOutOfMemoryError \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.backgroundpreinitializer.ignore=true"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
