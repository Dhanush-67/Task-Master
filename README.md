# Task-Master

Task Master is a full-stack to-do list app with a vanilla HTML/CSS/JS frontend and a RESTful backend built with Node.js, Express, and PostgreSQL.

## Features

- Create, list, update, complete, and delete tasks through `/api/tasks`
- Server-side validation with structured JSON error responses
- PostgreSQL persistence with filtering by status and sorting by due date, title, or created date
- Clean backend separation between routes, controllers, services, and database setup
- Postman collection for endpoint testing in [postman/task-master.postman_collection.json](/home/zeeton/repos/Task-Master/postman/task-master.postman_collection.json)

## Project Structure

- `src/routes`: Express route definitions
- `src/controllers`: Request validation and response handling
- `src/services`: PostgreSQL queries and business logic
- `src/db`: Connection pool and schema initialization
- `src/middleware`: Not found and error handlers
- `db/schema.sql`: PostgreSQL table setup

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` to point to your PostgreSQL database.

4. Start the server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000), and the backend will auto-run `db/schema.sql` on startup.

## API

### `GET /api/tasks`

Query params:

- `status=all|open|completed`
- `sortBy=dueDate|createdAt|title`
- `order=asc|desc`

### `POST /api/tasks`

```json
{
  "title": "Prepare project demo",
  "dueDate": "2026-04-25",
  "dueTime": "14:00"
}
```

### `PATCH /api/tasks/:id`

```json
{
  "title": "Prepare final demo",
  "dueTime": "16:30"
}
```

### `PATCH /api/tasks/:id/complete`

```json
{
  "completed": true
}
```

### `DELETE /api/tasks/:id`

Returns a success message when the task is removed.

## Error Response Shape

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      "title must be at least 3 characters long"
    ]
  }
}
```
