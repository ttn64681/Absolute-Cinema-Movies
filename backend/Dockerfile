# --- Stage 1: Build ---
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy POM first for dependency cache (faster rebuilds when only code changes)
#  COPY - Copy the pom.xml file to the working directory
#  RUN - Run the command to download the dependencies
# -B - Batch mode, faster build
COPY pom.xml . 
RUN mvn dependency:go-offline -B 

# Copy source and build, skipping tests
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Run ---
# FROM - Use the eclipse-temurin:17-jre-alpine image as the base image
# WORKDIR - Set the working directory to /app
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Single JAR from Spring Boot (artifact name from pom.xml)
COPY --from=build /app/target/cinema-ebkg-system-0.0.1-SNAPSHOT.jar app.jar

# Free-tier friendly heap (Render ~512MB; leave room for metaspace)
# ENV - Set the environment vars
# -Xmx350m - Set the maximum heap size to 350MB
# -Xms256m - Set the initial heap size to 256MB
ENV JAVA_OPTS="-Xmx350m -Xms256m"

EXPOSE 8080

# Use PORT from environment on Render/Railway etc.; default 8080 locally
# Render: listen on PORT (set by platform), bind to 0.0.0.0 so traffic is reachable
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dserver.address=0.0.0.0 -jar app.jar"]
