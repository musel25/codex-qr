const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const dbFile = path.join(__dirname, 'tickets.db');
const dbExists = fs.existsSync(dbFile);
const db = new sqlite3.Database(dbFile);

if (!dbExists) {
  db.serialize(() => {
    db.run(`CREATE TABLE tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'atvtms')));

// simple in-memory users for prototype
const users = { officer: 'password' };

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/tickets', (req, res) => {
  db.all('SELECT id, data, created_at FROM tickets ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ id: r.id, ...JSON.parse(r.data), created_at: r.created_at })));
  });
});

app.post('/api/tickets', (req, res) => {
  const data = req.body;
  db.run('INSERT INTO tickets (data) VALUES (?)', [JSON.stringify(data)], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
