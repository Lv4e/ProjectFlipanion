const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',          // your Postgres username
  host: 'localhost',
  database: 'testDB',// your database name
  password: 'SQLPasswortLukas2009',  // your Postgres password
  port: 5432
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connection successful:', res.rows);
  }
  pool.end();
});
