const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { username, password, role } = req.body || {};
  if (!username || !password || !role) return res.status(400).json({ message: 'username, password, role required' });
  try {
    const table = role === 'OFFICER' ? 'Officers' : 'Drivers';
    const [rows] = await db.query(`SELECT id, name, username, password FROM ${table} WHERE username = ?`, [username]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, role, name: user.name });
  } catch (e) {
    return res.status(500).json({ message: 'Login failed', error: e.message });
  }
}

module.exports = { login };