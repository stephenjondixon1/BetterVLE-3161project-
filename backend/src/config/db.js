const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,               
  port: Number(process.env.DB_PORT) || 4000,  
  user: process.env.DB_USER,               
  password: process.env.DB_PASSWORD,      
  database: process.env.DB_NAME || 'betterVLE',
  ssl: { rejectUnauthorized: true }, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

module.exports = pool;
