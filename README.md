#  RevConnect - Microservices Social Platform

[![Status](https://img.shields.io/badge/Status-Active-green)]()
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)]()
[![Java](https://img.shields.io/badge/Java-17-orange)]()
[![Spring Boot](https://img.shields.io/badge/SpringBoot-Microservices-brightgreen)]()
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)]()
[![Angular](https://img.shields.io/badge/Frontend-Angular-red)]()

---

##  Overview

**RevConnect (Phase 3)** is a scalable **microservices-based social media platform** evolved from a monolithic architecture.

It enables users (Personal, Creator, Business) to connect, share content, and interact in a distributed system.

---

## Architecture Diagram

---

## Key Highlights

* Migrated from **Monolithic → Microservices Architecture**
* Implemented **Service Discovery using Eureka**
* Built **API Gateway for centralized routing**
* Used **Feign Clients with fallback mechanisms**
* Centralized configuration via **Config Server**
* Containerized using **Docker & Docker Compose**

---

##  Architecture Overview


```text
Frontend (Angular)
        ↓
API Gateway
        ↓
Eureka Server
        ↓
Microservices
```

---

##  Microservices


| Service              | Description               |
| -------------------- | ------------------------- |
| User Service         | Authentication & profiles |
| Post Service         | Post management           |
| Social Service       | Followers & connections   |
| Feed Service         | Personalized feed         |
| Interaction Service  | Likes & comments          |
| Notification Service | Notifications             |
| Analytics Service    | Insights                  |
| Product Service      | Business features         |

---

##  Core Features


* JWT Authentication & RBAC
* Post creation & engagement
* Social networking
* Notifications
* Personalized feeds
* Analytics

---

##  Project Structure
```
RevConnect-P3/
│
├── revconnect/                     # Backend (Microservices)
│   ├── user-service/
│   ├── post-service/
│   ├── social-service/
│   ├── feed-service/
│   ├── interaction-service/
│   ├── notification-service/
│   ├── analytics-service/
│   ├── product-service/
│   │
│   ├── api-gateway/
│   ├── config-server/
│   ├── eureka-server/
│   │
│   ├── docker-compose.yml
│   └── create-databases.sql
│
├── revconnect-frontend/            # Angular Frontend
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── Dockerfile
│
└── README.md---
```
##  Technology Stack

![Tech Stack](https://skillicons.dev/icons?i=java,spring,angular,mysql,docker,maven)

---

##  Docker Setup

```bash
docker-compose up --build
```

---

##  Frontend Setup

```bash
cd revconnect-frontend
npm install
ng serve
```

---

##  Security

![Security](https://img.shields.io/badge/Security-JWT%20%7C%20BCrypt-blue)

* JWT Authentication
* BCrypt Encryption
* Role-based access
* Secure API Gateway routing

---

##  Future Enhancements

![Future](https://img.shields.io/badge/Future-Kubernetes%20%7C%20CI/CD%20%7C%20WebSockets-orange)

* Kubernetes deployment
* CI/CD pipelines
* Real-time notifications
* Distributed tracing (Zipkin)

---

##  Author

**Vishal Bhure**

---
