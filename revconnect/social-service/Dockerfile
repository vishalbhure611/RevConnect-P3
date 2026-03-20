FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
RUN mvn install -N -q
COPY social-service/pom.xml social-service/pom.xml
COPY social-service/src social-service/src
RUN mvn package -f social-service/pom.xml -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/social-service/target/social-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8084
USER appuser
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
