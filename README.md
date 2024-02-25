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

## Create a New User
NOTE: For secrity reasons, in this endpoint you cannot create an ADMIN!

- HTTP Method: POST
- Endpoint: /users/
- Request Format:

```json
    {
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "password":"string",
    "confrimPassword": "string",
    "phoneNumber": "number",
  }
  
```

- Response Format:

```json
{
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
}
```

## Fetch All Users Details (ADMIN)
** NOTE: This endpoint is sensitive and can only be accessed by `authorized` users (e.g Admin)

- HTTP Method: GET
- Endpoint: /users/
- Response Format:


```json
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
```

## Fetch A Users Details (ADMIN)
** NOTE: This endpoint is sensitive and can only be accessed by `authorized` users (e.g Admin)

- HTTP Method: GET
- Endpoint: /users/:user_id
- Response Format:


```json
{
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
}
```

## Fetch My Details (Regular Users)

- HTTP Method: GET
- Endpoint: /users/me
- Response Format:

```json
{
    "_id": "string",
    "name": "string",
    "email": "string",
    "phoneNumber": "number"
}
```

## Update My Details Regular Users

- HTTP Method: PUT
- Endpoint: /users/me
- Request Format:


```json
{
    "_id": "string (optional)",
    "name": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "number (optional)"
}
```

- Response Format:

```json
{
    "_id": "string (optional)",
    "name": "string (optional)",
    "email": "string (optional)",
    "phoneNumber": "number (optional)"
}
 ``` 
  
# ACCOUNTS 

## Create a New Account

Constraints: User sending request must be authenticated.
Note: A user can have at most 1 accounts.

- HTTP Method: POST
- Endpoint: /acocunts/
- Request Format:

```json
{
    "owner": "string",
    "pin": "string (optional)",
}
```

- Response Format:

```json
{
    "owner": "string",
    "balance": 0,
    "accountNumber": "string"
}
```

## View all accounts

Constraints: User sending request must be `authorized` (e.g ADMIN).

- HTTP Method: GET
- Endpoint: /acocunts/

- Response Format:

```json
[
    {
    "owner": "string",
    "balance": 0,
    "accountNumber": "string"
    },

    {
    "owner": "string",
    "balance": 0,
    "accountNumber": "string"
    }

]
```

## View account details (REGULAR USERS)

Constraints: User sending request must be authenticated.

- HTTP Method: GET
- Endpoint: /acocunts/me

- Response Format:

```json
{
    "owner": "string",
    "balance": 0,
    "accountNumber": "string"
}
```

## View my transactions details (REGULAR USERS)

Constraints: User sending request must be authenticated.

- HTTP Method: GET
- Endpoint: /acocunts/me/transactions

- Response Format:

```json
[
    {
        "_id": "string",
        "source": "string",
        "transactionType": "string (enum)",
        "destination": "string",
        "amount": "number",
        "createdAt": "Date",
        "updatedAt": "Date"
    }
]
```

# Transactions

## DEPOSIT (REGULAR USERS)

Constraints: User sending request must be authenticated.

- HTTP Method: POST
- Endpoint: /transactions/deposit

- Request Format:

```json
{
    "destination": "string",
    "amount": "number",
    "pin": "string"

}
```

- Response Format:

```json
{
    "destination": "string",
    "amount": "number",
    "success": "boolean"
}
```

## TRANSFER (REGULAR USER)

- HTTP Method: POST
- Endpoint: /transactions/transfer

- Request Format:

```json

{
    "source": "string",
    "destination": "string",
    "amount": "number",
    "pin": "string"
}
```

- Response Format:
```json

{
    "source": "string",
    "destination": "string",
    "amount": "number",
    "success": "boolean"
}
```


---

# API Endpoints

The API includes the following endpoints:

- POST /auth/login/: Login to the system
- POST /auth/logout: Logout the current user 

- POST /users/: Create a new person.
- GET /users/: Get all the users in the system (Admin role required)
- GET /users/me: View the current user's details

- POST /accounts/: Create a new account for a user
- GET /accounts/: Get all the users in the system (Admin role required)
- GET /accounts/me: View the current user's account details
- GET /accounts/me/transactions : View the current user's account transaction details

- POST /transactions/transfer: Create a new transfer request
- POST /transactions/deposit: Create a new deposit request

---

## Sample Usage

### LOGIN 

Request:

POST /auth/login
Content-Type: application/json

Request: 
```json
{
    "email": "janesmith@example.com",
    "password": "Password456#"
}
```

Response :

Headers: Authorization : Bearer bearer_token
```json
{
    "success" : true
}
```

### CREATING A USER

Request:

