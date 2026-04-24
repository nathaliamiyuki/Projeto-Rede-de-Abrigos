const dotenv = require("dotenv");
const app = require("./app");
const { initializeDatabase } = require("./db");
const { seedShelters } = require("./seed");

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

async function startServer() {
  try {
    await initializeDatabase();
    await seedShelters();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();
