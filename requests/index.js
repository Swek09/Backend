const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT,
    ip TEXT,
    email TEXT,
    phone TEXT,
    name TEXT,
    status TEXT DEFAULT 'unprocessed'
  )`);
});

app.use(express.json());

app.get('/add', (req, res) => {
  const { ip, domain, email, phone, name } = req.query;
    console.log(ip, domain, email, phone, name)
  if (!domain || !ip || !email || !phone || !name) {
    return res.status(400).send('Все поля (domain, ip, email, phone, name) обязательны.');
  }

  const stmt = db.prepare(`INSERT INTO requests (domain, ip, email, phone, name) VALUES (?, ?, ?, ?, ?)`);
  stmt.run(domain, ip, email, phone, name, function(err) {
    if (err) {
      return res.status(500).send('Ошибка при добавлении данных в базу.');
    }
    res.send('Данные успешно добавлены.');
  });
  stmt.finalize();
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
