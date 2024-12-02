# Quiz Application API

A RESTful API for managing quizzes built with NestJS and TypeScript.

## Features

- Create quizzes with multiple-choice questions
- Fetch quizzes without revealing correct answers
- Submit answers and receive immediate feedback
- Get quiz results and performance statistics
- Delete quiz

## Prerequisites

- **Docker** and **Docker Compose** for running the project
- **Node.js** and **npm** for local development (optional)

## Getting Started

### Running with Docker

1. **Install Docker and Docker Compose:**

   - Download and install Docker from [Docker](https://www.docker.com/get-started)
   - Follow the instructions to install Docker Compose.

2. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

3. **Start the Application**

   ```bash
   docker-compose up -d
   ```

The server will be accessible at `http://localhost:3000`.

## API Documentation

- `http://localhost:3000/api`

## Postman Collection

- File in root directory named. `Quiz_app.postman_collection.json`

## API Endpoints

- POST /quiz - Create a new quiz
- GET /quiz/:id - Get quiz by ID
- POST /quiz/:quizId/questions/:questionId/answer - Submit an answer
- GET /quiz/:quizId/results/:userId - Get quiz results
- DELETE /quiz/:quizId - Delete quiz

## Technical Decisions

- Used in-memory storage (Map) for simplicity
- Implemented proper validation using class-validator
- Added Swagger documentation
- Used TypeScript for type safety
- Followed NestJS best practices and architecture

## Known Limitations

- Data is not persistent (in-memory storage)
- No authentication/authorization
- No rate limiting
- No caching mechanism
