const db = require('./database/db');
const bcrypt = require('bcryptjs');

// Delete all orders & cart to make it a fresh state. 
db.prepare('DELETE FROM order_items').run();
db.prepare('DELETE FROM orders').run();
db.prepare('DELETE FROM cart').run();

// Delete old admin and insert new admin
db.prepare('DELETE FROM users WHERE email = ?').run('admin@rotilezat.com');
db.prepare('DELETE FROM users WHERE email = ?').run('Admin');

const hashedPassword = bcrypt.hashSync('admin123', 10);
db.prepare(`
    INSERT INTO users (name, email, password, role) 
    VALUES (?, ?, ?, ?)
`).run('Admin', 'Admin', hashedPassword, 'admin');

console.log('DB updated correctly');
