export default function Orders({ orders }) {
  if (orders.length === 0) return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "2rem", textAlign: "center", color: "#888" }}>
      <p>No orders yet</p>
    </div>
  )

  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginBottom: "1rem" }}>Orders</h2>
      {orders.map((o) => (
        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <p style={{ fontWeight: "600" }}>{o.name}</p>
            <p style={{ fontSize: "13px", color: "#888" }}>Qty: {o.quantity}</p>
          </div>
          <span style={{ fontWeight: "700" }}>${o.total}</span>
        </div>
      ))}
    </div>
  )
}