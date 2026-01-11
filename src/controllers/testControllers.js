const { initializeDatabase } = require('../utils/database');
const orderController = require('./orderController');
const courierController = require('./courierController');

// Initialize DB
initializeDatabase();

// Mock response
function makeMockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (obj) {
    this.body = obj;
    console.log('RESPONSE', this.statusCode || 200, JSON.stringify(obj, null, 2));
    return this;
  };
  return res;
}

(async () => {
  console.log('\n--- Test 1: Get all couriers ---');
  const req1 = {};
  const res1 = makeMockRes();
  await courierController.getAllCouriersHandler(req1, res1);

  console.log('\n--- Test 2: Create order ---');
  const createReq = {
    body: {
      pickupLocation: { x: 12, y: 22 },
      dropLocation: { x: 50, y: 60 },
      deliveryType: 'Normal',
      packageDetails: 'Books - 2kg',
    },
  };
  const createRes = makeMockRes();
  await orderController.createOrderHandler(createReq, createRes);

  const createdOrderId = createRes.body && createRes.body.order && createRes.body.order.id;

  console.log('\n--- Test 3: Get order by ID ---');
  const getReq = { params: { id: createdOrderId } };
  const getRes = makeMockRes();
  await orderController.getOrderHandler(getReq, getRes);

  console.log('\n--- Test 4: Update order state to PICKED_UP ---');
  const updateReq1 = { params: { id: createdOrderId }, body: { state: 'PICKED_UP' } };
  const updateRes1 = makeMockRes();
  await orderController.updateOrderStateHandler(updateReq1, updateRes1);

  console.log('\n--- Test 5: Invalid transition to DELIVERED (skip IN_TRANSIT) ---');
  const updateReq2 = { params: { id: createdOrderId }, body: { state: 'DELIVERED' } };
  const updateRes2 = makeMockRes();
  await orderController.updateOrderStateHandler(updateReq2, updateRes2);

  console.log('\n--- Test 6: Complete lifecycle (IN_TRANSIT -> DELIVERED) if needed ---');
  const updateReq3 = { params: { id: createdOrderId }, body: { state: 'IN_TRANSIT' } };
  const updateRes3 = makeMockRes();
  await orderController.updateOrderStateHandler(updateReq3, updateRes3);

  const updateReq4 = { params: { id: createdOrderId }, body: { state: 'DELIVERED' } };
  const updateRes4 = makeMockRes();
  await orderController.updateOrderStateHandler(updateReq4, updateRes4);

  console.log('\n--- Test 7: Show all orders ---');
  const allReq = {};
  const allRes = makeMockRes();
  await orderController.getAllOrdersHandler(allReq, allRes);

  console.log('\n--- Controller tests finished ---');
})();
