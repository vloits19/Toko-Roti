const db = require('../database/db');

class Cart {
  static findByUserId(userId) {
    return db.prepare(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).all(userId);
  }

  static findItem(userId, productId) {
    return db.prepare(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?'
    ).get(userId, productId);
  }

  static addItem(userId, productId, quantity = 1) {
    const existingItem = this.findItem(userId, productId);
    
    if (existingItem) {
      db.prepare(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?'
      ).run(quantity, userId, productId);
    } else {
      db.prepare(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)'
      ).run(userId, productId, quantity);
    }
    
    return this.findByUserId(userId);
  }

  static updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }
    
    db.prepare(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?'
    ).run(quantity, userId, productId);
    
    return this.findByUserId(userId);
  }

  static removeItem(userId, productId) {
    db.prepare(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?'
    ).run(userId, productId);
    
    return this.findByUserId(userId);
  }

  static clearCart(userId) {
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(userId);
    return true;
  }

  static getCartTotal(userId) {
    const result = db.prepare(`
      SELECT COALESCE(SUM(c.quantity * p.price), 0) as total 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).get(userId);
    
    return result.total;
  }
}

module.exports = Cart;
