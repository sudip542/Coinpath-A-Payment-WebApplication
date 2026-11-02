# Multi-stage production build for Coinpath Backend
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 1. Copy the Aiven CA certificate from your build stage resources folder
COPY --from=build /app/src/main/resources/aiven-ca.pem /app/aiven-ca.pem

# 2. Import the certificate into Java's truststore as root (since cacerts requires root privileges)
RUN keytool -import -trustcacerts -alias aiven-kafka \
    -file /app/aiven-ca.pem \
    -keystore $JAVA_HOME/lib/security/cacerts \
    -storepass changeit -noprompt

# 3. Set up a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 4. Copy the built jar file
COPY --from=build /app/target/coinpath-*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]