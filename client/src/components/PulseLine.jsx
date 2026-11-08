/** Heartbeat line that draws itself once on load (see .pulse-path in index.css). */
export default function PulseLine() {
  const d = 'M0 50 H150 L175 50 L195 18 L225 86 L250 6 L275 70 L295 50 H520 L545 50 L565 28 L590 72 L610 50 H900 L925 50 L945 22 L975 78 L1000 50 H1200';
  return (
    <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="h-16 w-full sm:h-24" aria-hidden="true">
      <path d={d} pathLength="1" fill="none" stroke="#e8718d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="pulse-path" />
      <circle cx="1196" cy="50" r="5" fill="#f5a524" className="pulse-dot" />
    </svg>
  );
}
