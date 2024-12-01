# Quiz Application API

A RESTful API for managing quizzes built with NestJS and TypeScript.

## Features

- Create quizzes with multiple-choice questions
- Fetch quizzes without revealing correct answers
- Submit answers and receive immediate feedback
- Get quiz results and performance statistics

## Setup Instructions

1. Make sure you have Node.js and npm installed
2. Clone the repository
3. Install dependencies: `npm install`
4. Start the server: `npm run start`

The API will be available at `http://localhost:3000`

## API Endpoints

- POST /quiz - Create a new quiz
- GET /quiz/:id - Get quiz by ID
- POST /quiz/:quizId/questions/:questionId/answer - Submit an answer
- GET /quiz/:quizId/results/:userId - Get quiz results

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
