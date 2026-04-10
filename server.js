const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not open database', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    painLevel TEXT NOT NULL,
    mobility TEXT NOT NULL,
    woundStatus TEXT NOT NULL,
    medsTaken TEXT NOT NULL,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/entries', (req, res) => {
  db.all('SELECT * FROM entries ORDER BY date ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load entries' });
    }
    res.json(rows);
  });
});

app.post('/api/entries', (req, res) => {
  const { date, painLevel, mobility, woundStatus, medsTaken, notes } = req.body;
  if (!date || !painLevel || !mobility || !woundStatus || !medsTaken) {
    return res.status(400).json({ error: 'Missing required entry fields' });
  }

  const stmt = db.prepare(
    'INSERT INTO entries (date, painLevel, mobility, woundStatus, medsTaken, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run([date, painLevel, mobility, woundStatus, medsTaken, notes || ''], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save entry' });
    }
    res.status(201).json({ id: this.lastID, date, painLevel, mobility, woundStatus, medsTaken, notes: notes || '' });
  });
  stmt.finalize();
});

app.get('/api/report', (req, res) => {
  db.all('SELECT * FROM entries ORDER BY date ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate report' });
    }
    const reportHeader = `CareCompanion Recovery Report\nEntries: ${rows.length}\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
    const reportBody = rows
      .map((entry, index) => `Entry ${index + 1}:\nDate: ${entry.date}\nPain: ${entry.painLevel}\nMobility: ${entry.mobility}\nWound: ${entry.woundStatus}\nMedication taken: ${entry.medsTaken}\nNotes: ${entry.notes || 'None'}\n`)
      .join('\n');
    res.json({ report: `${reportHeader}${reportBody}` });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
