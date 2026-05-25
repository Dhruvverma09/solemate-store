import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_URL;
fetch(`${API}/api/signup`)
const PRODUCTS = [
  { id:1, name:"SoleMate Pro X",    category:"Road Running",   price:12999, oldPrice:18999, discount:"31% OFF", rating:4.9, reviews:2341, desc:"Carbon plate + ReactFoam V3. Built for speed and daily mileage.",  image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", sizes:[6,7,8,9,10,11,12], soldOut:[6,12], tag:"Best Seller", isNew:false },
  { id:2, name:"SoleMate Trail XT", category:"Trail Running",  price:9999,  oldPrice:14999, discount:"33% OFF", rating:4.7, reviews:1102, desc:"Aggressive grip, reinforced toe cap. Dominate any trail.",            image:"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80", sizes:[6,7,8,9,10,11],    soldOut:[6],     tag:"Sale",        isNew:false },
  { id:3, name:"SoleMate Cloud",    category:"Everyday",       price:7499,  oldPrice:null,  discount:null,       rating:4.8, reviews:876,  desc:"Max cushion for recovery days. Your feet will thank you.",           image:"https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80", sizes:[6,7,8,9,10,11,12], soldOut:[],      tag:null,          isNew:true  },
  { id:4, name:"SoleMate Racer",    category:"Competition",    price:16499, oldPrice:19999, discount:"18% OFF", rating:5.0, reviews:543,  desc:"Full carbon plate. Plated super shoe for your next PB.",             image:"https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80", sizes:[7,8,9,10,11],      soldOut:[],      tag:"Sale",        isNew:false },
  { id:5, name:"SoleMate Tempo",    category:"Speed Training", price:10499, oldPrice:12999, discount:"19% OFF", rating:4.6, reviews:729,  desc:"A lighter everyday trainer built for tempo runs and intervals.",     image:"https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80", sizes:[6,7,8,9,10,11,12], soldOut:[6,12],  tag:"Sale",        isNew:false },
  { id:6, name:"SoleMate Lite",     category:"Lightweight",    price:6299,  oldPrice:null,  discount:null,       rating:4.5, reviews:412,  desc:"Stripped back, lightweight, breathable. Run free.",                  image:"https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80", sizes:[6,7,8,9,10,11,12], soldOut:[],      tag:null,          isNew:true  },
];

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

async function apiCall(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${endpoint}`, {
    method, headers, body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// ─── Toast ────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// ─── Navbar ───────────────────────────────────────────────
function Navbar({ page, setPage, cartCount, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => setPage("home")}>Sole<span>Mate</span> 👟</div>
      <ul className="nav-links">
        <li><a className={page==="home"?"active":""} onClick={() => setPage("home")}>Home</a></li>
        <li><a className={page==="shop"?"active":""} onClick={() => setPage("shop")}>Shop</a></li>
        {user && <li><a className={page==="orders"?"active":""} onClick={() => setPage("orders")}>My Orders</a></li>}
      </ul>
      <div className="nav-right">
        {user ? (
          <>
            <button className="btn-cart" onClick={() => setPage("cart")}>
              🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <div className="user-pill" onClick={() => setPage("profile")}>
              <div className="user-avatar">{user.name[0].toUpperCase()}</div>
              <span className="user-name">{user.name.split(" ")[0]}</span>
            </div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn-ghost-sm" onClick={() => setPage("login")}>Login</button>
            <button className="btn-accent-sm" onClick={() => setPage("signup")}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Auth: Login ──────────────────────────────────────────
function LoginPage({ setPage, onLogin, showToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await apiCall("/auth/login", "POST", form);
      localStorage.setItem("sm_token", data.token);
      onLogin(data.user, data.token);
      showToast(`Welcome back, ${data.user.name}! 👋`, "success");
      setPage("home");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Sole<span>Mate</span> 👟</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Login to your account to continue</p>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field"><label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required /></div>
          <div className="field"><label>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required /></div>
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Logging in..." : "Login →"}</button>
        </form>
        <p className="auth-switch">Don't have an account? <span onClick={() => setPage("signup")}>Sign up free</span></p>
      </div>
    </div>
  );
}

// ─── Auth: Signup ─────────────────────────────────────────
function SignupPage({ setPage, onLogin, showToast }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const data = await apiCall("/auth/signup", "POST", { name:form.name, email:form.email, password:form.password });
      localStorage.setItem("sm_token", data.token);
      onLogin(data.user, data.token);
      showToast(`Account created! Welcome, ${data.user.name}! 🎉`, "success");
      setPage("home");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Sole<span>Mate</span> 👟</div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Join 50,000+ runners today</p>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field"><label>Full Name</label>
            <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required /></div>
          <div className="field"><label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required /></div>
          <div className="field"><label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required /></div>
          <div className="field"><label>Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} required /></div>
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Creating account..." : "Create Account →"}</button>
        </form>
        <p className="auth-switch">Already have an account? <span onClick={() => setPage("login")}>Login here</span></p>
      </div>
    </div>
  );
}

// ─── Marquee ──────────────────────────────────────────────
function Marquee() {
  const items = ["Carbon Fiber Plate","React Foam Technology","Ultra Breathable Mesh","Recycled Materials","Anti-Slip Outsole","Adaptive Fit","Drop: 8mm","2 Year Warranty"];
  return (
    <div className="marquee"><div className="marquee-track">
      {[...items,...items].map((t,i) => <span className="marquee-item" key={i}>{t}</span>)}
    </div></div>
  );
}

// ─── Hero ─────────────────────────────────────────────────
function Hero({ setPage, user }) {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-left">
        <div className="hero-eyebrow"><div className="hero-dot" /> New Drop 2025</div>
        <h1 className="hero-title">Find Your<br /><em className="accent">Perfect</em><br /><span className="stroke">SoleMate.</span></h1>
        <p className="hero-desc">Engineered for every runner. Lighter, faster, smarter — built for the road, trail, and everything in between.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => setPage("shop")}>Shop Now →</button>
          {!user && <button className="btn-ghost" onClick={() => setPage("signup")}>Join Free</button>}
        </div>
        <div className="hero-stats">
          <div><span className="stat-num">340<span>g</span></span><span className="stat-label">Ultra Light</span></div>
          <div><span className="stat-num">4<span>.8x</span></span><span className="stat-label">More Cushion</span></div>
          <div><span className="stat-num">50<span>k+</span></span><span className="stat-label">Happy Runners</span></div>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-img-wrap">
          <div className="hero-img-glow" />
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85" alt="SoleMate Pro X" className="hero-shoe-img" />
          <div className="shoe-badge"><div className="badge-val">340g</div><div className="badge-label">Featherweight</div></div>
          <div className="shoe-badge2"><div className="rating-stars">★★★★★</div><div className="rating-row"><span className="rating-val">4.9</span><span className="rating-label">/ 5.0</span></div></div>
        </div>
      </div>
    </section>
  );
}

// ─── Product Card ─────────────────────────────────────────
function ProductCard({ product, onClick, onAddToCart }) {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-img">
        {product.tag === "Sale" && !product.isNew && <div className="prod-badge">Sale</div>}
        {product.isNew && <div className="prod-new-badge">✨ New</div>}
        <img src={product.image} alt={product.name} className="prod-shoe-img" />
      </div>
      <div className="product-info">
        <div className="prod-category">{product.category}</div>
        <div className="prod-name">{product.name}</div>
        <div className="prod-rating">
          <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
          <span className="rating-count">({product.reviews.toLocaleString()})</span>
        </div>
        <p className="prod-desc">{product.desc}</p>
        <div className="prod-footer">
          <div>
            <span className="prod-price">{fmt(product.price)}</span>
            {product.oldPrice && <span className="prod-price-old">{fmt(product.oldPrice)}</span>}
          </div>
          <button className="add-btn" onClick={e => { e.stopPropagation(); onAddToCart(product, 9); }}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────
function ShopPage({ setPage, setDetailProduct, user, token, setCartItems, showToast }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All","Road Running","Trail Running","Everyday","Competition","Speed Training","Lightweight"];
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  const handleAddToCart = async (product, size = 9) => {
    if (!user) { showToast("Please login to add items to cart 🔒", "error"); setPage("login"); return; }
    try {
      const data = await apiCall("/cart", "POST", { product_id:product.id, name:product.name, price:product.price, image:product.image, size }, token);
      setCartItems(data.items);
      showToast(`${product.name} added to cart! 🛒`, "success");
    } catch (err) { showToast(err.message, "error"); }
  };
  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2 className="shop-title">All <em>Shoes</em></h2>
        <p className="shop-subtitle">{filtered.length} products found</p>
      </div>
      <div className="filter-bar">
        {categories.map(c => (
          <button key={c} className={`filter-btn${filter===c?" active":""}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      <div className="products-grid">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p}
            onClick={() => { setDetailProduct(p); setPage("detail"); }}
            onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}

