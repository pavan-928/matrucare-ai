import { Link } from 'react-router-dom';

/** MatruCare AI wordmark with a small pulse mark. */
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="MatruCare AI home">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={light ? '#ffffff' : '#0e5a57'} />
        <path d="M6 34h14l6-14 8 28 6-14h18" fill="none" stroke={light ? '#0e5a57' : '#f5a524'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`font-display text-lg font-bold ${light ? 'text-white' : 'text-ink'}`}>
        MatruCare <span className={light ? 'text-saffron' : 'text-brand'}>AI</span>
      </span>
    </Link>
  );
}
