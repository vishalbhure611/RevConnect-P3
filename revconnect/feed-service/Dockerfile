FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
RUN mvn install -N -q
COPY feed-service/pom.xml feed-service/pom.xml
COPY feed-service/src feed-service/src
RUN mvn package -f feed-service/pom.xml -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/feed-service/target/feed-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8088
USER appuser
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
