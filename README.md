<p align="center">
  <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="NestJS Logo" />
</p>

# NestJS CRUD Project

A backend project built with [NestJS](https://nestjs.com/), featuring CRUD operations, JWT authentication, TypeORM, TypeScript, and automated tests.

## Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Main Endpoints](#main-endpoints)
- [Usage Examples](#usage-examples)

## About the Project

This project is a RESTful API developed with NestJS, TypeORM, and PostgreSQL, focused on CRUD operations for users and messages, with JWT authentication, image upload, and automated (unit and e2e) tests.

## Features
- User CRUD
- CRUD for messages between users
- JWT authentication (login and refresh)
- Profile picture upload
- Validations using class-validator
- Security with Helmet
- Message pagination
- Unit and integration tests (Jest)

## Installation

```bash
# Clone the repository
git clone <your-repo>.git
cd nestjs-crud

# Install dependencies
npm install
```

## Running the Project

```bash
# Development environment
npm run start:dev

# Production environment
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# End-to-end tests
npm run test:e2e
```

## Main Endpoints

### Authentication
- `POST /auth` — Login (returns accessToken and refreshToken)
- `POST /auth/refresh` — Token refresh

### Users
- `POST /users` — Create user
- `GET /users` — List users (requires JWT)
- `GET /users/:id` — Get user details (requires JWT)
- `PATCH /users/:id` — Update user (requires JWT)
- `DELETE /users/:id` — Delete user (requires JWT)
- `POST /users/upload-picture` — Upload profile picture (requires JWT)

### Messages
- `GET /messages` — List messages (with pagination)
- `GET /messages/:id` — Get message details
- `POST /messages` — Send message (requires JWT)
- `PATCH /messages/:id` — Update message (requires JWT)
- `DELETE /messages/:id` — Delete message (requires JWT)

## Usage Examples

### Login
```http
POST /auth
Content-Type: application/json
{
  "email": "user@email.com",
  "password": "123456"
}
```

### Create User
```http
POST /users
Content-Type: application/json
{
  "email": "user@email.com",
  "password": "123456",
  "name": "User"
}
```

### Send Message
```http
POST /messages
Authorization: Bearer <accessToken>
Content-Type: application/json
{
  "toId": 2,
  "text": "Hello!"
}
```

---

> Project developed by Fernando Hiroshi
