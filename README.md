# Task Manager - Docker Microservices

Production-style Task Manager CRUD application with Docker, PostgreSQL, Redis, Swagger API documentation, and CI/CD.

## Architecture

```
                    Client (Postman/Browser)
                               |
                               v
                    ┌─────────────────────┐
                    │  Python API Gateway │  :5000
                    │      (Flask)        │
                    └─────────┬───────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │   Java Backend      │  :8080
                    │  (Spring Boot)      │
                    └─────────┬───────────┘
                              |
              ┌───────────────┴───────────────┐
              |                               |
              v                               v
    ┌─────────────────┐             ┌─────────────────┐
    │   PostgreSQL    │  :5432      │     Redis       │  :6379
    │   (taskdb)      │             │   (cache)       │
    └─────────────────┘             └─────────────────┘
```

**Flow:** Client → Python Gateway → Java Backend → PostgreSQL / Redis

## Technology Stack

| Component      | Technology                          |
|----------------|-------------------------------------|
| API Gateway    | Python 3.10, Flask                  |
| Backend        | Java 17, Spring Boot 3.2            |
| Database       | PostgreSQL 16                       |
| Cache          | Redis 7                             |
| API Docs       | Springdoc OpenAPI (Swagger)         |
| Validation     | Jakarta Validation                  |
| Build          | Maven, Docker, Docker Compose       |

## Project Structure

```
task-manager-docker/
├── docker-compose.yml
├── .env
├── README.md
├── python-gateway/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── java-backend/
│   ├── src/main/java/com/taskmanager/
│   │   ├── TaskManagerApplication.java
│   │   ├── entity/Task.java
│   │   ├── dto/TaskRequest.java, TaskResponse.java
│   │   ├── repository/TaskRepository.java
│   │   ├── service/TaskService.java
│   │   ├── controller/TaskController.java
│   │   ├── config/CacheConfig.java, OpenApiConfig.java
│   │   └── exception/GlobalExceptionHandler.java
│   ├── src/main/resources/application.yml
│   ├── pom.xml
│   └── Dockerfile
└── .github/workflows/
    └── docker-ci.yml
```

## Task Model

| Field       | Type     | Description        |
|------------|----------|--------------------|
| id         | Long     | Auto-generated     |
| title      | String   | Required           |
| description| String   | Optional           |
| status     | Enum     | TODO, IN_PROGRESS, DONE |
| created_at | Instant  | Auto-set           |

## Setup

### Prerequisites

- Docker
- Docker Compose v2+

### Run

```bash
cd task-manager-docker
docker compose build
docker compose up -d
```

### Stop

```bash
docker compose down
```

## Environment Variables

Configure via `.env`:

| Variable    | Default   | Description     |
|------------|-----------|-----------------|
| DB_HOST    | postgres  | PostgreSQL host |
| DB_PORT    | 5432      | PostgreSQL port |
| DB_NAME    | taskdb    | Database name   |
| DB_USER    | admin     | Database user   |
| DB_PASSWORD| admin     | Database pass   |
| REDIS_HOST | redis     | Redis host      |
| REDIS_PORT | 6379      | Redis port      |

## API Endpoints

### Python Gateway (port 5000)

| Method | Endpoint      | Description   |
|--------|---------------|---------------|
| POST   | /task         | Create task   |
| GET    | /tasks        | Get all tasks |
| GET    | /task/{id}    | Get task by ID|
| PUT    | /task/{id}    | Update task   |
| DELETE | /task/{id}    | Delete task   |

### Java Backend (port 8080)

| Method | Endpoint   | Description   |
|--------|------------|---------------|
| POST   | /tasks     | Create task   |
| GET    | /tasks     | Get all (cached) |
| GET    | /tasks/{id}| Get task      |
| PUT    | /tasks/{id}| Update task   |
| DELETE | /tasks/{id}| Delete task   |

### Swagger UI

- **URL:** http://localhost:8080/swagger-ui/index.html
- Interactive API documentation

### Web UI

- **Task Manager UI:** http://localhost:5000
- Create, list, edit, and delete tasks in the browser

### Health

- Python: http://localhost:5000/health
- Java Actuator: http://localhost:8080/actuator/health

## API Testing

### Create task

```bash
curl -X POST http://localhost:5000/task \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task details","status":"TODO"}'
```

### Get all tasks

```bash
curl http://localhost:5000/tasks
```

### Get task by ID

```bash
curl http://localhost:5000/task/1
```

### Update task

```bash
curl -X PUT http://localhost:5000/task/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","description":"Updated","status":"IN_PROGRESS"}'
```

### Delete task

```bash
curl -X DELETE http://localhost:5000/task/1
```

## Redis Caching

- `GET /tasks` responses are cached in Redis (5 min TTL)
- Cache is evicted on POST, PUT, DELETE
- First request fetches from PostgreSQL, subsequent requests served from Redis

## CI/CD

GitHub Actions workflow (`.github/workflows/docker-ci.yml`):

- Triggers on push to `main` or `master`
- Builds all Docker images
- Runs `docker compose up`
- Verifies Python gateway responds
- Runs `docker compose down`

## License

MIT
