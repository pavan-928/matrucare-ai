import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo.jsx';
import useAuth from '../hooks/useAuth.js';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'text-brand' : 'text-ink/80 hover:text-brand'}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
      <Link to="/#about" className="rounded-md px-3 py-2 text-sm font-medium text-ink/80 transition hover:text-brand" onClick={close}>About</Link>
      <NavLink to="/contact" className={linkClass} onClick={close}>Contact</NavLink>
      {user ? (
        <>
          <NavLink to="/dashboard" className={linkClass} onClick={close}>Dashboard</NavLink>
          <button onClick={handleLogout} className="btn btn-outline md:ml-2">Logout</button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={linkClass} onClick={close}>Login</NavLink>
          <Link to="/signup" className="btn btn-primary md:ml-2" onClick={close}>Signup</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-mist/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">{links}</div>
        <button
          className="rounded-md p-2 text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="flex flex-col gap-1 border-t border-line bg-mist px-4 pb-4 pt-2 md:hidden">
          {links}
        </div>
      )}
    </header>
  );
}
