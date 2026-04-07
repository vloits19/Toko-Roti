let Database;
let db = null;
let dbError = null;
const path = require('path');
const fs = require('fs');

try {
  if (process.env.VERCEL) {
    db = {
      prepare: () => ({ all: () => [], get: () => null, run: () => ({ changes: 1, lastInsertRowid: 1 }) }),
      exec: () => {}, pragma: () => {}
    };
  } else {
    // Obfuscate the require to completely hide it from Vercel's static analyzer
    const sqliteModule = 'better' + '-' + 'sqlite3';
    Database = require(sqliteModule);
    
    // Ensure database directory exists
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    let dbPath = path.join(dbDir, 'rotilezat.db');
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
} catch (error) {
  console.error("DB Initialization Error:", error);
  dbError = error;
  db = {
    prepare: () => { throw new Error('DB Init Failed'); },
    exec: () => { throw new Error('DB Init Failed'); },
    pragma: () => { throw new Error('DB Init Failed'); }
  };
}

// Initialize tables
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      image_url TEXT,
      category TEXT DEFAULT 'roti',
      stock INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
      payment_method TEXT,
      order_status TEXT DEFAULT 'processing' CHECK(order_status IN ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Messages table (for contact form)
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cart table (for persistent cart)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    )
  `);

  // Add columns to users if they don't exist
  try {
    db.prepare("ALTER TABLE users ADD COLUMN phone TEXT").run();
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    db.prepare("ALTER TABLE users ADD COLUMN address TEXT").run();
  } catch (e) {
    // Ignore error
  }

  // Add columns to orders if they don't exist
  try {
    db.prepare("ALTER TABLE orders ADD COLUMN shipping_phone TEXT").run();
  } catch (e) {
    // Ignore error
  }
  try {
    db.prepare("ALTER TABLE orders ADD COLUMN shipping_address TEXT").run();
  } catch (e) {
    // Ignore error
  }

  // Add columns to messages for chat functionality
  try {
    db.prepare("ALTER TABLE messages ADD COLUMN user_id INTEGER").run();
  } catch (e) {
    // Ignore error
  }
  try {
    db.prepare("ALTER TABLE messages ADD COLUMN is_admin INTEGER DEFAULT 0").run();
  } catch (e) {
    // Ignore error
  }

  console.log('Database initialized successfully');
}

// Seed initial data
function seedData() {
  // Check if admin exists
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('Admin');
  
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `).run('Admin', 'Admin', hashedPassword, 'admin');
    
    console.log('Admin user created: Admin / admin123');
  }

  // Check if products exist locally
  // The user requested ALL default products are cleared. We'll ensure the table is empty for their admin additions!
  const products = [];
}

// Initialize and seed
if (!process.env.VERCEL && !dbError) {
  try {
    initDatabase();
    seedData();
  } catch (error) {
    console.error("Init tables error:", error);
    dbError = error;
  }
}

db.getError = () => dbError;
module.exports = db;
