# AURORA'S SCIENTIFIC, TECHNOLOGICAL AND RESEARCH ACADEMY / AURORA
## DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
### BACKEND DEVELOPMENT FUNDAMENTALS LABORATORY (II YEAR – TERM II)

---

# LAB REPORT: EXPERIMENT 3
## DESIGN & IMPLEMENTATION OF A SECURE RESTFUL API USING NODE.JS, EXPRESS, AND SQLITE

---

### STUDENT IDENTIFICATION
- **Student Name**: B. Vijay Nadha Reddy
- **University Roll / Reg. No.**: 252U1R1031
- **Branch & Section**: CSE (CORE) – 2A
- **Academic Year**: II Year, Term II
- **Faculty In-Charge**: Sai Siva Teja
- **Submission Date**: November 2026

---

## 1. AIM & OBJECTIVES

### 1.1 Aim
To design, implement, test, and document a secure, production-grade Book Management RESTful API using Node.js, Express.js framework, and SQLite database with parameterized SQL queries, robust input validation, pagination, filtering, sorting, and standardized HTTP status codes.

### 1.2 Learning Objectives
1. Understand and apply Roy Fielding's REST architectural principles using noun-based resource endpoints (`/books`, `/books/:id`).
2. Implement CRUD (Create, Read, Update, Delete) operations mapped to appropriate HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
3. Mitigate SQL Injection vulnerabilities by utilizing parameterized queries (`?` placeholders) and strict whitelist validation for dynamic ordering.
4. Implement query parameters for search (`search_q` with SQL `LIKE`), sorting (`order_by`, `order`), price range filtering (`min_price`, `max_price`), and offset-limit pagination (`limit`, `offset`).
5. Handle asynchronous I/O cleanly using JavaScript `async`/`await` and Promises.
6. Diagnose and resolve critical backend errors including `EADDRINUSE`, `MODULE_NOT_FOUND`, `SQLITE_ERROR` table-name typos, and missing `await` Promise leaks.
7. Perform API integration testing and test automation using Postman and Node.js.

---

## 2. SYSTEM REQUIREMENTS & SPECIFICATIONS

### 2.1 Hardware Requirements
- **Processor**: Intel Core i3/i5/i7 or AMD Ryzen series (64-bit)
- **RAM**: Minimum 4 GB (8 GB recommended)
- **Storage**: Minimum 500 MB free hard disk space
- **Display**: 1366 x 768 minimum resolution

### 2.2 Software Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **Runtime Environment**: Node.js v20.x or higher
- **Package Manager**: npm v10.x or higher
- **Database Engine**: SQLite 3 (embedded file-based engine)
- **API Testing Tool**: Postman v10+ / Postman Desktop Agent
- **Source Code Editor**: VS Code / Antigravity IDE

---

## 3. THEORETICAL BACKGROUND

### 3.1 REST Architecture & HTTP Verbs
Representational State Transfer (REST) is an architectural style for distributed hypermedia systems. Key constraints include:
- **Statelessness**: Each request from client to server must contain all of the information necessary to understand and complete the request.
- **Uniform Interface**: Resources are uniquely identified by URIs using nouns rather than verbs.
- **HTTP Methods Mapping**:
  - `GET`: Safe, idempotent retrieval of resource representations.
  - `POST`: Non-idempotent creation of subordinate resources (returns `HTTP 201 Created`).
  - `PUT`: Idempotent replacement or total update of the targeted resource (returns `HTTP 200 OK`).
  - `DELETE`: Idempotent removal of the targeted resource (returns `HTTP 200 OK`).

### 3.2 SQL Injection & Defense via Parameterization
SQL Injection occurs when untrusted user input is directly concatenated into SQL strings:
```javascript
// VULNERABLE CODE (DO NOT USE):
const query = `SELECT * FROM books WHERE title LIKE '%${req.query.search_q}%'`;
```
An attacker passing `' OR '1'='1` can dump the entire database or execute arbitrary commands.  
**Defense Implemented in Project**:
The application utilizes parameterized queries with bind parameters:
```javascript
// SECURE CODE:
const query = `SELECT * FROM books WHERE title LIKE ?`;
await db.all(query, [`%${search_q}%`]);
```
The SQLite database engine compiles the SQL execution plan first and treats user parameters strictly as literal data values, entirely preventing command execution attacks.

