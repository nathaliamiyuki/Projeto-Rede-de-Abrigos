const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const onlyAvailable = req.query.onlyAvailable === "true";
    const city = req.query.city;

    const values = [];
    const where = [];

    if (onlyAvailable) {
      where.push("occupied < capacity");
    }

    if (city) {
      values.push(city);
      where.push(`city ILIKE $${values.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const query = `
      SELECT
        id,
        name,
        address,
        neighborhood,
        city,
        contact_phone AS "contactPhone",
        capacity,
        occupied,
        (capacity - occupied) AS available,
        accepts_pets AS "acceptsPets",
        last_updated AS "lastUpdated"
      FROM shelters
      ${whereClause}
      ORDER BY (capacity - occupied) DESC, name ASC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar abrigos.", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, address, neighborhood, city, contactPhone, capacity, occupied, acceptsPets } = req.body;

    if (!name || !address || !neighborhood || !city || capacity === undefined) {
      return res.status(400).json({ message: "Campos obrigatorios: name, address, neighborhood, city, capacity." });
    }

    const occupiedValue = Number(occupied || 0);
    const capacityValue = Number(capacity);

    if (Number.isNaN(capacityValue) || Number.isNaN(occupiedValue) || capacityValue < occupiedValue) {
      return res.status(400).json({ message: "Capacidade invalida ou ocupacao maior que capacidade." });
    }

    const result = await pool.query(
      `
      INSERT INTO shelters (name, address, neighborhood, city, contact_phone, capacity, occupied, accepts_pets, last_updated)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, name, address, neighborhood, city, contact_phone AS "contactPhone", capacity, occupied,
                (capacity - occupied) AS available, accepts_pets AS "acceptsPets", last_updated AS "lastUpdated";
      `,
      [name, address, neighborhood, city, contactPhone || null, capacityValue, occupiedValue, Boolean(acceptsPets)]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar abrigo.", error: error.message });
  }
});

router.patch("/:id/occupancy", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { occupied } = req.body;
    const occupiedValue = Number(occupied);

    if (Number.isNaN(id) || Number.isNaN(occupiedValue) || occupiedValue < 0) {
      return res.status(400).json({ message: "ID ou ocupacao invalida." });
    }

    const result = await pool.query(
      `
      UPDATE shelters
      SET occupied = $1, last_updated = NOW()
      WHERE id = $2 AND $1 <= capacity
      RETURNING id, name, capacity, occupied, (capacity - occupied) AS available, last_updated AS "lastUpdated";
      `,
      [occupiedValue, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Abrigo nao encontrado ou ocupacao excede capacidade." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar ocupacao.", error: error.message });
  }
});

module.exports = router;
