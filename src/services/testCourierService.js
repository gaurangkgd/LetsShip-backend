const { initializeDatabase } = require('../utils/database');
const {
  findNearestAvailableCourier,
  assignCourierToOrder,
  releaseCourier,
  getAllCouriers,
} = require('./courierService');

// Initialize database with sample couriers
initializeDatabase();

console.log('--- Courier Service Tests ---\n');

// Test 1: Find nearest courier for location (10, 20) with Normal delivery
console.log('Test 1: Find nearest courier for (10,20) with Normal delivery');
const nearestNormal = findNearestAvailableCourier({ x: 10, y: 20 }, 'Normal');
if (nearestNormal) {
  console.log(`Found: ${nearestNormal.name} at (${nearestNormal.location.x}, ${nearestNormal.location.y}), Distance: ${nearestNormal.distance}`);
} else {
  console.log('No courier found');
}

// Test 2: Find nearest courier for location (10, 20) with Express delivery
console.log('\nTest 2: Find nearest courier for (10,20) with Express delivery (max 15 units)');
const nearestExpress = findNearestAvailableCourier({ x: 10, y: 20 }, 'Express');
if (nearestExpress) {
  console.log(`Found: ${nearestExpress.name} at (${nearestExpress.location.x}, ${nearestExpress.location.y}), Distance: ${nearestExpress.distance}`);
} else {
  console.log('No courier found within Express range');
}

// Test 3: Assign courier to order and verify it's unavailable
console.log('\nTest 3: Assign courier to order');
try {
  const assignedCourier = assignCourierToOrder(nearestNormal.id, 'order-123');
  console.log(`Assigned ${assignedCourier.name} to order-123`);
  console.log(`Courier available status: ${assignedCourier.isAvailable}`);
  console.log(`Courier current order: ${assignedCourier.currentOrderId}`);
} catch (error) {
  console.log('Error:', error.message);
}

// Test 4: Try to assign same courier again (should fail)
console.log('\nTest 4: Try to assign same courier again (should fail)');
try {
  assignCourierToOrder(nearestNormal.id, 'order-456');
  console.log('Assignment succeeded (unexpected!)');
} catch (error) {
  console.log('Expected error:', error.message);
}

// Test 5: Release courier and verify it's available
console.log('\nTest 5: Release courier and verify availability');
try {
  releaseCourier(nearestNormal.id);
  const allCouriers = getAllCouriers();
  const releasedCourier = allCouriers.find(c => c.id === nearestNormal.id);
  console.log(`Released ${releasedCourier.name}`);
  console.log(`Courier available status: ${releasedCourier.isAvailable}`);
  console.log(`Courier current order: ${releasedCourier.currentOrderId}`);
} catch (error) {
  console.log('Error:', error.message);
}

console.log('\n--- All Tests Completed ---');
