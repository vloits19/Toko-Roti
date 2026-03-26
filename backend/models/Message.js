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

  static create({ name, email, message }) {
    const result = db.prepare(
      'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)'
    ).run(name, email, message);
    
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
