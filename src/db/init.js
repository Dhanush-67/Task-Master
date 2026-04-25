const fs = require("fs/promises");
const path = require("path");

const pool = require("./pool");

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, "..", "..", "db", "schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");

  await pool.query(schemaSql);
}

module.exports = {
  initializeDatabase
};
