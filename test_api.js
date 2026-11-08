/**
 * ============================================================================
 * Lab3_REST_API - Automated Test Suite
 * ----------------------------------------------------------------------------
 * Validates all endpoints, query parameters, validation rules, and HTTP codes.
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

const { app } = require('./server');
const { getDatabase } = require('./database');

const TEST_PORT = 3001;

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('  STARTING AUTOMATED LAB3_REST_API TEST SUITE');
  console.log('============================================================\n');

  // Initialize DB
  await getDatabase();

  const server = app.listen(TEST_PORT);
  const baseUrl = `http://localhost:${TEST_PORT}`;

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ------------------------------------------------------------------------
    // Test 1: Successful GET /books
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books`);
      const body = await res.json();
      assert(res.status === 200, 'GET /books returns HTTP 200');
      assert(body.success === true, 'GET /books returns success: true');
      assert(Array.isArray(body.data) && body.data.length > 0, 'GET /books returns list of books');
      assert(body.count === body.data.length, 'GET /books returns correct count metadata');
    }

    // ------------------------------------------------------------------------
    // Test 2: Successful GET /books/:id
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books/1`);
      const body = await res.json();
      assert(res.status === 200, 'GET /books/1 returns HTTP 200');
      assert(body.success === true && body.data.id === 1, 'GET /books/1 returns book with ID 1');
      assert(typeof body.data.title === 'string', 'Book has title field');
      assert(typeof body.data.price === 'number', 'Book has numeric price field');
    }

    // ------------------------------------------------------------------------
    // Test 3: Successful POST /books
    // ------------------------------------------------------------------------
    let createdBookId;
    {
      const newBookPayload = {
        title: 'Mastering Fullstack Node.js',
        author: 'B. Vijay Nadha Reddy',
        price: 39.99
      };
      const res = await fetch(`${baseUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookPayload)
      });
      const body = await res.json();
      assert(res.status === 201, 'POST /books returns HTTP 201 Created');
      assert(body.success === true, 'POST /books returns success: true');
      assert(body.data && body.data.title === newBookPayload.title, 'Created book has matching title');
      assert(body.data.price === 39.99, 'Created book has matching price');
      createdBookId = body.data.id;
      assert(Number.isInteger(createdBookId), 'Created book has valid numeric ID');
    }

    // ------------------------------------------------------------------------
    // Test 4: Successful PUT /books/:id
    // ------------------------------------------------------------------------
    {
      const updatePayload = {
        title: 'Mastering Fullstack Node.js & Express (2nd Edition)',
        author: 'B. Vijay Nadha Reddy',
        price: 44.50
      };
      const res = await fetch(`${baseUrl}/books/${createdBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const body = await res.json();
      assert(res.status === 200, 'PUT /books/:id returns HTTP 200');
      assert(body.success === true, 'PUT /books/:id returns success: true');
      assert(body.data.title === updatePayload.title, 'PUT /books/:id updates title');
      assert(body.data.price === 44.50, 'PUT /books/:id updates price');
    }

    // ------------------------------------------------------------------------
    // Test 5: Search and Sorting
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books?search_q=JavaScript&order_by=price&order=DESC`);
      const body = await res.json();
      assert(res.status === 200, 'GET /books with search and sort returns HTTP 200');
      assert(body.data.every(b => b.title.toLowerCase().includes('javascript')), 'All returned books match search_q');
      if (body.data.length > 1) {
        assert(body.data[0].price >= body.data[1].price, 'Books sorted by price descending');
      }
    }

    // ------------------------------------------------------------------------
    // Test 6: Pagination
    // ------------------------------------------------------------------------
    {
      const resPage1 = await fetch(`${baseUrl}/books?limit=2&offset=0`);
      const bodyPage1 = await resPage1.json();
      assert(resPage1.status === 200, 'GET /books with pagination returns HTTP 200');
      assert(bodyPage1.data.length <= 2, 'Limit 2 returns at most 2 books');
      assert(bodyPage1.limit === 2 && bodyPage1.offset === 0, 'Pagination metadata matches request');

      const resPage2 = await fetch(`${baseUrl}/books?limit=2&offset=2`);
      const bodyPage2 = await resPage2.json();
      assert(resPage2.status === 200, 'GET /books page 2 returns HTTP 200');
      if (bodyPage1.data.length > 0 && bodyPage2.data.length > 0) {
        assert(bodyPage1.data[0].id !== bodyPage2.data[0].id, 'Page 1 and Page 2 contain distinct books');
      }
    }

    // ------------------------------------------------------------------------
    // Test 7: Price Range Filtering
    // ------------------------------------------------------------------------
    {
      const min = 30;
      const max = 50;
      const res = await fetch(`${baseUrl}/books?min_price=${min}&max_price=${max}`);
      const body = await res.json();
      assert(res.status === 200, 'GET /books with price filtering returns HTTP 200');
      assert(
        body.data.every(b => b.price >= min && b.price <= max),
        'All filtered books have price between min_price and max_price'
      );
    }

    // ------------------------------------------------------------------------
    // Test 8: Validation - Missing title (POST)
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'Author Without Title', price: 20 })
      });
      const body = await res.json();
      assert(res.status === 400, 'POST /books without title returns HTTP 400');
      assert(body.success === false, 'POST /books without title returns success: false');
      assert(body.error.toLowerCase().includes('title is required'), 'Error mentions title is required');
    }

    // ------------------------------------------------------------------------
    // Test 9: Validation - Missing author (POST)
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Book Without Author', price: 20 })
      });
      const body = await res.json();
      assert(res.status === 400, 'POST /books without author returns HTTP 400');
      assert(body.success === false, 'POST /books without author returns success: false');
      assert(body.error.toLowerCase().includes('author is required'), 'Error mentions author is required');
    }

    // ------------------------------------------------------------------------
    // Test 10: Validation - Invalid price (POST)
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Book with invalid price', author: 'Valid Author', price: 'not-a-number' })
      });
      const body = await res.json();
      assert(res.status === 400, 'POST /books with non-numeric price returns HTTP 400');
      assert(body.success === false, 'POST /books with non-numeric price returns success: false');
      assert(body.error.toLowerCase().includes('price'), 'Error mentions price validation issue');
    }

    // ------------------------------------------------------------------------
    // Test 11: Non-existent book ID (404)
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books/99999`);
      const body = await res.json();
      assert(res.status === 404, 'GET /books/99999 returns HTTP 404');
      assert(body.success === false, 'Non-existent book request returns success: false');
      assert(body.error.includes('99999'), '404 error mentions non-existent ID');
    }

    // ------------------------------------------------------------------------
    // Test 12: Successful DELETE /books/:id
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books/${createdBookId}`, {
        method: 'DELETE'
      });
      const body = await res.json();
      assert(res.status === 200, 'DELETE /books/:id returns HTTP 200');
      assert(body.success === true, 'DELETE /books/:id returns success: true');

      // Verify deletion by attempting to GET the deleted book
      const checkRes = await fetch(`${baseUrl}/books/${createdBookId}`);
      assert(checkRes.status === 404, 'GET after DELETE returns HTTP 404');
    }

    // ------------------------------------------------------------------------
    // Test 13: Invalid book ID format (400)
    // ------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/books/invalid-id-format`);
      const body = await res.json();
      assert(res.status === 400, 'GET /books/invalid-id-format returns HTTP 400');
      assert(body.success === false, 'Invalid ID returns success: false');
    }

    console.log('\n============================================================');
    console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('============================================================\n');
  } finally {
    server.close();
  }
}

runTestSuite().catch((err) => {
  console.error('\n[Test Suite Failed]:', err);
  process.exit(1);
});

