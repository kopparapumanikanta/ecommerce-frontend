import { useCallback, useEffect, useState } from 'react';
import { request, SessionExpiredError } from './api';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import OrdersView from './components/OrdersView';
import AdminView from './components/AdminView';
import './App.css';

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem('session')) || null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [view, setView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const token = session?.token;

  const logout = useCallback(() => {
    sessionStorage.removeItem('session');
    setSession(null);
    setProducts([]);
    setOrders([]);
    setCart([]);
    setView('shop');
  }, []);

  const handleError = useCallback(
    (e) => {
      if (e instanceof SessionExpiredError) logout();
      setError(e.message);
    },
    [logout]
  );

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    Promise.all([request('/products', { token }), request('/orders/mine', { token })])
      .then(([p, o]) => {
        if (!cancelled) {
          setProducts(p);
          setOrders(o);
        }
      })
      .catch((e) => {
        if (!cancelled) handleError(e);
      });
    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, handleError]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function login(username, password) {
    setBusy(true);
    setError('');
    try {
      const data = await request('/auth/login', { method: 'POST', body: { username, password } });
      const next = { token: data.token, role: data.role, username };
      sessionStorage.setItem('session', JSON.stringify(next));
      setSession(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function addToCart(product) {
    setError('');
    setCart((lines) => {
      const existing = lines.find((l) => l.product.id === product.id);
      if (existing) {
        return lines.map((l) => (l.product.id === product.id ? { ...l, qty: Math.min(l.qty + 1, product.stock) } : l));
      }
      return [...lines, { product, qty: 1 }];
    });
    setNotice(`${product.name} added to cart`);
  }

  function changeQty(productId, qty) {
    setCart((lines) =>
      qty < 1 ? lines.filter((l) => l.product.id !== productId) : lines.map((l) => (l.product.id === productId ? { ...l, qty } : l))
    );
  }

  function removeLine(productId) {
    setCart((lines) => lines.filter((l) => l.product.id !== productId));
  }

  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const items = cart.map((l) => ({ productId: l.product.id, quantity: l.qty }));
      await request('/orders', { token, method: 'POST', body: { items } });
      setCart([]);
      setCartOpen(false);
      setNotice('Order placed');
      setView('orders');
      refresh();
    } catch (e) {
      handleError(e);
      setCartOpen(false);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!session) {
    return <LoginForm onLogin={login} error={error} busy={busy} />;
  }

  return (
    <>
      <Header
        session={session}
        view={view}
        onView={(v) => { setView(v); setError(''); }}
        cartCount={cart.reduce((n, l) => n + l.qty, 0)}
        onCart={() => setCartOpen(true)}
        onLogout={logout}
      />
      <main className="content">
        {error && <div className="banner error" role="alert">{error}</div>}
        {notice && <div className="banner ok">{notice}</div>}
        {view === 'shop' && <ProductGrid products={products} cart={cart} onAdd={addToCart} />}
        {view === 'orders' && <OrdersView orders={orders} />}
        {view === 'admin' && session.role === 'ADMIN' && (
          <AdminView token={token} onChanged={refresh} onError={handleError} onNotify={setNotice} />
        )}
      </main>
      <CartDrawer
        open={cartOpen}
        cart={cart}
        busy={busy}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onRemove={removeLine}
        onCheckout={checkout}
      />
    </>
  );
}
