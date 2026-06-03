# 🌍 Earthquake Analytics API

A production-grade backend API built using **Node.js**, **Express.js**, **MongoDB**, and **Mongoose** for managing, analyzing, and monitoring global earthquake data.

This project demonstrates industry-standard backend development practices including:

* RESTful API Design
* MVC Architecture
* MongoDB Data Modeling
* Advanced Querying
* Aggregation Pipelines
* Authentication & Authorization
* Middleware Architecture
* Error Handling
* Validation
* Pagination
* Sorting
* Search
* Rate Limiting
* Security Best Practices

---

## 🚀 Project Overview

The Earthquake Analytics API provides a centralized system to:

* Store earthquake records
* Perform CRUD operations
* Filter earthquake data
* Search records
* Generate analytics
* Calculate statistics
* Manage user authentication
* Protect sensitive routes
* Handle large datasets efficiently

The project uses a real-world earthquake dataset containing approximately **10 years of global earthquake records**.

---

## 🛠 Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Token)
* bcrypt

### Security

* Helmet
* CORS
* Express Rate Limit

### Validation

* Express Validator

### Utilities

* dotenv
* cookie-parser
* compression
* morgan

---

## 📁 Folder Structure

```bash
src/
│
├── config/
│   └── db.js
│
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
├── validators/
├── utils/
├── helpers/
├── constants/
├── analytics/
├── scripts/
├── docs/
│
├── app.js
└── server.js
```

---

## 🏗 Architecture

The project follows the **MVC Architecture**.

### Model

Responsible for:

* MongoDB Schema
* Database Structure
* Validation Rules

### Controller

Responsible for:

* Handling Requests
* Sending Responses

### Service

Responsible for:

* Business Logic
* Database Operations

### Routes

Responsible for:

* API Endpoint Definitions

### Middleware

Responsible for:

* Authentication
* Validation
* Logging
* Error Handling

---

## 📊 Dataset Information

The application uses a global earthquake dataset containing fields such as:

```json
{
  "time": "2015-12-30T23:20:56Z",
  "latitude": 0.0229,
  "longitude": 123.8194,
  "depth": 143.05,
  "mag": 4.6,
  "magType": "mb",
  "gap": 51,
  "rms": 0.83,
  "net": "us",
  "place": "Indonesia",
  "type": "earthquake",
  "status": "reviewed"
}
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Navigate to Project Directory

```bash
cd earthquake-analytics-api
```

### Install Dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d

NODE_ENV=development
```

### Start Development Server

```bash
npm run dev
```

---

## 🔗 API Base URL

```bash
http://localhost:5000/api/v1
```

---

## 📌 Core Features

### CRUD Operations

* Create Earthquake
* Read Earthquake
* Update Earthquake
* Delete Earthquake
* Bulk Operations

### Query Features

* Filtering
* Sorting
* Pagination
* Search

### Analytics

* Magnitude Analysis
* Depth Analysis
* Country Analysis
* Monthly Analysis

### Statistics

* Total Records
* Average Magnitude
* Average Depth
* Deepest Earthquake
* Highest Magnitude

### Security

* JWT Authentication
* Password Hashing
* Route Protection
* Rate Limiting

---

## 🌍 Earthquake Routes

### CRUD APIs

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/earthquakes`     |
| GET    | `/earthquakes/:id` |
| POST   | `/earthquakes`     |
| PUT    | `/earthquakes/:id` |
| PATCH  | `/earthquakes/:id` |
| DELETE | `/earthquakes/:id` |

---

## 🔎 Filtering Examples

```http
GET /earthquakes?country=Japan

GET /earthquakes?status=reviewed

GET /earthquakes?network=us

GET /earthquakes?minMagnitude=5

GET /earthquakes?maxDepth=100
```

---

## 📄 Pagination

```http
GET /earthquakes?page=1&limit=10

GET /earthquakes?page=2&limit=20
```

Example Response:

```json
{
  "success": true,
  "totalRecords": 1000,
  "currentPage": 1,
  "totalPages": 100,
  "data": []
}
```

---

## 🔀 Sorting

```http
GET /earthquakes?sort=magnitude

