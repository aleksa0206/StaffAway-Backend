const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("ts-node").register(); // ← DODAJ OVO

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.resolve(__dirname, "src/database/migrations"),
      extension: "ts",
    },
  },
};