import axios from "axios"

const API = "http://23.23.71.14:3000"

export default function Cart({ cart, placeOrder }) {
  const total = cart.reduce((a, i) => a + parseFloat(i.price), 0)

  if (cart.length === 0) return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "2rem", marginBottom: "2rem", textAlign: "center", color: "#888" }}>
      <p>Cart is empty</p>
    </div>
  )

  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginBottom: "1rem" }}>Cart ({cart.length})</h2>
      {cart.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
          <span>{item.name}</span>
          <span style={{ fontWeight: "600" }}>${item.price}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontWeight: "700", fontSize: "1.1rem" }}>
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button onClick={placeOrder}
        style={{ width: "100%", marginTop: "1rem", padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", fontWeight: "600" }}>
        Place Order
      </button>
    </div>
  )
}