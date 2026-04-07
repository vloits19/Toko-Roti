const db = require('../database/db');

// Mock data to keep the site functioning on Vercel without a real DB
const MOCK_PRODUCTS = [
  { id: 1, name: 'Kue Soes Kering Cokelat', price: 15000, description: 'Kue soes kering renyah dengan isian cokelat lumer yang nikmat. Camilan perfect teman ngopi.', image_url: '/images/kue-soes.png', category: 'kue kering', stock: 50, is_featured: 1 },
  { id: 2, name: 'Snack Barcelona', price: 8000, description: 'Snack ekstrudat kacang merek Barcelona, gurih dan renyah. Cocok untuk ngemil sehari-hari.', image_url: '/images/snack-barcelona.png', category: 'snack', stock: 100, is_featured: 1 },
  { id: 3, name: 'Pilus Ikan Bumbu Cikur', price: 5000, description: 'Pilus ikan renyah dengan bumbu cikur (kencur) khas yang bikin nagih. Snack tradisional favorit.', image_url: '/images/pilus-ikan.png', category: 'snack', stock: 80, is_featured: 0 },
  { id: 4, name: 'Kerupuk Slondok Singkong', price: 10000, description: 'Kerupuk slondok dari singkong pilihan, tipis renyah dan gurih. Oleh-oleh khas Jawa.', image_url: '/images/kerupuk-slondok.png', category: 'kerupuk', stock: 60, is_featured: 1 },
  { id: 5, name: 'Brem Padat Manis', price: 12000, description: 'Brem padat tradisional dari fermentasi beras ketan, manis legit. Jajanan khas Madiun.', image_url: '/images/brem-padat.png', category: 'tradisional', stock: 40, is_featured: 0 },
  { id: 6, name: 'Makaroni Kering Berbumbu', price: 10000, description: 'Makaroni kering yang digoreng renyah dengan bumbu pedas gurih. Snack kekinian favorit.', image_url: '/images/makaroni-kering.png', category: 'snack', stock: 70, is_featured: 1 },
  { id: 7, name: 'Mie Lidi Pedas', price: 7000, description: 'Jajanan mie lidi pedas dan asin, tipis renyah bikin ketagihan. Camilan legendaris anak sekolah.', image_url: '/images/mie-lidi.png', category: 'snack', stock: 90, is_featured: 1 },
  { id: 8, name: 'Mino (Mini Nopia)', price: 15000, description: 'Mini nopia isi gula merah khas Banyumas, manis legit dengan aroma khas.', image_url: '/images/mino-nopia.png', category: 'tradisional', stock: 35, is_featured: 0 }
];

class Product {
  static findAll() {
    if (process.env.VERCEL) return MOCK_PRODUCTS;
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  }

  static findFeatured() {
    if (process.env.VERCEL) return MOCK_PRODUCTS.filter(p => p.is_featured === 1);
    return db.prepare('SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC').all();
  }

  static findById(id) {
    if (process.env.VERCEL) return MOCK_PRODUCTS.find(p => p.id == id);
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  static findByCategory(category) {
    if (process.env.VERCEL) return MOCK_PRODUCTS.filter(p => p.category === category);
    return db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC').all(category);
  }

  static create({ name, price, description, image_url, category, stock, is_featured = 0 }) {
    if (process.env.VERCEL) return MOCK_PRODUCTS[0];
    const result = db.prepare(
      `INSERT INTO products (name, price, description, image_url, category, stock, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(name, price, description, image_url, category, stock, is_featured);
    
    return this.findById(result.lastInsertRowid);
  }

  static update(id, { name, price, description, image_url, category, stock, is_featured }) {
    db.prepare(
      `UPDATE products 
       SET name = ?, price = ?, description = ?, image_url = ?, category = ?, stock = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).run(name, price, description, image_url, category, stock, is_featured, id);
    
    return this.findById(id);
  }

  static delete(id) {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static updateStock(id, quantity) {
    const result = db.prepare(
      'UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(quantity, id);
    
    return result.changes > 0;
  }
}

module.exports = Product;
