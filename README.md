# Lab 3: REST API, Query Parameters, Validation and Debugging

**Course**: Backend Development Fundamentals  
**Academic Year**: II Year, Term II  
**Institution**: Aurora  
**Department**: Computer Science and Engineering  

---

### Student Information

| Detail | Student Information |
| :--- | :--- |
| **Student Name** | B. Vijay Nadha Reddy |
| **Registration Number** | 252U1R1031 |
| **Section** | CSE (CORE) – 2A |
| **College** | Aurora |
| **Course** | Backend Development Fundamentals |
| **Year & Term** | II Year, Term II |
| **Faculty In-Charge** | Sai Siva Teja |

---

## 1. Project Introduction

The **`Lab3_REST_API`** project is an enterprise-structured, production-grade Book Management RESTful Web Service developed using **Node.js**, **Express.js**, and an embedded **SQLite** relational database. 

The API adheres to the architectural principles of Roy Fielding's REST design, utilizing plural noun-based endpoints (`/books`, `/books/:id`), standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), consistent JSON responses, strict server-side input validation, defense-in-depth SQL injection prevention via parameterized queries, and defensive error handling.

The service manages a catalog of technical books, persisting records with auto-incrementing integer identifiers, string titles, authors, floating-point prices, and ISO creation timestamps.

---

## 2. Objectives

1. **RESTful Architecture**: Design and build clean, predictable endpoints using nouns rather than action verbs.
2. **Database Integration**: Connect and operate an embedded SQLite database using modern asynchronous JavaScript (`async`/`await`).
3. **Advanced Filtering & Sorting**: Implement SQL `LIKE` partial title searching, multi-column sorting (ASC/DESC), and price range bounding.
4. **Pagination**: Support scalable data retrieval with `limit` and `offset` query parameters.
5. **Data Integrity & Validation**: Validate incoming payloads for required fields, correct types, and value boundaries, rejecting malformed inputs with HTTP `400 Bad Request`.
6. **SQL Injection Defense**: Use 100% parameterized queries and safe column/order allowlists.
7. **Systematic Debugging**: Analyze and document real-world backend defects (`EADDRINUSE`, `MODULE_NOT_FOUND`, SQLite table typos, and Promise serialization leaks).
8. **Automated & Manual Verification**: Validate endpoints using Postman and an automated test suite.

---

## 3. Technologies Used

- **Node.js** (v20+): High-performance asynchronous, event-driven JavaScript runtime engine.
- **Express.js** (v4.21+): Minimalist web application framework providing routing and middleware pipelines.
- **SQLite3** (v5.1+) & **`sqlite`** (v5.1+): Lightweight, serverless relational database engine with Promise-based asynchronous driver wrappers.
- **JavaScript (ES6+)**: Modern syntax utilizing `async`/`await`, destructuring, arrow functions, and native `fetch`.
- **Postman**: API development, manual inspection, and testing platform.

---

## 4. Project Folder Structure

```text
Lab3_REST_API/
│
├── .gitignore                                # Excludes node_modules, .env, and log files
├── package.json                              # Project manifest, scripts, and dependencies
├── package-lock.json                         # Deterministic dependency lockfile
├── database.js                               # SQLite configuration, schema creation & auto-seeding
├── server.js                                 # Express application setup, middleware & server bootstrap
├── test_api.js                               # Automated verification suite (44 test assertions)
├── Lab3_REST_API.postman_collection.json     # Pre-configured Postman collection (12 test requests)
├── LAB_REPORT.md                             # Comprehensive formal academic laboratory report
│
├── routes/
│   └── bookRoutes.js                         # REST controllers, input validators & SQL queries
│
├── debugging_exercises/                      # Standalone, executable demonstration scripts
│   ├── 01_eaddrinuse_port_conflict.js        # Port collision detection and fallback handler
│   ├── 02_wrong_import_path.js               # CommonJS relative path traversal (MODULE_NOT_FOUND)
│   ├── 03_sqlite_table_typo.js               # SQLITE_ERROR no such table resolution
│   └── 04_missing_await.js                   # Promise serialization trap and async resolution
│
└── screenshots/                              # Directory for captured Postman test screenshots
    └── .gitkeep                              # Tracks folder structure in version control
```

---

## 5. Installation and Execution Steps

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x or v10.x+)

### Setup Instructions

1. **Navigate to the Project Folder**:
   ```powershell
   cd c:\Users\bvija\OneDrive\Desktop\DIGITAL-CLOCK\c++\Lab3_REST_API
   ```

