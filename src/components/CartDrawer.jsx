import { money } from '../api';

export default function CartDrawer({ open, cart, onClose, onChangeQty, onRemove, onCheckout, busy }) {
  const total = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        {cart.length === 0 ? (
          <p className="muted">Your cart is empty.</p>
        ) : (
          <ul className="cart-lines">
            {cart.map(({ product, qty }) => (
              <li key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <div className="muted">{money(product.price)} each</div>
                </div>
                <div className="qty">
                  <button className="btn small" onClick={() => onChangeQty(product.id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button className="btn small" disabled={qty >= product.stock} onClick={() => onChangeQty(product.id, qty + 1)}>+</button>
                  <button className="btn small ghost" onClick={() => onRemove(product.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="drawer-foot">
          <div className="total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <button className="btn primary wide" disabled={cart.length === 0 || busy} onClick={onCheckout}>
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </aside>
    </>
  );
}
