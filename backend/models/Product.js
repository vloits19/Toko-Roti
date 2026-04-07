const db = require('../database/db');

// Mock data to keep the site functioning on Vercel without a real DB
// User requested to start with empty products and build them up via Admin dashboard
let MOCK_PRODUCTS = [];
let nextProductId = 1;

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
    if (process.env.VERCEL) {
      const product = { id: nextProductId++, name, price: parseInt(price), description, image_url, category, stock: parseInt(stock), is_featured: is_featured ? 1 : 0 };
      MOCK_PRODUCTS.push(product);
      return product;
    }
    const result = db.prepare(
      `INSERT INTO products (name, price, description, image_url, category, stock, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(name, price, description, image_url, category, stock, is_featured);
    
    return this.findById(result.lastInsertRowid);
  }

  static update(id, { name, price, description, image_url, category, stock, is_featured }) {
    if (process.env.VERCEL) {
      const index = MOCK_PRODUCTS.findIndex(p => p.id == id);
      if (index !== -1) {
        MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], name, price: parseInt(price), description, image_url, category, stock: parseInt(stock), is_featured: is_featured ? 1 : 0 };
      }
      return this.findById(id);
    }
    db.prepare(
      `UPDATE products 
       SET name = ?, price = ?, description = ?, image_url = ?, category = ?, stock = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).run(name, price, description, image_url, category, stock, is_featured, id);
    
    return this.findById(id);
  }

  static delete(id) {
    if (process.env.VERCEL) {
      const initialLength = MOCK_PRODUCTS.length;
      MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id != id);
      return MOCK_PRODUCTS.length < initialLength;
    }
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static updateStock(id, quantity) {
    if (process.env.VERCEL) {
      const index = MOCK_PRODUCTS.findIndex(p => p.id == id);
      if (index !== -1) {
        MOCK_PRODUCTS[index].stock -= quantity;
        return true;
      }
      return false;
    }
    const result = db.prepare(
      'UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(quantity, id);
    
    return result.changes > 0;
  }
}

module.exports = Product;
