import { money } from '../api';

export default function OrdersView({ orders }) {
  return (
    <section>
      <h2>My orders</h2>
      {orders.length === 0 && <p className="muted">No orders yet.</p>}
      <div className="stack">
        {orders.map((order) => (
          <article key={order.id} className="card">
            <div className="row">
              <strong>Order #{order.id}</strong>
              <span className="pill">{order.status}</span>
            </div>
            <div className="muted">{new Date(order.createdAt).toLocaleString()}</div>
            <ul className="plain">
              {order.items.map((item) => (
                <li key={item.productId}>
                  {item.quantity} × {item.productName} <span className="muted">({money(item.unitPrice)})</span>
                </li>
              ))}
            </ul>
            <div className="row total">
              <span>Total</span>
              <strong>{money(order.totalAmount)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
