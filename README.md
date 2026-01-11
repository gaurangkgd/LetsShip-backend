# Let's Shyp Backend - Delivery Management System

## Overview
This is a REST API backend for a delivery management system that handles order creation, courier assignment, and order lifecycle tracking. The system automatically assigns the nearest available courier to incoming orders based on delivery type constraints.

## Assignment Explanation

**System Design Approach:**
Domain-driven architecture with clear separation: Models define entities, Services contain business logic (order lifecycle, courier assignment), Controllers handle HTTP, and Middleware manages cross-cutting concerns. Manhattan distance algorithm powers proximity-based auto-assignment with Express delivery 15-unit constraint.

**Concurrency Handling:**
Set-based assignment lock prevents race conditions during courier allocation. When multiple orders are created simultaneously, the lock ensures each courier is assigned to only one order. Lock timeout (100ms) prevents deadlock while simulating atomic operations in the single-threaded Node.js environment.

**Production Scalability Improvement:**
Replace in-memory Maps with Redis for distributed state management. Implement pub/sub for real-time courier updates. Add database connection pooling (PostgreSQL) for persistent storage. Deploy lock mechanism using Redis distributed locks (Redlock algorithm) to handle concurrent requests across multiple server instances in a load-balanced environment.

## Design Overview

The system implements a **domain-driven architecture** with clear separation of concerns:

1. **Auto-Assignment Logic**: When an order is created, the system finds the nearest available courier using Manhattan distance. For Express deliveries, only couriers within 15 units are eligible; Normal deliveries have no distance constraint.

2. **State Machine Enforcement**: Orders follow a strict lifecycle: `CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED/CANCELLED`. Invalid transitions are rejected with clear error messages.

3. **Concurrency Control**: A lightweight assignment lock (Set-based with 100ms timeout) prevents race conditions when multiple orders are created simultaneously, ensuring each courier is assigned to at most one active order.

4. **In-Memory Data Store**: Uses JavaScript Maps for fast O(1) lookups of orders and couriers. Data is seeded on startup with 10 couriers at random locations (0-100 coordinate space).

5. **Distance Calculation**: Manhattan distance (|Δx| + |Δy|) is used for proximity matching, providing a simple grid-based metric suitable for urban delivery routing.

6. **Input Sanitization**: Delivery types are normalized (case-insensitive), strings are trimmed, and coordinates are range-validated to prevent invalid data from entering the system.

7. **Standardized API Responses**: All endpoints return a consistent JSON envelope with `success` boolean, `data` object (on success), `error` message (on failure), and optional `message` field for additional context.

8. **Error Handling**: Three-layer approach: validation layer (input checks), service layer (business logic errors), and global error handler (unexpected exceptions). All errors return structured JSON responses.

9. **Middleware Pipeline**: Request logger → JSON parser → Route handlers → 404 handler → Error handler. Logs include timestamps for debugging and audit trails.

10. **RESTful Design**: Standard HTTP verbs (GET/POST/PATCH) with resource-based URLs. POST creates resources, PATCH updates state, GET retrieves data.

11. **Simulation Service**: Optional courier movement simulation that automatically advances order states and moves couriers toward destinations, useful for demos and testing.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Storage**: In-memory Maps (orders, couriers)
- **ID Generation**: UUID v4

## Project Structure
```
src/
├── server.js                 # Express app setup, middleware, routes
├── models/
│   ├── Order.js             # Order domain model with state management
│   └── Courier.js           # Courier domain model with availability tracking
├── services/
│   ├── orderService.js      # Order CRUD + lifecycle management
│   └── courierService.js    # Courier lookup, assignment, release
├── controllers/
│   ├── orderController.js   # Order HTTP handlers
│   └── courierController.js # Courier HTTP handlers
├── routes/
│   ├── orderRoutes.js       # Order endpoints
│   └── courierRoutes.js     # Courier endpoints
├── middleware/
│   ├── requestLogger.js     # Request/response logging
│   ├── notFoundHandler.js   # 404 handler
│   └── errorHandler.js      # Global error handler
├── utils/
│   ├── database.js          # In-memory data store initialization
│   ├── distance.js          # Manhattan distance calculator
│   └── validators.js        # Input validation & sanitization functions
├── services/
│   └── simulationService.js # Courier movement & order progression simulation
├── tests/
│   ├── testExpressDistanceLimit.js  # Express delivery constraint tests
│   └── testConcurrency.js           # Assignment lock verification tests
└── scripts/
    └── demoSimulation.js     # Demo script showing simulation in action
```

