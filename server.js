/**
 * ============================================================================
 * Lab3_REST_API - Main Application Entrypoint
 * ----------------------------------------------------------------------------
 * Course: Backend Development Fundamentals
 * Lab: Lab 3 - Book Management REST API
 *
 * Student Details:
 *   Name: B. Vijay Nadha Reddy
 *   Registration Number: 252U1R1031
 *   Section: CSE (CORE) – 2A
 *   College: Aurora
 *   Year: II Year, Term II
 *   Faculty: Sai Siva Teja
 * ============================================================================
 */

const express = require('express');
const { getDatabase } = require('./database');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Core Middleware
// ============================================================================
// Enable CORS for local testing and Postman web agent
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> HTTP ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

// ============================================================================
// Root / Health Check Endpoint
// ============================================================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Book Management REST API (Lab3_REST_API)',
    student: {
      name: 'B. Vijay Nadha Reddy',
      registration_number: '252U1R1031',
      section: 'CSE (CORE) – 2A',
      college: 'Aurora',
      year: 'II Year, Term II',
      faculty: 'Sai Siva Teja'
    },
    endpoints: {
      'GET /books': 'List books with query parameters (search_q, order_by, order, limit, offset, min_price, max_price)',
      'GET /books/:id': 'Retrieve a specific book by ID',
      'POST /books': 'Create a new book (requires title, author, price in JSON body)',
      'PUT /books/:id': 'Update an existing book by ID (requires title, author, price in JSON body)',
      'DELETE /books/:id': 'Delete a book by ID'
    }
  });
});

// ============================================================================
// Mount Resource Routes
// ============================================================================
app.use('/books', bookRoutes);

// ============================================================================
// 404 Route Not Found Handler
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// ============================================================================
// Global Error Handler Middleware
// ============================================================================
app.use((err, req, res, next) => {
  // Catch malformed JSON syntax errors and respond with HTTP 400 instead of 500
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body.'
    });
  }

  console.error('[Unhandled Error in Express Pipeline]:', err.stack || err.message || err);
  res.status(500).json({
    success: false,
    error: 'Internal server error.',
    message: err.message || 'An unexpected error occurred.'
  });
});

// ============================================================================
// Server Bootstrap
// ============================================================================
let serverInstance = null;

async function startServer() {
  try {
    // 1. Initialize SQLite database & seed default data
    await getDatabase();
    console.log('[Database] SQLite database connected and verified successfully.');

    // 2. Start HTTP server
    serverInstance = app.listen(PORT, () => {
      console.log('============================================================');
      console.log(`  Lab3_REST_API Server is running on port ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log('  Student: B. Vijay Nadha Reddy (252U1R1031)');
      console.log('============================================================');
    });

    return serverInstance;
  } catch (error) {
    console.error('[Bootstrap Error] Failed to start server:', error.message);
    process.exit(1);
  }
}

// Automatically start if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

