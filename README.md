# Seamless ESP Integration API 🚀

## Overview

This API provides a robust solution for integrating with various Email Service Providers (ESPs), currently supporting **Mailchimp** and **GetResponse**. Built with **Node.js**, **Express**, and **Mongoose**, it allows for secure API key management, connection validation, and retrieval of audience/campaign lists from connected platforms.

## Features

- **Multi-ESP Integration**: Connect effortlessly with Mailchimp and GetResponse.
- **Secure API Key Management**: Store and validate ESP API keys with a dedicated MongoDB model.
- **Dynamic Connection Verification**: On-demand validation of API keys to ensure active and authorized connections.
- **Audience/Campaign List Retrieval**: Fetch comprehensive lists of audiences (Mailchimp) or campaigns (GetResponse) including key statistics.
- **Robust Error Handling**: Centralized error management for external API interactions and internal server issues.
- **Scalable Architecture**: Developed on Node.js and Express, designed for efficient and scalable backend operations.

## Technologies Used

| Technology | Description                                                              |
| :--------- | :----------------------------------------------------------------------- |
| Node.js    | JavaScript runtime for server-side development.                          |
| Express.js | Fast, unopinionated, minimalist web framework for Node.js.               |
| Mongoose   | MongoDB object data modeling (ODM) for Node.js.                          |
| MongoDB    | NoSQL database for flexible data storage.                                |
| Axios      | Promise-based HTTP client for making API requests.                       |
| Dotenv     | Loads environment variables from a `.env` file.                          |
| Nodemon    | Utility that monitors for changes and restarts the server automatically. |

## Getting Started

Follow these steps to set up and run the project locally.

### Installation

✨ **1. Clone the Repository:**

```bash
git clone https://github.com/sodmaq/mailcon.git
cd mailcon
```

📦 **2. Install Dependencies:**

```bash
npm install
```

### Environment Variables

Before running the application, create a `.env` file in the root directory and add the following required environment variables:

```dotenv
PORT=3000
MONGODB_URI=mongodb://localhost:27017/esp_integrations_db
```

- `PORT`: The port on which the Express server will listen.
- `MONGODB_URI`: The connection string for your MongoDB database.

### Running the Application

▶️ **Start the Server:**

To run the server in development mode (with Nodemon for auto-restarts):

```bash
npm run dev
```

To run the server in production mode:

```bash
npm start
```

## API Documentation

### Base URL

The base URL for all integration endpoints is `http://localhost:3000/api/integrations` (or your configured `PORT`).

### Endpoints

#### POST /api/integrations/esp

**Description**: Stores and validates an API key for a specified Email Service Provider (Mailchimp or GetResponse). If an integration for the provider already exists, it updates it; otherwise, it creates a new one. This also verifies the connection upon saving.

**Request**:

```json
{
  "provider": "mailchimp",
  "apiKey": "your_mailchimp_api_key-us20"
}
```

**`provider`**: `String`, required. Must be "mailchimp" or "getresponse".
**`apiKey`**: `String`, required. The API key for the chosen Email Service Provider.

**Response**:

```json
{
  "success": true,
  "message": "Mailchimp integration saved and validated successfully",
  "data": {
    "id": "65b7d9c0e5f2a1b4c3d8e7f6",
    "provider": "mailchimp",
    "isActive": true,
    "accountInfo": {
      "accountId": "your_mailchimp_account_id",
      "accountName": "Your Company Name",
      "email": "contact@yourcompany.com",
      "role": "owner"
    },
    "connectedAt": "2024-07-30T10:00:00.000Z"
  }
}
```

**Errors**:

- `400 Bad Request`: `{"success": false, "message": "Provider and API key are required"}`
- `400 Bad Request`: `{"success": false, "message": "Provider must be either \"mailchimp\" or \"getresponse\""}`
- `401 Unauthorized`: `{"success": false, "message": "Invalid API key or unauthorized access"}` (from ESP)
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

#### GET /api/integrations/esp/verify

**Description**: Verifies the active connection to a specific Email Service Provider using the stored API key.

