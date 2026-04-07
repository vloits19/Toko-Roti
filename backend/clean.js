const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'rotilezat.db');
const db = new Database(dbPath);

console.log('Disabling foreign keys temporarily...');
db.pragma('foreign_keys = OFF');

console.log('Clearing old products from local database...');
const res1 = db.prepare('DELETE FROM cart').run();
const res2 = db.prepare('DELETE FROM order_items').run();
const res3 = db.prepare('DELETE FROM products').run();

db.pragma('foreign_keys = ON');

console.log(`Deleted ${res3.changes} products, ${res1.changes} cart items, ${res2.changes} order items.`);
