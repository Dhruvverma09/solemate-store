# SoleMate 👟 — Fullstack Ecommerce

React + Node.js + Express + SQLite ecommerce store with login, signup, and cart saved to a database.

# SoleMate 👟
**Built by Dhruv** | [GitHub](https://github.com/Dhruvverma09)

## Project Structure

```
solemate-fullstack/
├── server/              ← Node.js + Express backend
│   ├── index.js         ← All API routes
│   ├── solemate.db      ← SQLite database (auto-created on first run)
│   └── package.json
│
├── client/              ← React frontend
│   ├── src/
│   │   ├── App.jsx      ← All components
│   │   ├── App.css      ← All styles
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md
```

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18, CSS                 |
| Backend  | Node.js, Express              |
| Database | SQLite (via better-sqlite3)   |
| Auth     | bcryptjs (passwords), JWT (sessions) |

## How to Run

You need **two terminals** open at the same time.

### Terminal 1 — Start the Backend

```bash
cd server
npm install
npm start
```

Server runs at: `http://localhost:5000`

### Terminal 2 — Start the Frontend

```bash
cd client
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

Open `http://localhost:3000` in your browser. Done! 🎉

---

## API Routes

### Auth
| Method | Route            | What it does              |
|--------|------------------|---------------------------|
| POST   | /api/auth/signup | Create a new account      |
| POST   | /api/auth/login  | Login, returns JWT token  |
| GET    | /api/auth/me     | Get logged-in user info   |

### Cart (requires login)
| Method | Route          | What it does              |
|--------|----------------|---------------------------|
| GET    | /api/cart      | Get user's cart           |
| POST   | /api/cart      | Add item to cart          |
| PATCH  | /api/cart/:id  | Update item quantity      |
| DELETE | /api/cart/:id  | Remove one item           |
| DELETE | /api/cart      | Clear entire cart         |

---

## Database Tables

**users**
```sql
id, name, email, password (hashed), created_at
```

**cart**
```sql
id, user_id, product_id, name, price, image, size, qty
```

---

## Promo Code

Try `SOLEMATE10` at checkout for **10% off**!

---

## License

MIT — free to use for learning and portfolio.
