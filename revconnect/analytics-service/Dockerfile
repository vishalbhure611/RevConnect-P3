FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
RUN mvn install -N -q
COPY analytics-service/pom.xml analytics-service/pom.xml
COPY analytics-service/src analytics-service/src
RUN mvn package -f analytics-service/pom.xml -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/analytics-service/target/analytics-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8085
USER appuser
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
