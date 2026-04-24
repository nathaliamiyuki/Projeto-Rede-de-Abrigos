const express = require("express");
const { pool } = require("../db");

const router = express.Router();
const volunteerAccessKey = process.env.VOLUNTEER_ACCESS_KEY || "voluntario123";

function requireVolunteerAccess(req, res, next) {
  const providedKey = req.headers["x-volunteer-key"];
  if (!providedKey || providedKey !== volunteerAccessKey) {
    return res.status(403).json({ message: "Acesso restrito para voluntarios autorizados." });
  }
  return next();
}

router.get("/", requireVolunteerAccess, async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        requester_name AS "requesterName",
        phone,
        people_count AS "peopleCount",
        current_location AS "currentLocation",
        priority,
        notes,
        status,
        created_at AS "createdAt"
      FROM support_requests
      ORDER BY
        CASE priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
        created_at DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar solicitacoes.", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { requesterName, phone, peopleCount, currentLocation, priority, notes } = req.body;

    if (!requesterName || !peopleCount || !currentLocation || !priority) {
      return res.status(400).json({
        message: "Campos obrigatorios: requesterName, peopleCount, currentLocation, priority.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO support_requests (requester_name, phone, people_count, current_location, priority, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        requester_name AS "requesterName",
        phone,
        people_count AS "peopleCount",
        current_location AS "currentLocation",
        priority,
        notes,
        status,
        created_at AS "createdAt";
      `,
      [requesterName, phone || null, Number(peopleCount), currentLocation, priority, notes || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar solicitacao.", error: error.message });
  }
});

router.patch("/:id/status", requireVolunteerAccess, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const allowedStatus = ["aberto", "em_andamento", "atendido"];

    if (Number.isNaN(id) || !allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Informe um id valido e status entre: aberto, em_andamento, atendido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE support_requests
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        requester_name AS "requesterName",
        people_count AS "peopleCount",
        current_location AS "currentLocation",
        priority,
        status;
      `,
      [status, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Solicitacao nao encontrada." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar status.", error: error.message });
  }
});

module.exports = router;