GET /earthquakes?sort=depth

GET /earthquakes?sort=time
```

---

## 🔍 Search

```http
GET /search/earthquakes?q=japan

GET /search/earthquakes?q=indonesia

GET /search/earthquakes?q=reviewed
```

---

## 📈 Analytics APIs

* `/analytics/earthquakes/highest-magnitude`
* `/analytics/earthquakes/deepest`
* `/analytics/earthquakes/recent-activity`
* `/analytics/earthquakes/country-analysis`
* `/analytics/earthquakes/network-analysis`
* `/analytics/earthquakes/magnitude-analysis`
* `/analytics/earthquakes/depth-analysis`
* `/analytics/earthquakes/monthly-analysis`

---

## 📊 Statistics APIs

* `/stats/earthquakes/count`
* `/stats/earthquakes/highest-magnitude`
* `/stats/earthquakes/deepest`
* `/stats/earthquakes/average-depth`
* `/stats/earthquakes/average-magnitude`
* `/stats/earthquakes/country-count`
* `/stats/earthquakes/type-count`
* `/stats/earthquakes/network-count`
* `/stats/earthquakes/reviewed-count`
* `/stats/earthquakes/monthly-count`

---

## 🔐 Authentication APIs

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/auth/register`        |
| POST   | `/auth/login`           |
| POST   | `/auth/logout`          |
| GET    | `/auth/profile`         |
| PATCH  | `/auth/profile`         |
| POST   | `/auth/change-password` |
| POST   | `/auth/forgot-password` |
| POST   | `/auth/reset-password`  |

---

## 🛡 JWT Protected Routes

```http
GET /jwt/profile

GET /jwt/dashboard

GET /jwt/private-earthquakes

GET /jwt/private-analytics
```

Authorization Header:

```http
Authorization: Bearer <token>
```

---

## ⚡ Middleware

### Logger Middleware

Tracks:

* Request Method
* Request URL
* Timestamp

### Authentication Middleware

Verifies JWT Tokens.

### Rate Limiting Middleware

Prevents API abuse.

### Request Time Middleware

Measures API response time.

### Cache Middleware

Improves API performance.

### Global Error Middleware

Handles application-wide errors consistently.

---

## ❌ Error Handling

The API handles:

* Invalid IDs
* Validation Errors
* Unauthorized Access
* Resource Not Found
* Invalid Query Parameters
* Invalid Pagination
* Empty Search Requests
* Invalid JSON Uploads

Standard Error Response:

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": []
}
```

---

## 🚦 Rate Limiting

Implemented using:

```bash
express-rate-limit
```

Protects:

* Login APIs
* Search APIs
* Analytics APIs
* Statistics APIs
* Admin Routes

---

## ⚙️ MongoDB Features Used

### Indexing

Indexes are created on:

* magnitude
* place
* country
* status
* network
* time

### Aggregation Pipeline

Stages used:

* `$match`
* `$group`
* `$project`
* `$sort`
* `$limit`
* `$avg`
* `$sum`

---

## 📦 Dataset Import

Import earthquake dataset into MongoDB:

```bash
npm run seed
```

Seeder performs:

* JSON Parsing
* Validation
* Duplicate Prevention
* Bulk Insertion

---

## 🧪 API Testing

Testing performed using:

* Postman

Test Coverage:

* CRUD APIs
* Authentication APIs
* Protected Routes
* Analytics APIs
* Validation Logic

---

## 🔒 Security Measures

* JWT Authentication
* Password Hashing using bcrypt
* Helmet Security Headers
* CORS Configuration
* Environment Variables
* Rate Limiting
* Input Validation

---

## 🚀 Future Enhancements

* Redis Caching
* Docker Support
* Swagger Documentation
* CI/CD Pipeline
* Microservices Architecture
* Elasticsearch Integration
* Kafka Event Streaming

---

## 👨‍💻 Author

**Kshitij Pandey**

MERN Stack Developer | Backend Developer

---

## 📄 License

This project is developed for educational, learning, and portfolio purposes.
