import { useState } from 'react';

export default function LoginForm({ onLogin, error, busy }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function submit(e) {
    e.preventDefault();
    onLogin(username, password);
  }

  return (
    <main className="login">
      <form className="card login-card" onSubmit={submit}>
        <div className="brand brand-large">QuickMart</div>
        <p className="muted">Sign in to browse the catalog and place orders.</p>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
