import { useState } from 'react';
import { money } from '../api';

export default function ProductGrid({ products, cart, onAdd }) {
  const [query, setQuery] = useState('');
  const shown = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
  const inCart = (id) => cart.find((line) => line.product.id === id)?.qty ?? 0;

  return (
    <section>
      <div className="toolbar">
        <h2>Catalog</h2>
        <input
          className="search"
          placeholder="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {shown.length === 0 && <p className="muted">No products found.</p>}
      <div className="grid">
        {shown.map((product) => {
          const left = product.stock - inCart(product.id);
          return (
            <article key={product.id} className="card product">
              <div className="thumb" aria-hidden="true">{product.name.charAt(0).toUpperCase()}</div>
              <h3>{product.name}</h3>
              <div className="price">{money(product.price)}</div>
              <div className={`stock ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : ''}`}>
                {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
              </div>
              <button className="btn primary" disabled={left < 1} onClick={() => onAdd(product)}>
                Add to cart
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
