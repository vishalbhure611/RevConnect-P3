FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
RUN mvn install -N -q
COPY interaction-service/pom.xml interaction-service/pom.xml
COPY interaction-service/src interaction-service/src
RUN mvn package -f interaction-service/pom.xml -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/interaction-service/target/interaction-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8087
USER appuser
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