**Request**:
`GET /api/integrations/esp/verify?provider=mailchimp`

**Query Parameters**:
**`provider`**: `String`, required. Must be "mailchimp" or "getresponse".

**Response**:

```json
{
  "success": true,
  "connected": true,
  "message": "Connection verified successfully",
  "data": {
    "provider": "mailchimp",
    "accountInfo": {
      "accountId": "your_mailchimp_account_id",
      "accountName": "Your Company Name",
      "email": "contact@yourcompany.com",
      "role": "owner"
    },
    "lastValidated": "2024-07-30T10:30:00.000Z"
  }
}
```

**Errors**:

- `400 Bad Request`: `{"success": false, "message": "Provider query parameter is required (e.g., ?provider=mailchimp or ?provider=getresponse)"}`
- `400 Bad Request`: `{"success": false, "message": "Provider must be either \"mailchimp\" or \"getresponse\""}`
- `404 Not Found`: `{"success": false, "message": "No mailchimp integration found. Please connect your account first."}`
- `401 Unauthorized`: `{"success": false, "message": "Invalid API key or unauthorized access"}` (if stored key becomes invalid)
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

#### GET /api/integrations/esp/lists

**Description**: Fetches all available audience lists (Mailchimp) or campaigns (GetResponse) from the connected Email Service Provider.

**Request**:
`GET /api/integrations/esp/lists?provider=getresponse`

**Query Parameters**:
**`provider`**: `String`, required. Must be "mailchimp" or "getresponse".

**Response (Mailchimp Example)**:

```json
{
  "success": true,
  "provider": "mailchimp",
  "count": 2,
  "lists": [
    {
      "id": "mc_list_id_1",
      "name": "Main Audience",
      "memberCount": 1500,
      "subscribedCount": 1450,
      "unsubscribedCount": 30,
      "cleanedCount": 20,
      "createdAt": "2023-01-01T10:00:00.000Z",
      "webId": 123456
    },
    {
      "id": "mc_list_id_2",
      "name": "Newsletter Subscribers",
      "memberCount": 800,
      "subscribedCount": 750,
      "unsubscribedCount": 20,
      "cleanedCount": 10,
      "createdAt": "2023-03-15T12:00:00.000Z",
      "webId": 789012
    }
  ]
}
```

**Response (GetResponse Example - Structure will differ slightly for GetResponse with additional fields like `description`, `languageCode`, `isDefault`, and more detailed `subscribersCount`, `activeSubscribers`, `unsubscribedCount`, `removedCount`, `complaintsCount`.)**:

```json
{
  "success": true,
  "provider": "getresponse",
  "count": 1,
  "lists": [
    {
      "id": "gr_campaign_id_1",
      "name": "My Email Campaign",
      "description": "General marketing list",
      "languageCode": "en",
      "isDefault": false,
      "createdAt": "2023-02-01T09:00:00.000Z",
      "subscribersCount": 1200,
      "activeSubscribers": 1150,
      "unsubscribedCount": 40,
      "removedCount": 5,
      "complaintsCount": 5
    }
  ]
}
```

**Errors**:

- `400 Bad Request`: `{"success": false, "message": "Provider query parameter is required (e.g., ?provider=mailchimp or ?provider=getresponse)"}`
- `400 Bad Request`: `{"success": false, "message": "Provider must be either \"mailchimp\" or \"getresponse\""}`
- `404 Not Found`: `{"success": false, "message": "No active mailchimp integration found. Please connect your account first."}`
- `401 Unauthorized`: `{"success": false, "message": "Invalid API key or unauthorized access"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

## Author Info

👋 Connect with the developer behind this project:

- **LinkedIn**: [Your LinkedIn Profile](inkedin.com/in/sodiq-yekini-222aa7196/)
- **Twitter**: [@yourtwitter](https://twitter.com/sod_maq)
- **Portfolio**: [yourportfolio.com](https://sodmaq.vercel.app/)

---

## Badges

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=flat-square&logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-8.x-red?style=flat-square&logo=mongoose)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