2. **Install Dependencies**:
   ```powershell
   npm install
   ```
   *Installs `express`, `sqlite3`, and `sqlite`.*

3. **Start the API Server**:
   ```powershell
   npm start
   ```
   *Outputs startup banner and begins listening on port 3000:*
   ```text
   [Database] SQLite database connected and verified successfully.
   ============================================================
     Lab3_REST_API Server is running on port 3000
     URL: http://localhost:3000
     Student: B. Vijay Nadha Reddy (252U1R1031)
   ============================================================
   ```

4. **Run the Automated Test Suite (44 Assertions)**:
   ```powershell
   npm test
   ```

5. **Run Individual Debugging Exercises**:
   ```powershell
   npm run exercise:eaddrinuse     # Exercise 1: Port Conflict
   npm run exercise:import         # Exercise 2: Wrong Import Path
   npm run exercise:typo           # Exercise 3: SQLite Table Typo
   npm run exercise:await          # Exercise 4: Missing Await
   ```

---

## 6. API Endpoints with HTTP Methods

All routes use resource-oriented nouns prefixed under `/books`:

| HTTP Method | Endpoint | Description | Expected Status |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Root API health status, student details, and route directory | `200 OK` |
| `GET` | `/books` | Retrieve list of books with search, sort, filter, and pagination | `200 OK` |
| `GET` | `/books/:id` | Retrieve single book by primary key ID | `200 OK` |
| `POST` | `/books` | Insert a new book record (requires JSON body) | `201 Created` |
| `PUT` | `/books/:id` | Update an existing book record by ID (requires JSON body) | `200 OK` |
| `DELETE` | `/books/:id` | Remove a book record by ID | `200 OK` |

---

## 7. Query Parameters (`GET /books`)

The `GET /books` endpoint supports the following optional query parameters for data filtering, sorting, and pagination:

| Parameter | Type | Default | Description | Example Usage |
| :--- | :--- | :---: | :--- | :--- |
| `search_q` | String | *none* | Partial title search using SQL `LIKE ?` (`%search_q%`) | `?search_q=JavaScript` |
| `order_by` | String | `'id'` | Column to sort by: `'title'`, `'price'`, `'id'`, `'author'`, `'created_at'` | `?order_by=price` |
| `order` | String | `'ASC'` | Sort direction: `'ASC'` (Ascending) or `'DESC'` (Descending) | `?order=DESC` |
| `limit` | Integer | `10` | Maximum number of book records returned per page | `?limit=5` |
| `offset` | Integer | `0` | Number of book records to skip from the beginning | `?offset=10` |
| `min_price`| Number | *none* | Minimum price boundary filter (`price >= min_price`) | `?min_price=25.00` |
| `max_price`| Number | *none* | Maximum price boundary filter (`price <= max_price`) | `?max_price=60.00` |

### Combined Parameter Query Example
```http
GET http://localhost:3000/books?search_q=Programmer&min_price=20&max_price=50&order_by=price&order=DESC&limit=5&offset=0
```

---

## 8. Request Validation and Error Handling

