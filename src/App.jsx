// import { useEffect, useState } from 'react';
// import { Megaphone, Users, ListOrdered, LogOut, School } from 'lucide-react';
// import { api } from './api';
// import Login from './Login.jsx';
// import Send from './Send.jsx';
// import Track from './Track.jsx';
// import Records from './Records.jsx';

// const NAV = [['send', 'Send notice', Megaphone], ['track', 'Delivery status', Users], ['records', 'Call records', ListOrdered]];

// export default function App() {
//   const [user, setUser] = useState(undefined); // undefined = still checking the session
//   const [page, setPage] = useState('send');
//   const [sel, setSel] = useState(null);
//   useEffect(() => {
//     api('GET', '/me').then((d) => setUser(d.user)).catch(() => setUser(null));
//     const lost = () => setUser(null);
//     window.addEventListener('auth-lost', lost);
//     return () => window.removeEventListener('auth-lost', lost);
//   }, []);
//   if (user === undefined) return null;
//   if (!user) return <Login onLogin={(u) => { setUser(u); setPage('send'); }} />;
//   return (
//     <div className="shell">
//       <aside className="side">
//         <div className="brand"><School size={22} /> <span>St mary's School<br /><small>Samtoli,Simdega</small></span></div>
//         <nav>{NAV.map(([id, l, I]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><I size={17} /> {l}</button>)}</nav>
//         <div className="who"><small>{user.username}</small>
//           <button onClick={async () => { await api('POST', '/logout').catch(() => {}); setUser(null); }}><LogOut size={15} /> Logout</button></div>
//       </aside>
//       <main className="main">
//         {page === 'send' && <Send onSent={(id) => { setSel(id); setPage('track'); }} />}
//         {page === 'track' && <Track selected={sel} setSelected={setSel} />}
//         {page === 'records' && <Records />}
//       </main>
//     </div>
//   );
// }




import { useEffect, useState } from 'react';
import {
  Megaphone,
  Users,
  ListOrdered,
  LogOut,
} from 'lucide-react';

import { api } from './api';
import Login from './Login.jsx';
import Send from './Send.jsx';
import Track from './Track.jsx';
import Records from './Records.jsx';

const NAV = [
  ['send', 'Send notice', Megaphone],
  ['track', 'Delivery status', Users],
  ['records', 'Call records', ListOrdered],
];

export default function App() {
  const [user, setUser] = useState(undefined);
  const [page, setPage] = useState('send');
  const [sel, setSel] = useState(null);

  useEffect(() => {
    api('GET', '/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));

    const lost = () => setUser(null);

    window.addEventListener('auth-lost', lost);

    return () => window.removeEventListener('auth-lost', lost);
  }, []);

  if (user === undefined) return null;

  if (!user) {
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          setPage('send');
        }}
      />
    );
  }

  return (
    <div className="shell">
      <aside className="side">

        {/* School Logo and Name */}
        <div
          className="brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
          }}
        >
          <img
            src="/logo.png"
            alt="St Mary's School Logo"
            style={{
              width: '45px',
              height: '45px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />

          <span>
            <strong
              style={{
                display: 'inline-block',
                fontSize: '17px',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              St Mary's School
            </strong>

            <br />

            <small style={{ fontSize: '12px' }}>
              Samtoli, Simdega
            </small>
          </span>
        </div>

        {/* Navigation */}
        <nav>
          {NAV.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? 'active' : ''}
              onClick={() => setPage(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {/* User and Logout */}
        <div className="who">
          <small>{user.username}</small>

          <button
            onClick={async () => {
              await api('POST', '/logout').catch(() => {});
              setUser(null);
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {page === 'send' && (
          <Send
            onSent={(id) => {
              setSel(id);
              setPage('track');
            }}
          />
        )}

        {page === 'track' && (
          <Track
            selected={sel}
            setSelected={setSel}
          />
        )}

        {page === 'records' && <Records />}
      </main>
    </div>
  );
}
