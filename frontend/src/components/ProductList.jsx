import axios from "axios";

const API = "http://23.23.71.14:3000"

export default function ProductList({ products, addToCart }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
      {products.map((p) => (
        <div key={p.id} style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <img src={p.image} alt={p.name} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
          <div style={{ padding: "1rem" }}>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{p.category}</p>
            <h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>{p.name}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>${p.price}</span>
              <button onClick={() => addToCart(p)}
                style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}