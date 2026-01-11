const db = require('../utils/database');
const d = require('../utils/distance');

db.initializeDatabase();
const c = Array.from(db.couriers.values())[0];
const pickup = { x: c.location.x + 15, y: c.location.y };
console.log('courier', c.id, c.location, 'pickup', pickup, 'distance', d(c.location, pickup));