---

## 4. DATABASE SCHEMA & DESIGN

The relational data model consists of the `books` table stored in the file `books.db`:

```sql
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table Attributes Description
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each book record |
| `title` | `TEXT` | `NOT NULL` | Full book title |
| `author` | `TEXT` | `NOT NULL` | Author / creators of the book |
| `price` | `REAL` | `NOT NULL` | Retail price in dollars |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp when record was created |

---

## 5. SOURCE CODE IMPLEMENTATION

### 5.1 Database Initialization & Connection (`database.js`)
See [`database.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/database.js).  
Handles:
- SQLite connection via `sqlite3` and `sqlite` promise wrapper.
- Automatic creation of the `books` table schema if not already present.
- Automated data seeding with 8 diverse engineering books on initial startup.

### 5.2 Book REST Controllers & Validations (`routes/bookRoutes.js`)
See [`routes/bookRoutes.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/routes/bookRoutes.js).  
Implements:
- Payload validator `validateBookPayload()` enforcing title, author, and non-negative numeric price.
- Route parameter validator `validateIdParam()`.
- Search (`search_q`), Sorting (`order_by`, `order`), Price range filtering (`min_price`, `max_price`), and Pagination (`limit`, `offset`).
- Safe column allowlisting for `order_by` (`['id', 'title', 'price', 'author', 'created_at']`).
- Consistent HTTP status codes: 200, 201, 400, 404, 500.

### 5.3 Server Bootstrap & Pipeline (`server.js`)
See [`server.js`](file:///c:/Users/bvija/OneDrive/Desktop/DIGITAL-CLOCK/c++/Lab3_REST_API/server.js).  
Implements:
- Body parser middleware (`express.json()`, `express.urlencoded()`).
- Console request logging middleware (`TIMESTAMP METHOD URL -> STATUS (TIME ms)`).
- Root metadata endpoint `GET /`.
- 404 not found handler for unmapped routes.
- Global 500 error handler.
- Startup listener on port `3000`.

---

## 6. TEST CASES & EXECUTION VERIFICATION

The automated test runner (`test_api.js`) executed 44 individual assertions covering all API requirements. Below are the verified test scenarios:

| Case # | Scenario | Method | URL & Query / Body | Expected Status | Result |
| :---: | :--- | :---: | :--- | :---: | :---: |
| 1 | Retrieve all books | `GET` | `/books` | `200 OK` | **PASSED** |
| 2 | Retrieve single book | `GET` | `/books/1` | `200 OK` | **PASSED** |
| 3 | Create valid book | `POST` | `/books` (title, author, price) | `201 Created` | **PASSED** |
| 4 | Update existing book | `PUT` | `/books/:id` (updated fields) | `200 OK` | **PASSED** |
| 5 | Partial search & sort | `GET` | `/books?search_q=JavaScript&order_by=price&order=DESC` | `200 OK` | **PASSED** |
| 6 | Offset pagination | `GET` | `/books?limit=2&offset=2` | `200 OK` | **PASSED** |
| 7 | Price range filter | `GET` | `/books?min_price=30&max_price=50` | `200 OK` | **PASSED** |
| 8 | Validation: Missing title | `POST` | `/books` (missing `title`) | `400 Bad Request` | **PASSED** |
| 9 | Validation: Missing author| `POST` | `/books` (missing `author`) | `400 Bad Request` | **PASSED** |
| 10 | Validation: Invalid price | `POST` | `/books` (string price `"free"`) | `400 Bad Request` | **PASSED** |
| 11 | Non-existent ID lookup | `GET` | `/books/99999` | `404 Not Found` | **PASSED** |
| 12 | Delete existing book | `DELETE`| `/books/:id` | `200 OK` | **PASSED** |
| 13 | Verify deletion | `GET` | `/books/:id` (after DELETE) | `404 Not Found` | **PASSED** |
| 14 | Malformed ID format | `GET` | `/books/abc` | `400 Bad Request` | **PASSED** |

---

## 7. DEBUGGING CASE STUDIES

### 7.1 Case 1: `EADDRINUSE` Port Conflict
- **Terminal Trace**: `Error: listen EADDRINUSE: address already in use :::3000`
- **Root Cause**: Operating system socket layer prohibits two processes from binding to identical TCP port and address without `SO_REUSEPORT`.
- **PowerShell Remedy**:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```
- **Code Remedy**: Attach an `'error'` listener on the HTTP server to dynamically fallback to `PORT + 1`.

### 7.2 Case 2: Wrong Import Path (`MODULE_NOT_FOUND`)
- **Terminal Trace**: `Error: Cannot find module './database' code: 'MODULE_NOT_FOUND'`
- **Root Cause**: Relative imports in CommonJS evaluate relative to the directory containing the file calling `require()`. In `routes/bookRoutes.js`, `./database` searches `routes/database.js`.
- **Remedy**: Step up to parent directory using `../database`:
  ```javascript
  const { getDatabase } = require('../database');
  ```

### 7.3 Case 3: SQLite Table-Name Typo (`SQLITE_ERROR`)
- **Terminal Trace**: `Error: SQLITE_ERROR: no such table: tbl_books`
- **Root Cause**: SQLite engine validates SQL tokens against internal `sqlite_master` catalog. Discrepancies fail query parsing.
- **Remedy**: Centralize table identifiers as constants and ensure `CREATE TABLE IF NOT EXISTS` executes prior to opening route listeners.

### 7.4 Case 4: Missing `await` Keyword
- **Behavior**: Endpoint returns `{"success": true, "count": undefined, "data": {}}`.
- **Root Cause**: `sqlite` functions return Promises. Without `await`, the function does not pause. `JSON.stringify()` serializes an unresolved Promise as `{}`.
- **Remedy**: Add `await` before all database calls and wrap with `try/catch`.

---

## 8. VIVA-VOCE QUESTIONS & ANSWERS

**Q1: What makes an HTTP method idempotent? Which methods in your API are idempotent?**  
*Answer*: An HTTP method is idempotent if making multiple identical requests has the same intended effect on the server state as making a single request. In this API, `GET`, `PUT`, and `DELETE` are idempotent, whereas `POST` is non-idempotent because repeating it creates multiple duplicate book records.

**Q2: Why must dynamic column names in `ORDER BY` be whitelisted instead of passed as `?` placeholders?**  
*Answer*: SQL parameters (`?` placeholders) can only substitute for literal values (like strings, numbers, or dates), never for database identifiers such as table names or column names. Passing a column name as a parameter would cause the query to sort by a constant string literal instead of the column. Therefore, column names must be checked against an allowlist before interpolation into the SQL string.

**Q3: What is the difference between HTTP 400 and HTTP 404?**  
*Answer*: HTTP 400 (Bad Request) indicates that the server cannot process the request due to client error (e.g., malformed syntax, missing required fields, invalid data type). HTTP 404 (Not Found) indicates that the server can communicate with the client, but the specific requested resource (e.g. book ID `99999`) does not exist.

**Q4: What is the role of SQLite WAL (Write-Ahead Logging) mode?**  
*Answer*: WAL mode allows concurrent readers to continue reading from the database file without blocking writers, and writers write to a separate WAL file without blocking readers, significantly improving concurrency in web applications.

---

## 9. CONCLUSION

The `Lab3_REST_API` project has been successfully built and rigorously validated. It satisfies all functional requirements of backend REST architectural design, input validation, SQL injection mitigation via parameterized queries, sorting, filtering, and pagination. All 44 automated tests and 4 debugging scenarios passed with 100% accuracy.

