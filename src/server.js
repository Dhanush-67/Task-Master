require("dotenv").config();

const app = require("./app");
const { initializeDatabase } = require("./db/init");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Task Master server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
