import { useEffect, useState } from "react";
import axios from "axios";

import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Orders from "./components/Orders";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get("/api/orders");
    setOrders(res.data);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const placeOrder = async () => {
    for (const item of cart) {
      await axios.post("/api/orders", {
        product_id: item.id,
        quantity: 1,
        total: item.price,
      });
    }
    setCart([]);
    fetchOrders();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "40px", fontWeight: "700" }}>
              ShopK8s
            </h1>
            <p style={{ color: "#6b7280", marginTop: "5px" }}>
              Cloud Native Store
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "10px 18px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontWeight: "600",
            }}
          >
            Cart: {cart.length}
          </div>
        </div>

        <ProductList products={products} addToCart={addToCart} />

        <Cart cart={cart} placeOrder={placeOrder} />

        <Orders orders={orders} />
      </div>
    </div>
  );
}

export default App;