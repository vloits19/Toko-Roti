const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'rotilezat.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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

  // Check if products exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (productCount.count === 0) {
    const products = [
      {
        name: 'Roti Tawar Premium',
        price: 25000,
        description: 'Roti tawar lembut dengan tekstur empuk, cocok untuk sarapan atau sandwich. Dibuat dengan bahan berkualitas tinggi.',
        image_url: '/images/roti-tawar.jpg',
        category: 'roti tawar',
        stock: 50,
        is_featured: 1
      },
      {
        name: 'Croissant Butter',
        price: 18000,
        description: 'Croissant renyah dengan lapisan butter yang melimpah. Autentik French pastry.',
        image_url: '/images/croissant.jpg',
        category: 'pastry',
        stock: 30,
        is_featured: 1
      },
      {
        name: 'Donat Glaze',
        price: 12000,
        description: 'Donat lembut dengan glaze manis yang menggugah selera. Tersedia berbagai varian rasa.',
        image_url: '/images/donat.jpg',
        category: 'donat',
        stock: 40,
        is_featured: 1
      },
      {
        name: 'Roti Coklat Hazelnut',
        price: 22000,
        description: 'Roti lembut dengan isian coklat hazelnut yang creamy dan nikmat.',
        image_url: '/images/roti-coklat.jpg',
        category: 'roti isi',
        stock: 25,
        is_featured: 1
      },
      {
        name: 'Baguette Tradisional',
        price: 20000,
        description: 'Baguette autentik dengan kulit renyah dan bagian dalam yang lembut.',
        image_url: '/images/baguette.jpg',
        category: 'roti tawar',
        stock: 20,
        is_featured: 0
      },
      {
        name: 'Roti Keju',
        price: 28000,
        description: 'Roti dengan taburan keju melimpah, panggang sempurna dengan aroma menggoda.',
        image_url: '/images/roti-keju.jpg',
        category: 'roti isi',
        stock: 35,
        is_featured: 1
      },
      {
        name: 'Cinnamon Roll',
        price: 25000,
        description: 'Gulungan roti dengan taburan kayu manis dan glaze cream cheese.',
        image_url: '/images/cinnamon-roll.jpg',
        category: 'pastry',
        stock: 15,
        is_featured: 0
      },
      {
        name: 'Roti Kacang Merah',
        price: 20000,
        description: 'Roti tradisional dengan isian kacang merah manis yang lembut.',
        image_url: '/images/roti-kacang.jpg',
        category: 'roti isi',
        stock: 30,
        is_featured: 0
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (name, price, description, image_url, category, stock, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(product => {
      insertProduct.run(
        product.name,
        product.price,
        product.description,
        product.image_url,
        product.category,
        product.stock,
        product.is_featured
      );
    });

    console.log(`${products.length} products seeded`);
  }
}

// Initialize and seed
initDatabase();
seedData();

module.exports = db;
