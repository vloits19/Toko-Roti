const db = require('../database/db');

class Order {
  static findAll() {
    return db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `).all();
  }

  static findByUserId(userId) {
    return db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `).all(userId);
  }

  static findById(id) {
    return db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `).get(id);
  }

  static create({ user_id, total_price, payment_method, shipping_phone, shipping_address }) {
    const result = db.prepare(
      `INSERT INTO orders (user_id, total_price, payment_method, shipping_phone, shipping_address) 
       VALUES (?, ?, ?, ?, ?)`
    ).run(user_id, total_price, payment_method, shipping_phone, shipping_address);
    
    return this.findById(result.lastInsertRowid);
  }

  static updateStatus(id, { payment_status, order_status }) {
    const updates = [];
    const values = [];
    
    if (payment_status) {
      updates.push('payment_status = ?');
      values.push(payment_status);
    }
    
    if (order_status) {
      updates.push('order_status = ?');
      values.push(order_status);
    }
    
    if (updates.length === 0) return null;
    
    values.push(id);
    
    db.prepare(
      `UPDATE orders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(...values);
    
    return this.findById(id);
  }

  static delete(id) {
    const result = db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Order Items
  static addOrderItem(order_id, product_id, quantity, price) {
    const result = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, price) 
       VALUES (?, ?, ?, ?)`
    ).run(order_id, product_id, quantity, price);
    
    return result.lastInsertRowid;
  }

  static getOrderItems(orderId) {
    return db.prepare(`
      SELECT oi.*, p.name as product_name, p.image_url 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `).all(orderId);
  }

  // Statistics
  static getStatistics() {
    const totalSales = db.prepare(`
      SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE payment_status = 'paid'
    `).get();
    
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    
    const pendingOrders = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'
    `).get();
    
    const todayOrders = db.prepare(`
      SELECT COALESCE(SUM(total_price), 0) as total 
      FROM orders 
      WHERE payment_status = 'paid' AND DATE(created_at) = DATE('now')
    `).get();

    return {
      total_sales: totalSales.total,
      total_orders: totalOrders.count,
      pending_orders: pendingOrders.count,
      today_sales: todayOrders.total
    };
  }
}

module.exports = Order;
