const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "enchente_db",
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shelters (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      address VARCHAR(255) NOT NULL,
      neighborhood VARCHAR(120) NOT NULL,
      city VARCHAR(120) NOT NULL,
      contact_phone VARCHAR(30),
      capacity INTEGER NOT NULL CHECK (capacity >= 0),
      occupied INTEGER NOT NULL DEFAULT 0 CHECK (occupied >= 0),
      accepts_pets BOOLEAN NOT NULL DEFAULT FALSE,
      last_updated TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_requests (
      id SERIAL PRIMARY KEY,
      requester_name VARCHAR(120) NOT NULL,
      phone VARCHAR(30),
      people_count INTEGER NOT NULL CHECK (people_count > 0),
      current_location VARCHAR(255) NOT NULL,
      priority VARCHAR(20) NOT NULL CHECK (priority IN ('baixa', 'media', 'alta')),
      notes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'atendido')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = {
  pool,
  initializeDatabase,
};
