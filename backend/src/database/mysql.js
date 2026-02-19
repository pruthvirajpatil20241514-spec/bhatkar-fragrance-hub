import mysql from "mysql2";

const isProduction = process.env.NODE_ENV === "production";

const db = mysql.createPool({
  host: isProduction
    ? process.env.MYSQL_ADDON_HOST
    : process.env.DB_HOST,

  user: isProduction
    ? process.env.MYSQL_ADDON_USER
    : process.env.DB_USER,

  password: isProduction
    ? process.env.MYSQL_ADDON_PASSWORD
    : process.env.DB_PASS,

  database: isProduction
    ? process.env.MYSQL_ADDON_DB
    : process.env.DB_NAME,

  port: isProduction
    ? process.env.MYSQL_ADDON_PORT
    : process.env.DB_PORT,

  ssl: isProduction ? { rejectUnauthorized: true } : false
});

export default db;
