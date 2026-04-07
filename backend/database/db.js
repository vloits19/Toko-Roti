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
    Database = require('better-sqlite3');
    
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

  // Check if products exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (productCount.count === 0) {
    const products = [
      {
        name: 'Kue Soes Kering Cokelat',
        price: 15000,
        description: 'Kue soes kering renyah dengan isian cokelat lumer yang nikmat. Camilan perfect teman ngopi.',
        image_url: '/images/kue-soes.png',
        category: 'kue kering',
        stock: 50,
        is_featured: 1
      },
      {
        name: 'Snack Barcelona',
        price: 8000,
        description: 'Snack ekstrudat kacang merek Barcelona, gurih dan renyah. Cocok untuk ngemil sehari-hari.',
        image_url: '/images/snack-barcelona.png',
        category: 'snack',
        stock: 100,
        is_featured: 1
      },
      {
        name: 'Pilus Ikan Bumbu Cikur',
        price: 5000,
        description: 'Pilus ikan renyah dengan bumbu cikur (kencur) khas yang bikin nagih. Snack tradisional favorit.',
        image_url: '/images/pilus-ikan.png',
        category: 'snack',
        stock: 80,
        is_featured: 0
      },
      {
        name: 'Kerupuk Slondok Singkong',
        price: 10000,
        description: 'Kerupuk slondok dari singkong pilihan, tipis renyah dan gurih. Oleh-oleh khas Jawa.',
        image_url: '/images/kerupuk-slondok.png',
        category: 'kerupuk',
        stock: 60,
        is_featured: 1
      },
      {
        name: 'Brem Padat Manis',
        price: 12000,
        description: 'Brem padat tradisional dari fermentasi beras ketan, manis legit. Jajanan khas Madiun.',
        image_url: '/images/brem-padat.png',
        category: 'tradisional',
        stock: 40,
        is_featured: 0
      },
      {
        name: 'Makaroni Kering Berbumbu',
        price: 10000,
        description: 'Makaroni kering yang digoreng renyah dengan bumbu pedas gurih. Snack kekinian favorit.',
        image_url: '/images/makaroni-kering.png',
        category: 'snack',
        stock: 70,
        is_featured: 1
      },
      {
        name: 'Mie Lidi Pedas',
        price: 7000,
        description: 'Jajanan mie lidi pedas dan asin, tipis renyah bikin ketagihan. Camilan legendaris anak sekolah.',
        image_url: '/images/mie-lidi.png',
        category: 'snack',
        stock: 90,
        is_featured: 1
      },
      {
        name: 'Mino (Mini Nopia)',
        price: 15000,
        description: 'Mini nopia isi gula merah khas Banyumas, manis legit dengan aroma khas. Oleh-oleh populer.',
        image_url: '/images/mino-nopia.png',
        category: 'tradisional',
        stock: 35,
        is_featured: 0
      },
      {
        name: 'Keripik Usus Ayam Krispi',
        price: 18000,
        description: 'Keripik usus ayam yang digoreng krispi, gurih dan renyah sempurna. Camilan protein tinggi.',
        image_url: '/images/keripik-usus.png',
        category: 'keripik',
        stock: 30,
        is_featured: 1
      },
      {
        name: 'Samosa Mini Isi Abon',
        price: 20000,
        description: 'Samosa mini kering berisi abon daging sapi yang gurih. Cocok untuk suguhan tamu atau arisan.',
        image_url: '/images/samosa-mini.png',
        category: 'kue kering',
        stock: 25,
        is_featured: 1
      },
      {
        name: 'Tahu Bulat Goreng',
        price: 5000,
        description: 'Tahu bulat goreng renyah di luar lembut di dalam. Street food viral yang selalu jadi favorit.',
        image_url: '/images/tahu-bulat.png',
        category: 'gorengan',
        stock: 100,
        is_featured: 0
      },
      {
        name: 'Keripik Tempe Magelang',
        price: 15000,
        description: 'Keripik tempe tipis khas Magelang, gurih renyah bumbu bawang. Oleh-oleh legendaris Jawa Tengah.',
        image_url: '/images/keripik-tempe.png',
        category: 'keripik',
        stock: 45,
        is_featured: 1
      },
      {
        name: 'Kacang Tanah Goreng/Oven',
        price: 12000,
        description: 'Kacang tanah pilihan digoreng atau di-oven hingga matang sempurna. Gurih alami dan sehat.',
        image_url: '/images/kacang-goreng.png',
        category: 'kacang',
        stock: 55,
        is_featured: 0
      },
      {
        name: 'Jelly Cup Inaco',
        price: 3000,
        description: 'Jelly cup Inaco berbagai rasa buah segar. Dessert praktis dan menyegarkan untuk segala usia.',
        image_url: '/images/jelly-inaco.png',
        category: 'minuman',
        stock: 200,
        is_featured: 1
      },
      {
        name: 'Permen Cokelat Batu Kerikil (Arab)',
        price: 25000,
        description: 'Permen cokelat unik berbentuk batu kerikil khas Timur Tengah. Cocok untuk hampers dan hantaran.',
        image_url: '/images/permen-arab.png',
        category: 'permen',
        stock: 30,
        is_featured: 0
      },
      {
        name: 'Keripik Tortilla (Snack Tes)',
        price: 10000,
        description: 'Keripik tortilla renyah dengan bumbu pedas. Snack modern ala western yang cocok untuk ngemil santai.',
        image_url: '/images/kerupuk-slondok.png',
        category: 'snack',
        stock: 65,
        is_featured: 0
      },
      {
        name: 'Kerupuk Gadung',
        price: 12000,
        description: 'Kerupuk gadung tradisional, renyah dan gurih khas. Jajanan pasar langka yang susah dicari.',
        image_url: '/images/kerupuk-slondok.png',
        category: 'kerupuk',
        stock: 40,
        is_featured: 0
      },
      {
        name: 'Nastar',
        price: 35000,
        description: 'Kue nastar premium isi selai nanas homemade, lembut meleleh di mulut. Wajib ada saat Lebaran.',
        image_url: '/images/kue-soes.png',
        category: 'kue kering',
        stock: 20,
        is_featured: 1
      },
      {
        name: 'Kue Putri Salju',
        price: 35000,
        description: 'Kue putri salju bertabur gula halus, lembut dan meleleh. Kue kering khas Lebaran yang timeless.',
        image_url: '/images/brem-padat.png',
        category: 'kue kering',
        stock: 20,
        is_featured: 1
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
