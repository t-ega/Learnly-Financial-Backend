# Learnly Finacial API Documentation

This document provides documentation for the Leanrnly Finance REST API, including request/response formats, usage examples, limitations, and setup/deployment instructions.

## Table of Contents
- [Request and Response Formats](#request-and-response-formats)
- [API Endpoints](#api-endpoints)
- [Sample Usage](#sample-usage)
- [Limitations and Assumptions](#limitations-and-assumptions)
- [Setting Up and Deploying the API](#setting-up-and-deploying-the-api)

---

## BASE URL
The base URL of the API is: https://localhost:3000/v1/api

## Authentication

All API requests require authentication using an API key. Include the API key in the Authorization header of each request as follows:

```shell
Authorization: Bearer YOUR_API_KEY
```

## Error Handling
The API follows standard HTTP status codes to indicate the success or failure of a request. In case of an error, the API will return an error response in the following format:

```json
{
    "statusCode" : "400",
    "timeStamp" : "date",
    "path" : "v1/api/endpoint",
    "response" : "A valid error response stating what happened"
}
```
The code field represents the specific error code, and the message field provides a human-readable description of the error.

# Common Error Codes
- 400 Bad Request: The request was malformed or had invalid parameters.
- 401 Unauthorized: The provided API key is invalid or missing.
- 403 Forbidden: The requested resource is forbidden for the authenticated user.
- 404 Not Found: The requested resource was not found.
- 500 Internal Server Error: An unexpected server error occurred.(Extremely Rare)

## Request and Response Formats

# USERS

### Create a New User
NOTE: For secrity reasons, in this endpoint you cannot create an ADMIN!

- HTTP Method: POST
- Endpoint: /users/
- Request Format:
    {
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "password":"string",
    "confrimPassword": "string",
    "phoneNumber": "number",
  }
  

- Response Format:
{
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
}
  

### Fetch All Users Details (ADMIN)
** NOTE: This endpoint is sensitive and can only be accessed by `authorized` users (e.g Admin)

- HTTP Method: GET
- Endpoint: /users/
- Response Format:

[
    {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
    },

    {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
    }
  
]

### Fetch A Users Details (ADMIN)
** NOTE: This endpoint is sensitive and can only be accessed by `authorized` users (e.g Admin)

- HTTP Method: GET
- Endpoint: /users/:user_id
- Response Format:

{
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
}
  

### Fetch My Details (Regular Users)

- HTTP Method: GET
- Endpoint: /users/me
- Response Format:

{
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
}
  

### Update My Details Regular Users

- HTTP Method: PUT
- Endpoint: /users/me
- Request Format:

{
    "_id": "string (optional)",
    "name": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "number (optional)"
}
  

- Response Format:
{
    "_id": "string (optional)",
    "name": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "number (optional)"
}
  
  
# ACCOUNTS 

- HTTP Method: PUT
- Endpoint: /users/me
- Request Format:

{
    "_id": "string (optional)",
    "name": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "number (optional)"
}
  

- Response Format:
{
    "_id": "string (optional)",
    "name": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "number (optional)"
}

---

## API Endpoints

The API includes the following endpoints:

- POST /api: Create a new person.
- GET /api/:user_id: Fetch details of a person by ID.
- PUT /api/:user_id: Update the details of an existing person by ID.
- DELETE /api/:user_id: Remove a person by ID.

---

## Sample Usage

### Creating a New Person

Request:

POST /api
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

Response:

{
  "_id": "unique_id",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

### Fetching Person Details

Request:

GET /api/unique_id

Response:

{
  "_id": "unique_id",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

### Updating Person Details

Request:

PUT /api/unique_id
Content-Type: application/json

{
  "age": 31
}

Response:

{
  "_id": "unique_id",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 31
}

### Deleting a Person

Request:

DELETE /api/unique_id

Response:

{
  "message": "Person deleted successfully"
}

---

## Limitations and Assumptions

- This API assumes a MongoDB database is set up and accessible with a valid connection URI.
- Data validation for email and age fields is not enforced; they are optional fields.

---

## Setting Up and Deploying the API

Follow the setup and deployment instructions in the [README.md](README.md) file of the project repository.

For local development, make sure you have Node.js, npm, and MongoDB installed.

For production deployment, it is essential to adhere to best practices in securing both your server and MongoDB instance. Additionally, you have the option to deploy the API using [Render](https://render.com/), a reliable cloud platform.