// ─── Detail Page ──────────────────────────────────────────
function DetailPage({ product, setPage, user, token, setCartItems, showToast }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes.filter(s => !product.soldOut.includes(s))[2] || 9);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleAddToCart = async () => {
    if (!user) { showToast("Please login to add items to cart 🔒", "error"); setPage("login"); return; }
    setLoading(true);
    try {
      const data = await apiCall("/cart", "POST", { product_id:product.id, name:product.name, price:product.price, image:product.image, size:selectedSize, qty }, token);
      setCartItems(data.items);
      showToast(`${product.name} (UK ${selectedSize}) added! 🛒`, "success");
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };
  return (
    <div className="detail-page">
      <div>
        <button className="back-btn" onClick={() => setPage("shop")}>← Back to Shop</button>
        <div className="detail-visual">
          <img src={product.image} alt={product.name} className="detail-shoe-img" />
        </div>
      </div>
      <div className="detail-content">
        {product.tag && <div className="detail-tag">🔥 {product.tag}</div>}
        {product.isNew && <div className="detail-tag-new">✨ New Arrival</div>}
        <div className="detail-name">{product.name}</div>
        <div className="detail-model">{product.category} · Premium Edition</div>
        <div className="price-row">
          <div className="price-main">{fmt(product.price)}</div>
          {product.oldPrice && <div className="price-old-detail">{fmt(product.oldPrice)}</div>}
          {product.discount && <div className="discount-pill">{product.discount}</div>}
        </div>
        <div className="size-section">
          <span className="size-lbl">Select Size (UK)</span>
          <div className="sizes">
            {product.sizes.map(s => (
              <button key={s} className={`sz-btn${product.soldOut.includes(s)?" sold-out":""}${selectedSize===s?" selected":""}`}
                disabled={product.soldOut.includes(s)} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="qty-row">
          <span className="qty-label">Qty:</span>
          <div className="qty-ctrl">
            <button className="qty-sub" onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
            <span className="qty-val">{qty}</span>
            <button className="qty-add" onClick={() => setQty(q => q+1)}>+</button>
          </div>
        </div>
        <div className="buy-row">
          <button className={`btn-buy${loading?" loading":""}`} onClick={handleAddToCart} disabled={loading}>
            {loading ? "Adding..." : "Add to Cart 🛒"}
          </button>
          <button className="btn-wish-d" onClick={() => setWished(w => !w)}>{wished ? "❤️" : "🤍"}</button>
        </div>
        {!user && <p className="login-hint"><span onClick={() => setPage("login")}>Login</span> or <span onClick={() => setPage("signup")}>sign up</span> to save your cart.</p>}
      </div>
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────
function CartPage({ cartItems, setCartItems, setPage, token, showToast }) {
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const subtotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 5000 ? 0 : 199;
  const total = subtotal - discount + shipping;
  const totalItems = cartItems.reduce((a, i) => a + i.qty, 0);
  const needForFreeShip = 5000 - subtotal;

  const updateQty = async (item, delta) => {
    const newQty = item.qty + delta;
    if (newQty < 1) return;
    setLoadingId(item.id);
    try {
      const data = await apiCall(`/cart/${item.id}`, "PATCH", { qty: newQty }, token);
      setCartItems(data.items);
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoadingId(null); }
  };

  const removeItem = async (id) => {
    setLoadingId(id);
    try {
      const data = await apiCall(`/cart/${id}`, "DELETE", null, token);
      setCartItems(data.items);
      showToast("Item removed.", "success");
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoadingId(null); }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear your entire cart?")) return;
    try {
      const data = await apiCall("/cart", "DELETE", null, token);
      setCartItems(data.items);
      showToast("Cart cleared.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const applyPromo = () => {
    if (promo.toUpperCase() === "SOLEMATE10") {
      setPromoApplied(true);
      showToast("10% discount applied! 🎉", "success");
    } else {
      showToast("Invalid code. Try SOLEMATE10", "error");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-title">Your <em>Cart</em></div>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <button className="btn-primary" onClick={() => setPage("shop")}>Browse Shoes →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header-row">
        <div className="cart-title">Your <em>Cart</em> <span className="cart-count-badge">{totalItems} item{totalItems !== 1 ? "s" : ""}</span></div>
        <button className="btn-clear" onClick={clearCart}>Clear All 🗑</button>
      </div>

      {/* Free shipping progress bar */}
      {shipping > 0 && needForFreeShip > 0 && (
        <div className="ship-progress-wrap">
          <div className="ship-progress-text">
            Add <strong>{fmt(needForFreeShip)}</strong> more for <span className="free-tag">FREE delivery</span>
          </div>
          <div className="ship-progress-bar">
            <div className="ship-progress-fill" style={{ width: `${Math.min(100, (subtotal / 5000) * 100)}%` }} />
          </div>
        </div>
      )}
      {shipping === 0 && (
        <div className="ship-free-banner">🎉 You've unlocked FREE delivery!</div>
      )}

      <div className="cart-layout">
        {/* Items list */}
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className={`cart-item${loadingId === item.id ? " dimmed" : ""}`}>
              <div className="cart-img">
                <img src={item.image} alt={item.name} className="cart-shoe-img" />
              </div>
              <div className="cart-info">
                <div className="cart-prod-name">{item.name}</div>
                <div className="cart-prod-meta">Size: UK {item.size}</div>
                <div className="cart-prod-unit">Unit price: {fmt(item.price)}</div>
                <div className="cart-bottom-row">
                  <div className="cart-qty-ctrl">
                    <button className="cq-btn" onClick={() => updateQty(item, -1)}>−</button>
                    <span className="cq-val">{item.qty}</span>
                    <button className="cq-btn" onClick={() => updateQty(item, 1)}>+</button>
                  </div>
                  <button className="remove-text-btn" onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              </div>
              <div className="cart-item-right">
                <div className="cart-price">{fmt(item.price * item.qty)}</div>
                {item.qty > 1 && <div className="cart-savings">({item.qty} × {fmt(item.price)})</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="summary-title">Order Summary</div>

          <div className="summary-row">
            <span className="summary-label">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
            <span className="summary-val">{fmt(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Delivery</span>
            <span className={`summary-val ${shipping === 0 ? "free-text" : ""}`}>
              {shipping === 0 ? "FREE 🎉" : fmt(shipping)}
            </span>
          </div>
          {promoApplied && (
            <div className="summary-row">
              <span className="summary-label">Promo (SOLEMATE10)</span>
              <span className="summary-val promo-discount">−{fmt(discount)}</span>
            </div>
          )}

          {!promoApplied ? (
            <div className="promo-section">
              <div className="promo-label">Have a promo code?</div>
              <div className="promo-row">
                <input className="promo-input" placeholder="Enter code" value={promo}
                  onChange={e => setPromo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && applyPromo()} />
                <button className="promo-apply-btn" onClick={applyPromo}>Apply</button>
              </div>
            </div>
          ) : (
            <div className="promo-ok">✓ SOLEMATE10 — 10% off applied!</div>
          )}

          <div className="summary-divider" />
          <div className="summary-row total">
            <span className="total-label">Total</span>
            <span className="total-val">{fmt(total)}</span>
          </div>
          {discount > 0 && (
            <div className="you-save-row">You save {fmt(discount)} with promo! 🎉</div>
          )}

          <button className="checkout-btn" onClick={() => setPage("checkout")}>
            Proceed to Checkout →
          </button>
          <div className="trust-badges">
            <span>🔒 Secure</span>
            <span>🔄 Free returns</span>
            <span>📦 30-day policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────
function CheckoutPage({ cartItems, setCartItems, setPage, token, user, showToast, setLastOrder }) {
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
  const [address, setAddress] = useState({
    full_name: user?.name || "", phone: "", address: "", city: "", state: "", pincode: ""
  });
  const [payment, setPayment] = useState("cod");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promo, setPromo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 5000 ? 0 : 199;
  const total = subtotal - discount + shipping;

  const INDIA_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh","Puducherry"];

  const validateAddress = () => {
    const e = {};
    if (!address.full_name.trim()) e.full_name = "Name is required";
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone.trim())) e.phone = "Enter valid 10-digit phone";
    if (!address.address.trim()) e.address = "Address is required";
    if (!address.city.trim()) e.city = "City is required";
    if (!address.state) e.state = "Select a state";
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode.trim())) e.pincode = "Enter valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const data = await apiCall("/orders", "POST", {
        address, payment_method: payment,
        promo_used: promoApplied ? "SOLEMATE10" : null,
        subtotal, discount, shipping, total
      }, token);
      setCartItems([]);
      setLastOrder(data.order);
      showToast("Order placed successfully! 🎉", "success");
      setPage("order-success");
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const StepIndicator = () => (
    <div className="step-indicator">
      {["Delivery Address", "Payment", "Review & Place"].map((label, i) => (
        <div key={i} className={`step-item ${step === i+1 ? "active" : step > i+1 ? "done" : ""}`}>
          <div className="step-circle">{step > i+1 ? "✓" : i+1}</div>
          <span className="step-label">{label}</span>
          {i < 2 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="checkout-page">
      <button className="back-btn" onClick={() => step > 1 ? setStep(s => s-1) : setPage("cart")}>
        ← {step > 1 ? "Back" : "Back to Cart"}
      </button>
      <h2 className="checkout-title">Checkout</h2>
      <StepIndicator />

      <div className="checkout-layout">
        <div className="checkout-main">

          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="checkout-section">
              <h3 className="section-head">📍 Delivery Address</h3>
              <div className="form-grid">
                <div className="field full">
                  <label>Full Name</label>
                  <input type="text" placeholder="As on ID" value={address.full_name}
                    onChange={e => setAddress({...address, full_name: e.target.value})} />
                  {errors.full_name && <span className="field-error">{errors.full_name}</span>}
                </div>
                <div className="field full">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="10-digit mobile number" value={address.phone}
                    onChange={e => setAddress({...address, phone: e.target.value})} />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
                <div className="field full">
                  <label>Address (House No., Street, Area)</label>
                  <input type="text" placeholder="e.g. 42, MG Road, Sector 14" value={address.address}
                    onChange={e => setAddress({...address, address: e.target.value})} />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>
                <div className="field">
                  <label>City</label>
                  <input type="text" placeholder="Mumbai" value={address.city}
                    onChange={e => setAddress({...address, city: e.target.value})} />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
                <div className="field">
                  <label>Pincode</label>
                  <input type="text" placeholder="400001" maxLength={6} value={address.pincode}
                    onChange={e => setAddress({...address, pincode: e.target.value})} />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                </div>
                <div className="field full">
                  <label>State</label>
                  <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})}>
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <span className="field-error">{errors.state}</span>}
                </div>
              </div>
              <button className="btn-next" onClick={() => { if (validateAddress()) setStep(2); }}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="checkout-section">
              <h3 className="section-head">💳 Payment Method</h3>
              <div className="payment-options">
                {[
                  { id:"cod",  icon:"💵", label:"Cash on Delivery", desc:"Pay when your order arrives" },
                  { id:"upi",  icon:"📱", label:"UPI",              desc:"GPay, PhonePe, Paytm etc." },
                  { id:"card", icon:"💳", label:"Credit / Debit Card", desc:"Visa, Mastercard, Rupay" },
                  { id:"nb",   icon:"🏦", label:"Net Banking",      desc:"All major banks supported" },
                ].map(opt => (
                  <div key={opt.id} className={`payment-option${payment===opt.id?" selected":""}`}
                    onClick={() => setPayment(opt.id)}>
                    <div className="pay-radio">{payment === opt.id ? "●" : "○"}</div>
                    <div className="pay-icon">{opt.icon}</div>
                    <div className="pay-text">
                      <div className="pay-label">{opt.label}</div>
                      <div className="pay-desc">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* UPI input */}
              {payment === "upi" && (
                <div className="field" style={{marginTop:16}}>
                  <label>UPI ID</label>
                  <input type="text" placeholder="yourname@upi" />
                </div>
              )}

              {/* Promo on payment step */}
              <div className="checkout-section" style={{marginTop:24, padding:0, border:"none"}}>
                <h3 className="section-head">🎟️ Promo Code</h3>
                {!promoApplied ? (
                  <div className="promo-row">
                    <input className="promo-input" placeholder="Enter code (try SOLEMATE10)"
                      value={promo} onChange={e => setPromo(e.target.value)} />
                    <button className="promo-apply-btn" onClick={() => {
                      if (promo.toUpperCase() === "SOLEMATE10") { setPromoApplied(true); showToast("10% discount applied! 🎉","success"); }
                      else showToast("Invalid code. Try SOLEMATE10","error");
                    }}>Apply</button>
                  </div>
                ) : (
                  <div className="promo-ok">✓ SOLEMATE10 — 10% off applied!
                    <button className="promo-remove" onClick={() => { setPromoApplied(false); setPromo(""); }}>Remove</button>
                  </div>
                )}
              </div>

              <button className="btn-next" onClick={() => setStep(3)}>Review Order →</button>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="checkout-section">
              <h3 className="section-head">📋 Review Your Order</h3>

              {/* Address review */}
              <div className="review-block">
                <div className="review-block-header">
                  <span>📍 Delivery To</span>
                  <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                </div>
                <div className="review-address">
                  <strong>{address.full_name}</strong> · {address.phone}<br />
                  {address.address}, {address.city}, {address.state} — {address.pincode}
                </div>
              </div>

              {/* Payment review */}
              <div className="review-block">
                <div className="review-block-header">
                  <span>💳 Payment</span>
                  <button className="edit-btn" onClick={() => setStep(2)}>Edit</button>
                </div>
                <div className="review-address">
                  {{ cod:"Cash on Delivery 💵", upi:"UPI 📱", card:"Credit / Debit Card 💳", nb:"Net Banking 🏦" }[payment]}
                </div>
              </div>

              {/* Items review */}
              <div className="review-block">
                <div className="review-block-header"><span>🛍️ Items ({cartItems.reduce((a,i)=>a+i.qty,0)})</span></div>
                {cartItems.map(item => (
                  <div key={item.id} className="review-item">
                    <img src={item.image} alt={item.name} className="review-item-img" />
                    <div className="review-item-info">
                      <div className="review-item-name">{item.name}</div>
                      <div className="review-item-meta">UK {item.size} · Qty: {item.qty}</div>
                    </div>
                    <div className="review-item-price">{fmt(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <button className="btn-place" onClick={placeOrder} disabled={loading}>
                {loading ? "Placing Order..." : `Place Order · ${fmt(total)} →`}
              </button>
              <p className="place-note">By placing the order you agree to our Terms & Conditions.</p>
            </div>
          )}
        </div>

        {/* Right: Price summary */}
        <div className="checkout-summary">
          <div className="summary-title">Price Details</div>
          <div className="summary-row"><span className="summary-label">MRP Total</span><span className="summary-val">{fmt(subtotal)}</span></div>
          <div className="summary-row"><span className="summary-label">Delivery</span><span className={`summary-val ${shipping===0?"free-text":""}`}>{shipping===0?"FREE 🎉":fmt(shipping)}</span></div>
          {promoApplied && <div className="summary-row"><span className="summary-label">Promo Discount</span><span className="summary-val promo-discount">−{fmt(discount)}</span></div>}
          <div className="summary-divider" />
          <div className="summary-row total"><span className="total-label">Total Amount</span><span className="total-val">{fmt(total)}</span></div>
          {discount > 0 && <div className="you-save-row">You save {fmt(discount)}! 🎉</div>}
          <div className="trust-badges" style={{marginTop:16}}>
            <span>🔒 Secure checkout</span>
            <span>📦 Free 30-day returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER SUCCESS PAGE ───────────────────────────────────
function OrderSuccessPage({ order, setPage }) {
  if (!order) { setPage("home"); return null; }
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h2 className="success-title">Order Placed!</h2>
        <p className="success-sub">Thank you for your order. We'll deliver it soon!</p>
        <div className="order-number-box">
          <span className="on-label">Order Number</span>
          <span className="on-val">{order.order_number}</span>
        </div>
        <div className="success-details">
          <div className="sd-row"><span>Delivering to</span><strong>{order.full_name}</strong></div>
          <div className="sd-row"><span>Address</span><strong>{order.city}, {order.state}</strong></div>
          <div className="sd-row"><span>Payment</span><strong>{{ cod:"Cash on Delivery", upi:"UPI", card:"Card", nb:"Net Banking" }[order.payment_method] || order.payment_method}</strong></div>
          <div className="sd-row"><span>Total Paid</span><strong>{fmt(order.total)}</strong></div>
        </div>
        <div className="success-btns">
          <button className="btn-primary" onClick={() => setPage("orders")}>View My Orders</button>
          <button className="btn-ghost" onClick={() => setPage("shop")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

// ─── MY ORDERS PAGE ───────────────────────────────────────
function OrdersPage({ token, setPage, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    apiCall("/orders", "GET", null, token)
      .then(d => setOrders(d.orders))
      .catch(err => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);

  const statusColor = { confirmed:"#e8ff47", shipped:"#60a5fa", delivered:"#10b981", cancelled:"#ff6b63" };
  const statusIcon  = { confirmed:"✅", shipped:"🚚", delivered:"📦", cancelled:"❌" };

  if (loading) return <div className="orders-page"><div className="loading-state">Loading your orders...</div></div>;

  if (orders.length === 0) return (
    <div className="orders-page">
      <h2 className="orders-title">My <em>Orders</em></h2>
      <div className="empty-cart">
        <div className="empty-cart-icon">📦</div>
        <h3>No orders yet</h3>
        <p>Start shopping to see your orders here!</p>
        <button className="btn-primary" onClick={() => setPage("shop")}>Shop Now →</button>
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      <h2 className="orders-title">My <em>Orders</em></h2>
      <p className="orders-sub">{orders.length} order{orders.length!==1?"s":""} placed</p>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header" onClick={() => setExpanded(expanded===order.id ? null : order.id)}>
              <div className="order-left">
                <div className="order-num">{order.order_number}</div>
                <div className="order-date">{new Date(order.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
              </div>
              <div className="order-middle">
                <div className="order-items-count">{order.items?.length || 0} item{(order.items?.length||0)!==1?"s":""}</div>
                <div className="order-total-val">{fmt(order.total)}</div>
              </div>
              <div className="order-right">
                <div className="order-status" style={{color: statusColor[order.status] || "#fff"}}>
                  {statusIcon[order.status]} {order.status.charAt(0).toUpperCase()+order.status.slice(1)}
                </div>
                <div className="order-expand">{expanded===order.id ? "▲" : "▼"}</div>
              </div>
            </div>

            {expanded === order.id && (
              <div className="order-card-body">
                {/* Items */}
                <div className="order-items-list">
                  {(order.items||[]).map(item => (
                    <div key={item.id} className="order-item-row">
                      <img src={item.image} alt={item.name} className="order-item-img" />
                      <div className="order-item-info">
                        <div className="order-item-name">{item.name}</div>
                        <div className="order-item-meta">Size: UK {item.size} · Qty: {item.qty}</div>
                      </div>
                      <div className="order-item-price">{fmt(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
                {/* Price breakdown */}
                <div className="order-price-breakdown">
                  <div className="opb-row"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                  {order.discount > 0 && <div className="opb-row discount"><span>Promo discount</span><span>−{fmt(order.discount)}</span></div>}
                  <div className="opb-row"><span>Delivery</span><span>{order.shipping===0?"FREE":fmt(order.shipping)}</span></div>
                  <div className="opb-row total"><span>Total</span><span>{fmt(order.total)}</span></div>
                </div>
                {/* Delivery address */}
                <div className="order-address-block">
                  <div className="oab-label">📍 Delivered to</div>
                  <div className="oab-text"><strong>{order.full_name}</strong> · {order.phone}<br />{order.address}, {order.city}, {order.state} — {order.pincode}</div>
                </div>
                <div className="order-payment-block">
                  💳 {{ cod:"Cash on Delivery", upi:"UPI", card:"Card", nb:"Net Banking" }[order.payment_method] || order.payment_method}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────
function ProfilePage({ user, cartItems, setPage, token, showToast }) {
  const [orderCount, setOrderCount] = useState(0);
  useEffect(() => {
    apiCall("/orders","GET",null,token).then(d => setOrderCount(d.orders.length)).catch(()=>{});
  }, [token]);
  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        <div className="profile-stats">
          <div className="pstat"><span className="pstat-val">{cartItems.length}</span><span className="pstat-label">In Cart</span></div>
          <div className="pstat"><span className="pstat-val">{orderCount}</span><span className="pstat-label">Orders</span></div>
          <div className="pstat"><span className="pstat-val">{fmt(cartItems.reduce((a,i)=>a+i.price*i.qty,0))}</span><span className="pstat-label">Cart Value</span></div>
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          <button className="btn-primary" onClick={() => setPage("cart")}>View Cart 🛒</button>
          <button className="btn-ghost" onClick={() => setPage("orders")}>My Orders 📦</button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">Sole<span>Mate</span> 👟</div>
      <ul className="footer-links">{["About","Careers","Contact","Privacy"].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul>
      <div className="footer-copy">© 2025 SoleMate. All rights reserved.</div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [detailProduct, setDetailProduct] = useState(PRODUCTS[0]);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast(null);
    setTimeout(() => setToast({ msg, type }), 10);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sm_token");
    if (!saved) return;
    apiCall("/auth/me","GET",null,saved)
      .then(d => { setUser(d.user); setToken(saved); return apiCall("/cart","GET",null,saved); })
      .then(d => setCartItems(d.items))
      .catch(() => localStorage.removeItem("sm_token"));
  }, []);

  const handleLogin = (u, t) => {
    setUser(u); setToken(t);
    apiCall("/cart","GET",null,t).then(d => setCartItems(d.items)).catch(()=>{});
  };

  const handleLogout = () => {
    setUser(null); setToken(null); setCartItems([]);
    localStorage.removeItem("sm_token");
    setPage("home");
    showToast("Logged out. See you soon! 👋", "success");
  };

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  const renderPage = () => {
    switch (page) {
      case "home":     return <><Hero setPage={setPage} user={user} /><Marquee /><ShopPage setPage={setPage} setDetailProduct={setDetailProduct} user={user} token={token} setCartItems={setCartItems} showToast={showToast} /></>;
      case "shop":     return <ShopPage setPage={setPage} setDetailProduct={setDetailProduct} user={user} token={token} setCartItems={setCartItems} showToast={showToast} />;
      case "detail":   return <DetailPage product={detailProduct} setPage={setPage} user={user} token={token} setCartItems={setCartItems} showToast={showToast} />;
      case "cart":     return <CartPage cartItems={cartItems} setCartItems={setCartItems} setPage={setPage} token={token} showToast={showToast} />;
      case "checkout": return <CheckoutPage cartItems={cartItems} setCartItems={setCartItems} setPage={setPage} token={token} user={user} showToast={showToast} setLastOrder={setLastOrder} />;
      case "order-success": return <OrderSuccessPage order={lastOrder} setPage={setPage} />;
      case "orders":   return <OrdersPage token={token} setPage={setPage} showToast={showToast} />;
      case "login":    return <LoginPage setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
      case "signup":   return <SignupPage setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
      case "profile":  return <ProfilePage user={user} cartItems={cartItems} setPage={setPage} token={token} showToast={showToast} />;
      default:         return null;
    }
  };

  return (
    <div>
      <Navbar page={page} setPage={setPage} cartCount={cartCount} user={user} onLogout={handleLogout} />
      <div className="page-content">{renderPage()}</div>
      <Footer />
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
