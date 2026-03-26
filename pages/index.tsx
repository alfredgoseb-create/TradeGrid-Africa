export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>TradeGrid Dashboard</h1>

      <ul>
        <li><a href="/add-product">➕ Add Product</a></li>
        <li><a href="/marketplace">🛒 Marketplace</a></li>
        <li><a href="/warehouse">🏬 Warehouse</a></li>
        <li><a href="/shipments">🚚 Shipments</a></li>
        <li><a href="/trades">📊 Trades</a></li>
      </ul>
    </div>
  )
}