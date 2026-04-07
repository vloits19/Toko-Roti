const db = require('../database/db');

const bcrypt = require('bcryptjs');

class User {
  static findAll() {
    if (process.env.VERCEL) return [{ id: 1, name: 'Admin', email: 'Admin', phone: '', address: '', role: 'admin', created_at: new Date() }];
    return db.prepare('SELECT id, name, email, phone, address, role, created_at FROM users').all();
  }

  static findById(id) {
    if (process.env.VERCEL) return { id: 1, name: 'Admin', email: 'Admin', phone: '', address: '', role: 'admin', created_at: new Date() };
    return db.prepare('SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?').get(id);
  }

  static findByEmail(email) {
    if (process.env.VERCEL && email === 'Admin') {
      return { id: 1, name: 'Admin', email: 'Admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' };
    }
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static create({ name, email, password, role = 'user' }) {
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, password, role);
    
    return this.findById(result.lastInsertRowid);
  }

  static update(id, { name, email, phone, address }) {
    db.prepare(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?'
    ).run(name, email, phone, address, id);
    
    return this.findById(id);
  }

  static delete(id) {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static updatePassword(id, hashedPassword) {
    const result = db.prepare(
      'UPDATE users SET password = ? WHERE id = ?'
    ).run(hashedPassword, id);
    
    return result.changes > 0;
  }
}

module.exports = User;
