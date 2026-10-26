// import { useState } from 'react';
// import { School } from 'lucide-react';
// import { api } from './api';

// export default function Login({ onLogin }) {
//   const [u, setU] = useState(''); const [p, setP] = useState('');
//   const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
//   const submit = async (e) => {
//     e.preventDefault(); setBusy(true); setErr('');
//     try { onLogin((await api('POST', '/login', { username: u, password: p })).user); } catch (x) { setErr(x.message); }
//     setBusy(false);
//   };
//   return (
//     <div className="loginwrap">
//       <form className="card login" onSubmit={submit}>
//         <div className="brand dark"><School size={26} /> <span>St mary's School<br /><small>Samtoli,Simdega</small></span></div>
//         <label><span>Username</span><input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required autoFocus /></label>
//         <label><span>Password</span><input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required /></label>
//         {err && <div className="alert r">{err}</div>}
//         <button className="primary" disabled={busy}>{busy ? 'Please wait…' : 'Log in'}</button>
//       </form>
//     </div>
//   );
// }



import { useState } from 'react';
import { api } from './api';

export default function Login({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');

    try {
      const res = await api('POST', '/login', {
        username: u,
        password: p,
      });

      onLogin(res.user);
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="loginwrap">
      <form className="card login" onSubmit={submit}>
        {/* School Logo and Name */}
        <div
          className="brand dark"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <img
            src="/logo.png"
            alt="St Mary's School Logo"
            style={{
              width: '55px',
              height: '55px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />

          <span>
            <strong
              style={{
                display: 'inline-block',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              St Mary's School
            </strong>

            <br />

            <small
              style={{
                fontSize: '13px',
                fontWeight: 400,
              }}
            >
              Samtoli, Simdega
            </small>
          </span>
        </div>

        {/* Username */}
        <label>
          <span>Username</span>
          <input
            value={u}
            onChange={(e) => setU(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </label>

        {/* Password */}
        <label>
          <span>Password</span>
          <input
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {/* Error Message */}
        {err && <div className="alert r">{err}</div>}

        {/* Login Button */}
        <button className="primary" disabled={busy}>
          {busy ? 'Please wait…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