### 8.1 Payload Validation (`POST /books` & `PUT /books/:id`)
Every incoming payload is validated in [`routes/bookRoutes.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/routes/bookRoutes.js) prior to executing database queries:
- **`title`**: Must be provided, must be a string, and cannot be empty or purely whitespace.
- **`author`**: Must be provided, must be a string, and cannot be empty or purely whitespace.
- **`price`**: Must be provided, cannot be a boolean, must evaluate to a valid finite number, and must be non-negative ($\ge 0$).

### 8.2 Parameter Validation
- **`:id` parameter**: Must parse to a positive non-zero integer. Non-integer values (e.g., `/books/abc`) trigger `400 Bad Request`.
- **`order_by` parameter**: Validated against a strict server allowlist (`title`, `price`, `id`, `author`, `created_at`) to eliminate SQL injection vulnerabilities.
- **`order` parameter**: Must be case-insensitively equal to either `ASC` or `DESC`.
- **`min_price` / `max_price`**: Must be non-negative numeric values; `min_price` cannot exceed `max_price`.

### 8.3 Error Response Schema
All error responses maintain a uniform JSON structure:
```json
{
  "success": false,
  "error": "Descriptive human-readable error message explaining why the request failed."
}
```

---

## 9. HTTP Status Codes

The API strictly implements semantic RFC HTTP status codes:

| HTTP Status Code | Meaning | When Returned by the API |
| :---: | :--- | :--- |
| **`200 OK`** | Standard Success | Successful `GET` queries, successful `PUT` updates, and successful `DELETE` operations. |
| **`201 Created`** | Resource Created | Successful `POST /books` requests. Returns created book object with assigned primary ID. |
| **`400 Bad Request`** | Client Validation Error | Missing title, missing author, non-numeric price, negative price, malformed ID parameter, or invalid query options. |
| **`404 Not Found`** | Resource Not Found | Querying, updating, or deleting a book ID that does not exist in SQLite (`books/99999`), or requesting an unmapped URL. |
| **`500 Internal Server Error`** | Server-Side Exception | Unhandled runtime or database exceptions caught by the global error handler middleware. |

---

## 10. Postman Testing Evidence

The table below catalogs all required testing scenarios, their HTTP specifications, expected outcomes, and the corresponding target screenshot filenames to be saved in the [`screenshots/`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/screenshots/) directory.

| # | Test Scenario | Method | Request URL | Body (JSON) | Expected Status | Designated Screenshot File |
| :-: | :--- | :---: | :--- | :--- | :---: | :--- |
| 1 | **GET all books** | `GET` | `http://localhost:3000/books` | *None* | `200 OK` | `screenshots/01_get_all_books.png` |
| 2 | **POST create book** | `POST` | `http://localhost:3000/books` | `{"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "price": 47.99}` | `201 Created` | `screenshots/02_post_create_book.png` |
| 3 | **PUT update book** | `PUT` | `http://localhost:3000/books/1` | `{"title": "Clean Code (2nd Edition)", "author": "Robert C. Martin", "price": 44.00}` | `200 OK` | `screenshots/03_put_update_book.png` |
| 4 | **DELETE existing book** | `DELETE`| `http://localhost:3000/books/8` | *None* | `200 OK` | `screenshots/04_delete_existing_book.png` |
| 5 | **GET deleted book (404)** | `GET` | `http://localhost:3000/books/8` | *None* | `404 Not Found` | `screenshots/05_get_deleted_book_404.png` |
| 6 | **Search books** | `GET` | `http://localhost:3000/books?search_q=JavaScript` | *None* | `200 OK` | `screenshots/06_search_books.png` |
| 7 | **Sort books ASC & DESC** | `GET` | `http://localhost:3000/books?order_by=price&order=DESC` | *None* | `200 OK` | `screenshots/07_sort_books.png` |
| 8 | **Pagination** | `GET` | `http://localhost:3000/books?limit=2&offset=2` | *None* | `200 OK` | `screenshots/08_pagination.png` |
| 9 | **Price range filtering** | `GET` | `http://localhost:3000/books?min_price=30&max_price=50` | *None* | `200 OK` | `screenshots/09_price_filtering.png` |
| 10 | **Empty title validation**| `POST` | `http://localhost:3000/books` | `{"title": "", "author": "Robert C. Martin", "price": 35.00}` | `400 Bad Request` | `screenshots/10_empty_title_validation.png` |
| 11 | **Missing author validation**| `POST` | `http://localhost:3000/books` | `{"title": "Software Architecture", "price": 28.50}` | `400 Bad Request` | `screenshots/11_missing_author_validation.png` |
| 12 | **Invalid price validation** | `POST` | `http://localhost:3000/books` | `{"title": "Learning Microservices", "author": "Sam Newman", "price": "free_book"}` | `400 Bad Request` | `screenshots/12_invalid_price_validation.png` |
| 13 | **Missing book ID (404)** | `GET` | `http://localhost:3000/books/99999` | *None* | `404 Not Found` | `screenshots/13_missing_book_id_404.png` |

> [!TIP]
> **How to Capture Actual Screenshots**:
> 1. Launch the server (`npm start`).
> 2. Open Postman and import [`Lab3_REST_API.postman_collection.json`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/Lab3_REST_API.postman_collection.json).
> 3. Send each request and use <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> to clip the Postman response window.
> 4. Save the resulting image files into the `screenshots/` directory using the designated filenames listed above.

---

## 11. Debugging Exercises

The project includes four dedicated, executable scripts inside `debugging_exercises/` demonstrating root cause analysis and solutions.

---

### 11.1 Exercise 1: `EADDRINUSE` Port Conflict
- **Script**: [`debugging_exercises/01_eaddrinuse_port_conflict.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/debugging_exercises/01_eaddrinuse_port_conflict.js)
- **Command**: `npm run exercise:eaddrinuse`
- **Error Trace**:
  ```text
  Error: listen EADDRINUSE: address already in use :::3000
      code: 'EADDRINUSE',
      errno: -4091,
      port: 3000
  ```
- **Root Cause**: Another Node.js process (such as a previous unclosed server instance) is already bound to TCP port 3000.
- **Solution & Fix**:
  1. Identify and terminate the blocking process on Windows PowerShell:
     ```powershell
     netstat -ano | findstr :3000
     taskkill /PID <PID> /F
     ```
  2. Implement programmatic recovery by attaching an `'error'` event listener on the HTTP server to dynamically bind to a fallback port (`PORT + 1`).

---

### 11.2 Exercise 2: Wrong Import Path (`MODULE_NOT_FOUND`)
- **Script**: [`debugging_exercises/02_wrong_import_path.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/debugging_exercises/02_wrong_import_path.js)
- **Command**: `npm run exercise:import`
- **Error Trace**:
  ```text
  Error: Cannot find module './database'
  Require stack:
  - C:\...\Lab3_REST_API\routes\bookRoutes.js
  - C:\...\Lab3_REST_API\server.js
    code: 'MODULE_NOT_FOUND'
  ```
- **Root Cause**: CommonJS relative paths (`./`) are resolved relative to the directory containing the calling file (`routes/`), not the root project directory. Node searches for `routes/database.js`, which does not exist.
- **Solution & Fix**:
  Use directory traversal with `../` from inside subdirectories:
  ```javascript
  // Inside routes/bookRoutes.js
  const { getDatabase } = require('../database'); // Step up to parent root directory
  ```

---

### 11.3 Exercise 3: SQLite Table-Name Typo (`no such table`)
- **Script**: [`debugging_exercises/03_sqlite_table_typo.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/debugging_exercises/03_sqlite_table_typo.js)
- **Command**: `npm run exercise:typo`
- **Error Trace**:
  ```text
  [SQLITE_ERROR] SQL error or missing database (no such table: tbl_books_misspelled)
  code: 'SQLITE_ERROR'
  ```
- **Root Cause**: SQLite validates identifiers against the database catalog (`sqlite_master`). Misspelled table names cause immediate query parser failure.
- **Solution & Fix**:
  1. Centralize table name constants across controllers:
     ```javascript
     const TABLE_BOOKS = 'books';
     ```
  2. Ensure table creation (`CREATE TABLE IF NOT EXISTS books`) executes during server bootstrap before incoming HTTP requests are received.
  3. Inspect existing schema using `SELECT name FROM sqlite_master WHERE type='table';`.

---

### 11.4 Exercise 4: Missing `await` Keyword
- **Script**: [`debugging_exercises/04_missing_await.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/debugging_exercises/04_missing_await.js)
- **Command**: `npm run exercise:await`
- **Symptom / Behavior**:
  ```json
  {
    "success": true,
    "count": undefined,
    "data": {}
  }
  ```
- **Root Cause**: Database operations in the `sqlite` driver return asynchronous Promises. Omitting `await` assigns `Promise { <pending> }` to the variable. `JSON.stringify` serializes unresolved Promises as `{}` and `books.length` evaluates to `undefined`.
- **Solution & Fix**:
  Always prefix asynchronous Promise-returning database operations with `await`:
  ```javascript
  const books = await db.all('SELECT * FROM books');
  ```

---

## 12. Learning Outcomes

1. **RESTful System Design**: Gained proficiency in structuring HTTP endpoints using standard nouns, idempotent verbs (`GET`, `PUT`, `DELETE`), and non-idempotent verbs (`POST`).
2. **Database Persistence**: Learned how to configure and query an embedded SQLite database using modern asynchronous JavaScript (`async`/`await`).
3. **Cybersecurity Best Practices**: Mastered SQL injection prevention by replacing raw string concatenation with parameterized SQL queries (`?`) and strict column allowlisting.
4. **Data Validation**: Implemented defensive middleware to validate data types, presence, and numeric boundaries, returning descriptive HTTP `400` errors.
5. **Practical Debugging**: Acquired hands-on experience diagnosing socket port conflicts (`EADDRINUSE`), CommonJS path resolution errors (`MODULE_NOT_FOUND`), SQL syntax typos, and asynchronous Promise leaks.
6. **API Testing & Verification**: Developed end-to-end automated testing skills and gained practical proficiency with Postman collections.

---

## 13. Conclusion

The **`Lab3_REST_API`** project successfully fulfills all specifications outlined for Backend Development Fundamentals Lab 3. The API was built with clean separation of concerns across database configuration, routing, validation, and server orchestration. 

All 44 automated test assertions pass with 100% accuracy, verifying functional correctness across all CRUD operations, query parameter filtering, sorting, pagination, and error scenarios. The project is verified, fully documented, and ready for academic submission.