## API Endpoints

### Orders
- `POST /api/orders` - Create new order (auto-assigns courier if available)
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/state` - Update order state

### Couriers
- `GET /api/couriers` - Get all couriers
- `GET /api/couriers/:id` - Get courier by ID
- `PATCH /api/couriers/:id/location` - Update courier location

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:3000`

## API Documentation

You can test the API using:
1. **README Examples**: curl commands provided below
2. **Postman Collection**: Import `LetsShyp.postman_collection.json` into Postman for complete API testing

## Running Tests

### Express Distance Limit Test
Tests the 15-unit constraint for Express deliveries:
```bash
node src/tests/testExpressDistanceLimit.js
```

Expected results:
- ✅ Express orders within 15 units: ASSIGNED
- ✅ Express orders at exactly 15 units: ASSIGNED (edge case verified)
- ✅ Express orders beyond 15 units: UNASSIGNED
- ✅ Normal orders: ALWAYS ASSIGNED (no distance limit)

### Concurrency Test
Verifies assignment lock prevents race conditions:
```bash
node src/tests/testConcurrency.js
```

Expected results:
- ✅ Sequential assignments work correctly
- ✅ Concurrent assignments use different couriers
- ✅ No duplicate courier assignments detected

### Simulation Demo
Demonstrates courier movement and order state progression:
```bash
node src/scripts/demoSimulation.js
```

Expected behavior:
- Creates an order and assigns a courier
- Courier moves toward pickup, then toward drop location
- Order progresses: ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
- Console logs show real-time courier position and order state

## Example Usage

### Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": {"x": 10, "y": 10},
    "dropLocation": {"x": 20, "y": 20},
    "deliveryType": "Express",
    "packageDetails": {"weight": 2}
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "state": "ASSIGNED",
      "courierId": "courier-1",
      ...
    },
    "courier": {
      "id": "courier-1",
      "name": "Courier-1",
      "location": {"x": 12, "y": 11}
    }
  },
  "message": "Order created and assigned successfully"
}
```

### Update Order State
```bash
curl -X PATCH http://localhost:3000/api/orders/:id/state \
  -H "Content-Type: application/json" \
  -d '{"state": "PICKED_UP"}'
```

### Get All Couriers
```bash
curl http://localhost:3000/api/couriers
```

## Business Rules

### Order States
Valid transitions:
- `CREATED → ASSIGNED` (auto on creation if courier available)
- `ASSIGNED → PICKED_UP`
- `PICKED_UP → IN_TRANSIT`
- `IN_TRANSIT → DELIVERED`
- Any state → `CANCELLED`

### Delivery Types
- **Express**: Only couriers within 15 units (Manhattan distance) are eligible
- **Normal**: All available couriers are eligible (no distance limit)

### Courier Availability
- Couriers become unavailable when assigned to an order
- Couriers are released (become available) when order reaches terminal state (`DELIVERED` or `CANCELLED`)

## Key Features

✅ **Auto-Assignment**: Nearest courier automatically assigned on order creation  
✅ **Distance Constraints**: Express deliveries respect 15-unit limit (edge-case verified)  
✅ **State Machine**: Strict order lifecycle with validation  
✅ **Concurrency Safe**: Assignment lock prevents double-booking  
✅ **Input Sanitization**: Normalized delivery types, trimmed strings, validated coordinates  
✅ **Standardized Responses**: Consistent JSON envelope across all endpoints  
✅ **Error Handling**: Structured error responses with clear messages  
✅ **Request Logging**: Timestamped logs for debugging  
✅ **Simulation Service**: Courier movement and order progression for demos  
✅ **RESTful API**: Standard HTTP methods and status codes  
✅ **Comprehensive Tests**: Distance limits, concurrency, edge cases verified  

## Limitations & Future Enhancements

**Current Limitations**:
- In-memory storage (data lost on restart)
- Simulated concurrency lock (not production-grade)
- No authentication/authorization
- No rate limiting
- No metrics/monitoring

**Potential Enhancements**:
- Persistent database (PostgreSQL, MongoDB)
- Real-time courier tracking (WebSockets)
- Route optimization algorithms
- Authentication (JWT)
- Background job queue for notifications
- API documentation (OpenAPI/Swagger)

## License
ISC

## Author
ISTP Development Team
