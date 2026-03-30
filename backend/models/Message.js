const db = require('../database/db');

class Message {
  static findAll() {
    return db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  }

  static findUnread() {
    return db.prepare('SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  }

  static findByUserId(userId) {
    return db.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC').all(userId);
  }

  // Get unique conversations grouped by user_id for admin
  static getConversations() {
    return db.prepare(`
      SELECT m.user_id, m.name, m.email, 
        (SELECT message FROM messages m2 WHERE m2.user_id = m.user_id ORDER BY m2.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages m3 WHERE m3.user_id = m.user_id ORDER BY m3.created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages m4 WHERE m4.user_id = m.user_id AND m4.is_read = 0 AND m4.is_admin = 0) as unread_count
      FROM messages m
      WHERE m.user_id IS NOT NULL
      GROUP BY m.user_id
      ORDER BY last_message_at DESC
    `).all();
  }

  static create({ name, email, message, user_id = null, is_admin = 0 }) {
    const result = db.prepare(
      'INSERT INTO messages (name, email, message, user_id, is_admin) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, message, user_id, is_admin);
    
    return this.findById(result.lastInsertRowid);
  }

  static markAsRead(id) {
    const result = db.prepare(
      'UPDATE messages SET is_read = 1 WHERE id = ?'
    ).run(id);
    
    return result.changes > 0;
  }

  static delete(id) {
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static getUnreadCount() {
    return db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get();
  }
}

module.exports = Message;
