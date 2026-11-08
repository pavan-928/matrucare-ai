import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import PulseLine from '../components/PulseLine.jsx';
import useAuth from '../hooks/useAuth.js';
import { COMPANY_EMAIL, HIGHLIGHTS, PRIZES, TIMELINE, TRACKS } from '../utils/constants.js';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
        <p className="inline-block rounded-full bg-saffron-soft px-3 py-1 text-sm font-semibold text-ink">Open to students across India</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          MatruCare AI Hackathon 2026
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Build AI that supports mothers and babies, from the first checkup to the first birthday. Pick a track, form a team of up to five and show us a working prototype.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={user ? '/register' : '/signup'} className="btn btn-accent px-6 py-3 text-base">
            Register now <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-outline px-6 py-3 text-base">
            {user ? 'Dashboard' : 'Login'}
          </Link>
        </div>
      </section>
      <PulseLine />

      {/* Highlights */}
      <section id="highlights" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 className="text-3xl font-bold">What you get</h2>
        <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="border-l-4 border-saffron pl-4">
              <dt className="font-display text-lg font-bold">{h.title}</dt>
              <dd className="mt-1 text-muted">{h.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Timeline */}
      <section id="timeline" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 className="text-3xl font-bold">Timeline</h2>
        <ol className="mt-8 max-w-2xl border-l-2 border-line">
          {TIMELINE.map((t, i) => (
            <li key={t.title} className="relative pb-8 pl-8 last:pb-0">
              <span className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-mist ${i === TIMELINE.length - 1 ? 'bg-rose' : 'bg-brand'}`} aria-hidden="true" />
              <p className="text-sm font-semibold text-brand">{t.date}</p>
              <h3 className="text-lg font-bold">{t.title}</h3>
              <p className="text-muted">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Prizes */}
      <section id="prizes" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 className="text-3xl font-bold">Prizes</h2>
        <div className="mt-8 grid items-end gap-4 md:grid-cols-3">
          {PRIZES.map((p, i) => (
            <div key={p.place} className={`rounded-2xl p-6 ${i === 0 ? 'bg-brand text-white md:order-2 md:py-12' : 'border border-line bg-white'} ${i === 1 ? 'md:order-1' : ''} ${i === 2 ? 'md:order-3' : ''}`}>
              <p className={`text-sm font-semibold ${i === 0 ? 'text-saffron' : 'text-brand'}`}>{p.place}</p>
              <p className="mt-1 font-display text-4xl font-extrabold">{p.amount}</p>
              <p className={`mt-2 text-sm ${i === 0 ? 'text-white/80' : 'text-muted'}`}>{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <h2 className="text-3xl font-bold">Domains and tracks</h2>
        <div className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1px' }}>
          {TRACKS.map((t) => (
            <div key={t.name} className="bg-white p-5">
              <h3 className="font-display text-lg font-bold text-brand">{t.name}</h3>
              <p className="mt-1 text-sm text-muted">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="grid gap-8 md:grid-cols-5">
          <h2 className="text-3xl font-bold md:col-span-2">About MatruCare AI</h2>
          <div className="space-y-4 text-lg text-muted md:col-span-3">
            <p>MatruCare AI builds technology for maternal and child healthcare. “Matru” means mother, and every product we make starts with the families who will use it.</p>
            <p>This hackathon invites students to turn ideas into prototypes that could help clinics, community health workers and families. Strong teams get feedback from our engineers and a path to our internship programme.</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-brand-soft p-8">
          <div>
            <h2 className="text-2xl font-bold">Have a question?</h2>
            <a href={`mailto:${COMPANY_EMAIL}`} className="mt-2 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
              <Mail className="h-5 w-5" aria-hidden="true" /> {COMPANY_EMAIL}
            </a>
          </div>
          <Link to="/contact" className="btn btn-primary">Send a message</Link>
        </div>
      </section>
    </>
  );
}
