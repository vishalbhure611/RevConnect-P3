FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
RUN mvn install -N -q
COPY config-server/pom.xml config-server/pom.xml
COPY config-server/src config-server/src
RUN mvn package -f config-server/pom.xml -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/config-server/target/config-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8888
USER appuser
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
