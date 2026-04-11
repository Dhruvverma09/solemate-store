const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 5000;
const JWT_SECRET = "dhruv_solemate_xyz_2025_secret";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Database ──────────────────────────────────────────────
const db = new sqlite3.Database(path.join(__dirname, "solemate.db"), (err) => {
  if (err) { console.error("DB Error:", err.message); process.exit(1); }
  console.log("✅ Database connected");
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

// Create all tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    size INTEGER NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, product_id, size)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'confirmed',
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL DEFAULT 0,
    shipping INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL,
    promo_used TEXT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cod',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    size INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`, () => {
    console.log("✅ Tables ready");
    console.log("🚀 SoleMate server running at http://localhost:" + PORT);
  });
});

// ── Auth Middleware ───────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Please login first." });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Session expired. Please login again." }); }
}

// ── SIGNUP ────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Enter a valid email address." });
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = await run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), hashed]
    );
    const token = jwt.sign(
      { id: result.lastID, name: name.trim(), email: email.toLowerCase().trim() },
      JWT_SECRET, { expiresIn: "7d" }
    );
    res.status(201).json({ message: "Account created!", token,
      user: { id: result.lastID, name: name.trim(), email: email.toLowerCase().trim() } });
  } catch (err) {
    if (err.message.includes("UNIQUE"))
      return res.status(409).json({ error: "This email is already registered." });
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (!user) return res.status(401).json({ error: "No account found with this email." });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Incorrect password." });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET, { expiresIn: "7d" }
    );
    res.json({ message: "Logged in!", token,
      user: { id: user.id, name: user.name, email: user.email } });
  } catch { res.status(500).json({ error: "Something went wrong." }); }
});

// ── ME ────────────────────────────────────────────────────
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await get("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.user.id]);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch { res.status(500).json({ error: "Something went wrong." }); }
});

// ── CART GET ──────────────────────────────────────────────
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const items = await all("SELECT * FROM cart WHERE user_id = ?", [req.user.id]);
    res.json({ items });
  } catch { res.status(500).json({ error: "Could not load cart." }); }
});

// ── CART ADD ──────────────────────────────────────────────
app.post("/api/cart", authMiddleware, async (req, res) => {
  const { product_id, name, price, image, size, qty = 1 } = req.body;
  if (!product_id || !name || !price || !size)
    return res.status(400).json({ error: "Missing product info." });
  try {
    const existing = await get(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ?",
      [req.user.id, product_id, size]
    );
    if (existing) {
      await run("UPDATE cart SET qty = qty + ? WHERE id = ?", [qty, existing.id]);
    } else {
      await run(
        "INSERT INTO cart (user_id, product_id, name, price, image, size, qty) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [req.user.id, product_id, name, price, image, size, qty]
      );
    }
    const items = await all("SELECT * FROM cart WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Added to cart!", items });
  } catch { res.status(500).json({ error: "Could not add to cart." }); }
});

// ── CART UPDATE QTY ───────────────────────────────────────
app.patch("/api/cart/:id", authMiddleware, async (req, res) => {
  const { qty } = req.body;
  if (!qty || qty < 1) return res.status(400).json({ error: "Qty must be at least 1." });
  try {
    const item = await get("SELECT * FROM cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!item) return res.status(404).json({ error: "Item not found." });
    await run("UPDATE cart SET qty = ? WHERE id = ?", [qty, req.params.id]);
    const items = await all("SELECT * FROM cart WHERE user_id = ?", [req.user.id]);
    res.json({ items });
  } catch { res.status(500).json({ error: "Could not update." }); }
});

// ── CART REMOVE ONE ───────────────────────────────────────
app.delete("/api/cart/:id", authMiddleware, async (req, res) => {
  try {
    const item = await get("SELECT * FROM cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!item) return res.status(404).json({ error: "Item not found." });
    await run("DELETE FROM cart WHERE id = ?", [req.params.id]);
    const items = await all("SELECT * FROM cart WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Removed.", items });
  } catch { res.status(500).json({ error: "Could not remove item." }); }
});

// ── CART CLEAR ALL ────────────────────────────────────────
app.delete("/api/cart", authMiddleware, async (req, res) => {
  try {
    await run("DELETE FROM cart WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Cart cleared.", items: [] });
  } catch { res.status(500).json({ error: "Could not clear cart." }); }
});

// ── PLACE ORDER ───────────────────────────────────────────
app.post("/api/orders", authMiddleware, async (req, res) => {
  const { address, payment_method, promo_used, subtotal, discount, shipping, total } = req.body;
  if (!address || !address.full_name || !address.phone || !address.address ||
      !address.city || !address.state || !address.pincode)
    return res.status(400).json({ error: "Complete address is required." });

  try {
    const cartItems = await all("SELECT * FROM cart WHERE user_id = ?", [req.user.id]);
    if (cartItems.length === 0)
      return res.status(400).json({ error: "Cart is empty." });

    // Generate order number: SM-YYYYMMDD-XXXX
    const now = new Date();
    const datePart = now.toISOString().slice(0,10).replace(/-/g,"");
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const order_number = `SM-${datePart}-${randPart}`;

    const result = await run(
      `INSERT INTO orders
        (user_id, order_number, subtotal, discount, shipping, total, promo_used,
         full_name, phone, address, city, state, pincode, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, order_number, subtotal, discount, shipping, total,
       promo_used || null, address.full_name, address.phone, address.address,
       address.city, address.state, address.pincode, payment_method || "cod"]
    );

    const orderId = result.lastID;

    // Insert order items
    for (const item of cartItems) {
      await run(
        "INSERT INTO order_items (order_id, product_id, name, price, image, size, qty) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [orderId, item.product_id, item.name, item.price, item.image, item.size, item.qty]
      );
    }

    // Clear cart after order
    await run("DELETE FROM cart WHERE user_id = ?", [req.user.id]);

    const order = await get("SELECT * FROM orders WHERE id = ?", [orderId]);
    const items = await all("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
    res.status(201).json({ message: "Order placed!", order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not place order." });
  }
});

// ── GET MY ORDERS ─────────────────────────────────────────
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await all(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    // attach items to each order
    for (const order of orders) {
      order.items = await all("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    }
    res.json({ orders });
  } catch { res.status(500).json({ error: "Could not load orders." }); }
});

// ── GET SINGLE ORDER ──────────────────────────────────────
app.get("/api/orders/:id", authMiddleware, async (req, res) => {
  try {
    const order = await get(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!order) return res.status(404).json({ error: "Order not found." });
    order.items = await all("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    res.json({ order });
  } catch { res.status(500).json({ error: "Could not load order." }); }
});

app.listen(PORT);
