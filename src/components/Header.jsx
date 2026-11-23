export default function Header({ session, view, onView, cartCount, onCart, onLogout }) {
  const tabs = [
    ['shop', 'Shop'],
    ['orders', 'My orders'],
    ...(session.role === 'ADMIN' ? [['admin', 'Admin']] : []),
  ];

  return (
    <header className="header">
      <div className="brand">QuickMart</div>
      <nav className="tabs">
        {tabs.map(([key, label]) => (
          <button key={key} className={`tab ${view === key ? 'active' : ''}`} onClick={() => onView(key)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="header-right">
        <button className="btn" onClick={onCart}>
          Cart <span className="badge">{cartCount}</span>
        </button>
        <span className="muted user">
          {session.username} · {session.role}
        </span>
        <button className="btn ghost" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  );
}
