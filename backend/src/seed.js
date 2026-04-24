const { pool } = require("./db");

async function seedShelters() {
  const countResult = await pool.query("SELECT COUNT(*)::int AS total FROM shelters;");
  const total = countResult.rows[0].total;

  if (total > 0) {
    return;
  }

  await pool.query(`
    INSERT INTO shelters (name, address, neighborhood, city, contact_phone, capacity, occupied, accepts_pets, last_updated)
    VALUES
      ('Escola Municipal Esperanca', 'Rua A, 101', 'Centro', 'Porto Alegre', '(51) 99999-1001', 120, 85, TRUE, NOW()),
      ('Ginasio Comunitario Zona Norte', 'Av. das Flores, 222', 'Sarandi', 'Porto Alegre', '(51) 99999-1002', 80, 80, FALSE, NOW()),
      ('Paroquia Sao Joao', 'Rua B, 450', 'Cristal', 'Porto Alegre', '(51) 99999-1003', 65, 27, TRUE, NOW());
  `);
}

module.exports = {
  seedShelters,
};
