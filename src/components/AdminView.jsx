import { useEffect, useState } from 'react';
import { money, request } from '../api';

export default function AdminView({ token, onChanged, onError, onNotify }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [lowStock, setLowStock] = useState([]);
  const [sales, setSales] = useState([]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      request('/products/low-stock?threshold=5', { token }),
      request('/orders/reports/sales', { token }),
    ])
      .then(([low, report]) => {
        if (!cancelled) {
          setLowStock(low);
          setSales(report);
        }
      })
      .catch((e) => {
        if (!cancelled) onError(e);
      });
    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, onError]);

  async function submit(e) {
    e.preventDefault();
    try {
      await request('/products', {
        token,
        method: 'POST',
        body: { name: form.name, price: Number(form.price), stock: Number(form.stock) },
      });
      setForm({ name: '', price: '', stock: '' });
      onNotify('Product added');
      onChanged();
      setReloadKey((k) => k + 1);
    } catch (err) {
      onError(err);
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <section className="admin">
      <form className="card" onSubmit={submit}>
        <h3>Add product</h3>
        <label>Name<input value={form.name} onChange={set('name')} required /></label>
        <label>Price<input type="number" step="0.01" min="0.01" value={form.price} onChange={set('price')} required /></label>
        <label>Stock<input type="number" min="0" value={form.stock} onChange={set('stock')} required /></label>
        <button className="btn primary" type="submit">Add product</button>
      </form>

      <div className="card">
        <h3>Low stock (5 or fewer)</h3>
        {lowStock.length === 0 ? (
          <p className="muted">Nothing is running low.</p>
        ) : (
          <ul className="plain">
            {lowStock.map((p) => (
              <li key={p.id}>{p.name} <span className="stock low">{p.stock} left</span></li>
            ))}
          </ul>
        )}
      </div>

      <div className="card wide-card">
        <h3>Sales by product</h3>
        {sales.length === 0 ? (
          <p className="muted">No sales yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {sales.map((row) => (
                <tr key={row.productName}>
                  <td>{row.productName}</td>
                  <td>{row.unitsSold}</td>
                  <td>{money(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