POST /users
Content-Type: application/json
Authorization: Bearer bearer_token

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "johndoe@gmail.com",
  "password": "Custompass123#",
  "confrimPassword": "Custompass123#",
  "phoneNumber": "+234-9013489921"
}
```
Response:

```json
{
    "_id" : "39893fhb30023884bdg",
    "firstname": "John",
    "lastname": "Doe",
    "email": "johndoe@gmail.com",
    "phoneNumber": "+234-9013489921"
}
```

### FETCHING ALL USERS DETAILS (ADMIN authorization required)

Request:

GET /users/
Content-Type: application/json
Authorization: Bearer bearer_token


Response:

```json
[
    {
    "_id" : "34fci49304095893bcf",
    "firstname": "John",
    "lastname": "Doe",
    "email": "johndoe@gmail.com",
    "phoneNumber": "+234-9013489921"
    },
    {
    "_id": "29hhi4949834895034f",
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "janedoe@gmail.com",
    "phoneNumber": "+234-901234567"
    }
]
```

### Fetching the cuurently logged in user's details

Request:

PUT /users/me
Content-Type: application/json
Authorization: Bearer bearer_token

Response:

```json
{
    "_id": "65db8480be0e39e3421dd6a1",
    "firstname": "Jane",
    "lastname": "Smith",
    "email": "janesmith@example.com",
    "phoneNumber": "+234-9013489922",
    "isActive": true,
    "joined": "2024-02-25T18:18:40.972Z",
    "lastLogin": "2024-02-25T18:29:17.722Z"
}
```

### CREATE ACCOUNT 

POST /accounts/
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "owner": "65db95795427480fe2912d8e",
    "pin": 1234
}
```

Response :

```json
{
    "owner": "65db95795427480fe2912d8e",
    "balance": 0,
    "accountNumber: "213154321"
}
```


### VIEW CURRENTLY LOGGED IN USER ACCOUNT DETAILS

GET /accounts/me
Content-Type: application/json
Authorization: Bearer bearer_token

Request 

:
```json

{
    "owner": "65db95795427480fe2912d8e",
    "balance": 0,
    "accountNumber: "2131543271",
}

```

### VIEW ALL USERS ACCOUNT DETAILS (ADMIN AUTH REQUIRED)

GET /accounts/
Content-Type: application/json
Authorization: Bearer bearer_token

Response :

```json
[
    {
    "owner": "65db95795427480fe2912d8e",
    "balance": 1280,
    "accountNumber: "2131543271",
    },

    {
    "owner": "56db95795427976fe2912f8d",
    "balance": 2500,
    "accountNumber: "2131543271",
    }
]

```

### VIEW CURRENTLY LOGGED IN USER ACCOUNT TRANSACTION DETAILS

GET /accounts/me/transactions
Content-Type: application/json
Authorization: Bearer bearer_token

Response :

```json
[
    {
        "_id": "65db8f845427480fe2912d71",
        "source": "2152297904",
        "transactionType": "DEPOSIT",
        "destination": "2152297904",
        "amount": 239,
        "createdAt": "2024-02-25T19:05:40.281Z",
        "updatedAt": "2024-02-25T19:05:40.281Z",
        "__v": 0
    },
    {
        "_id": "65db8f845427480fe2912d71",
        "source": "2131643271",
        "transactionType": "TRANSFER",
        "destination": "2152297904",
        "amount": 250,
        "createdAt": "2024-02-25T19:05:40.281Z",
        "updatedAt": "2024-02-25T19:05:40.281Z",
        "__v": 0
    }
]

```

### CREATE A DEPOSIT 

POST /transactions/deposit
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "destination": "2116927207",
    "amount": 10000
}
```

Response : 

```json
{
    "destination": "2116927207",
    "amount": 10000,
    "success": true
}
```

### CREATE A TRANSFER

POST /transactions/transfer
Content-Type: application/json
Authorization: Bearer bearer_token

Request :

```json
{
    "source": "2116927207",
    "destination": "2152297904",
    "amount": 500,
    "pin": 1234
}
```

Response :

```json
{
    "source": "2116927207",
    "destination": "2152297904",
    "amount": 500,
    "success": true
}
```


---

## Limitations and Assumptions

- The MongoDB database connected MUST be a repilca set! This is to facilitate atomic transactions.
- This API assumes a MongoDB database is set up and accessible with a valid connection URI.
- Data validation for email and age fields is not enforced; they are optional fields.

---

## Setting Up and Deploying the API

## Prerequisites

- Node.js and npm and MongoDB should be installed on your machine. You can download and install them from the official Node.js website (https://nodejs.org). MongoDB (https://mongodb.com)

## Installation

1. Clone the repository or download the source code.

```bash
git clone <https://github.com/t-ega/Learnly-Financial-Backend>
```

2. Navigate to the project directory.

```bash
cd <learnly-financial-backend>
```

3. Install the project dependencies.
```bash
npm install
```

4. Environment Variables
Some environment variables have been set up to provide neccessary variables to the application
 see .env.example in the root directory of this folder and create a .env file with those variables


## Run the Application
To start the NestJS application locally, use the following command:

```bash
npm run start:dev
``` 
To run in development mode

```bash
npm run start
```
To run normally

## Accessing the Application

Open postman or any other application of your choice and navigate to http://localhost:3000/v1/api (or the specified port if you have configured it differently in your .env file). You should see your NestJS application running locally.


For local development, make sure you have Node.js, npm, and MongoDB installed.

For production deployment, it is essential to adhere to best practices in securing both your server and MongoDB instance. Additionally, you have the option to deploy the API using [Render](https://render.com/), a reliable cloud platform.