require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const { product_id, quantity, total } = req.body;

    const result = await pool.query(
      `INSERT INTO orders (product_id, quantity, total)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [product_id, quantity, total]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT orders.*, products.name
      FROM orders
      JOIN products ON orders.product_id = products.id
      ORDER BY orders.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});