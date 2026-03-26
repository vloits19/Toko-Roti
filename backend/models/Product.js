const db = require('../database/db');

class Product {
  static findAll() {
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  }

  static findFeatured() {
    return db.prepare('SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  static findByCategory(category) {
    return db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC').all(category);
  }

  static create({ name, price, description, image_url, category, stock, is_featured = 0 }) {
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
