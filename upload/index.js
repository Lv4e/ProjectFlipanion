const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Database connection
const pool = new Pool({
  user: 'postgres',           // your Postgres username
  host: 'localhost',
  database: 'testDB', // your database
  password: 'SQLPasswortLukas2009',   // your password
  port: 5432
});

// Serve HTML at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route to get message from DB
app.get('/hello', async (req, res) => {
  try {
    const result = await pool.query('SELECT message FROM greetings LIMIT 1;');
    res.json({ message: result.rows[0].message });
  } catch (err) {
    console.error('Database query failed:', err);
    res.status(500).send('Database error');
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
