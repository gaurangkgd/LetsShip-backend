const calculateDistance = require('./distance');
const {
  validateLocation,
  validateDeliveryType,
  validateStateTransition,
} = require('./validators');

console.log('--- calculateDistance test ---');
const d = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
console.log('Distance between (0,0) and (3,4):', d); // expect 7

console.log('\n--- validateLocation tests ---');
console.log('Valid location {x:1,y:2}:', validateLocation({ x: 1, y: 2 }));
console.log("Invalid location {x:'a'}:", validateLocation({ x: 'a' }));
console.log('Invalid location null:', validateLocation(null));

console.log('\n--- validateDeliveryType tests ---');
console.log("'Express':", validateDeliveryType('Express'));
console.log("'Normal':", validateDeliveryType('Normal'));
console.log("'Invalid':", validateDeliveryType('Invalid'));

console.log('\n--- validateStateTransition tests ---');
console.log('CREATED -> ASSIGNED (valid):', validateStateTransition('CREATED', 'ASSIGNED'));
console.log('CREATED -> DELIVERED (invalid):', validateStateTransition('CREATED', 'DELIVERED'));
console.log('DELIVERED -> ASSIGNED (invalid terminal):', validateStateTransition('DELIVERED', 'ASSIGNED'));
