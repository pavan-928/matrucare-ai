import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './Logo.jsx';
import { COMPANY_EMAIL, SOCIALS } from '../utils/constants.js';

export default function Footer() {
  return (
    <footer className="mt-24 bg-brand-dark text-white/85">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-white/70">AI for maternal and child healthcare. Build it with us.</p>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-white">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-saffron" to="/">Home</Link></li>
            <li><Link className="hover:text-saffron" to="/#about">About</Link></li>
            <li><Link className="hover:text-saffron" to="/contact">Contact</Link></li>
            <li><Link className="hover:text-saffron" to="/signup">Register</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-white">Get in touch</h3>
          <a href={`mailto:${COMPANY_EMAIL}`} className="mt-3 inline-flex items-center gap-2 text-sm hover:text-saffron">
            <Mail className="h-4 w-4" aria-hidden="true" /> {COMPANY_EMAIL}
          </a>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {SOCIALS.map((s) => (
              <li key={s.label}><a className="hover:text-saffron" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} MatruCare AI. All rights reserved.
      </div>
    </footer>
  );
}
