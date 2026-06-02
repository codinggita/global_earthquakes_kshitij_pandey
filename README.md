# Global Earthquake Analytics API

A production-grade, highly scalable REST API backend built using Node.js, Express.js, MongoDB, and Mongoose. This project handles a dataset spanning 10 years of global earthquake records (magnitude 4.5+), incorporating enterprise features like custom role-based authentication, complex analytics pipelines, structured error handling, secure middleware layers, caching, and rate-limiting.

---

## 🏗️ Architectural Plan & Directory Structure

The project strictly follows a scalable **MVC (Model-View-Controller)** pattern adapted for clean API design. Here is the layout of our workspace:

```text
src/
│
├── config/             # Config variables loader & environments setup (dotenv, CORS, database, limits)
├── controllers/        # Route controllers (handles incoming requests, parses, maps to services, sends responses)
├── models/             # Mongoose schemas, virtual fields, hooks, validations, indexes definition
├── routes/             # Express Route setup grouped by resources/components
├── middleware/         # Express custom middlewares (authentication, logging, rate limits, error mapping)
├── validators/         # Input validations using express-validator or Joi schemas
├── services/           # Business logic layer (independent of Express req/res objects for testability)
├── utils/              # Generic utility functions (custom exceptions, response formatter, token helpers)
├── helpers/            # Small helper tasks (date conversions, text matching, geocoders)
├── constants/          # Application-wide immutable parameters, status codes, and message strings
├── database/           # DB client configuration, seed scripts, indexes synchronization logic
├── scripts/            # Command-line helper scripts (e.g. JSON dataset migration and ingestion scripts)
├── analytics/          # Heavy aggregation pipe structures segregated by domain
├── logs/               # Application log outputs (Winston or Morgan file storage)
├── docs/               # API documentation (Swagger configurations or raw Markdown blueprints)
└── app.js              # Application entry point - loads configurations and hooks middleware stack
```

---

## 🗺️ Execution Roadmap (25+ Pull Request Phases)

Every phase will be implemented as an isolated, complete Pull Request (PR) following a strict production workflow.

- [ ] **PR-1**: Project Planning, Architecture Design, Environment Setup Strategy, and Scalable Backend Structure *(Current)*
- [ ] **PR-2**: Express Server & Application Setup + Standard Environment Configurations
- [ ] **PR-3**: Connection Setup with MongoDB + Connection Resiliency Management
- [ ] **PR-4**: MVC Base Directories Mapping + Health Verification Route
- [ ] **PR-5**: Earthquake Mongoose Schema, Index Declarations, and Model Layer
- [ ] **PR-6**: Bulk Dataset Importer Script with Duplicate Prevention & Memory Optimizations
- [ ] **PR-7**: Basic CRUD Operations for Earthquake Resource
- [ ] **PR-8**: Express-Validator Layer for Input Validation
- [ ] **PR-9**: Centralized Error Handling Middleware & Global Exception Captures
- [ ] **PR-10**: Reusable Async Wrapper Utility (`asyncHandler`) and Standard Response Formatter
- [ ] **PR-11**: Core Query Builder (Filtering by Year, Month, Magnitude, Depth, Network)
- [ ] **PR-12**: Limit-Offset Pagination Engine with Metadata Formatter
- [ ] **PR-13**: Dynamic Multi-Field Sorting System
- [ ] **PR-14**: Geospatial Search and Full-Text Search Routes
- [ ] **PR-15**: Analytical Pipelines Part I (Highest Magnitudes, Deepest Earthquakes, Monthly Activity Groupings)
- [ ] **PR-16**: Analytical Pipelines Part II (Country Distribution, Network Contribution, Oceanic Ratio)
- [ ] **PR-17**: User Authentication (Registration, Password Hashing, Profile Retrieval)
- [ ] **PR-18**: JWT Engine Setup (Signing, Verification, Cookie-Storage, Authorization Guard)
- [ ] **PR-19**: Dual-token System (Access Token & Refresh Tokens) with Token Rotation
- [ ] **PR-20**: RBAC (Role-Based Access Control) Middleware for Admin vs Standard Users
- [ ] **PR-21**: Global & Route-Specific Rate Limiters
- [ ] **PR-22**: In-Memory Cache Middleware for Query Results caching
- [ ] **PR-23**: Performance Request Logging & Timing Middleware
- [ ] **PR-24**: HTTP Options & Head Operations with Custom Security Headers (Helmet, CORS validation)
- [ ] **PR-25**: Advanced Production Hardening, Database Cleanups, and Final Project Deliverables

---

## 🛠️ Technology Stack & Dependencies Rationale

*   **Node.js**: Asynchronous event-driven JavaScript runtime built on Chrome's V8 engine, ideal for building scalable network applications.
*   **Express.js**: Minimalist, unopinionated framework providing robust routing and middleware capabilities.
*   **MongoDB**: Document database offering high throughput, JSON schema design compatibility, and powerful geospatial queries.
*   **Mongoose**: Object Data Modeling (ODM) library for MongoDB that manages schema relationships, schema validations, and middleware hooks.
*   **JWT & bcrypt**: Critical for stateless session control and security: bcrypt provides CPU-intensive salting/hashing, and JWT enables secure claim transmission.
*   **Morgan & Winston**: Morgan provides quick HTTP tracing, while Winston offers formatted logs partitioned by level.
*   **Express-Validator / Joi**: Enforces payload types and prevents database pollution/SQL-like injections.
*   **Helmet**: Sets various HTTP headers to defend against cross-site scripting (XSS) and clickjacking attacks.