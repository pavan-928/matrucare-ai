import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner.jsx';
import useAuth from '../hooks/useAuth.js';
import { hackathonApi, parseError } from '../services/api.js';

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4">
    <dt className="w-40 shrink-0 text-sm text-muted">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium">{children}</dd>
  </div>
);
const LinkOut = ({ href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
    Open link <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
  </a>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    hackathonApi.myEntry()
      .then(({ data }) => setEntry(data.registration))
      .catch((err) => toast.error(parseError(err).message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your hackathon registration? You can register again afterwards.')) return;
    setDeleting(true);
    try {
      await hackathonApi.remove(entry._id);
      setEntry(null);
      toast.success('Registration deleted');
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.fullName.split(' ')[0]}</h1>
          <p className="mt-1 text-muted">Manage your hackathon registration here.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold">Your profile</h2>
        <dl className="mt-2 divide-y divide-line">
          <Row label="Name">{user.fullName}</Row>
          <Row label="Email">{user.email}</Row>
          <Row label="Account status">
            <span className="inline-flex items-center gap-1 text-brand"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified</span>
          </Row>
          <Row label="Hackathon status">
            {loading ? 'Checking…' : entry
              ? <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-brand-dark">Registered</span>
              : <span className="rounded-full bg-saffron-soft px-2.5 py-0.5 text-ink">Not registered</span>}
          </Row>
        </dl>
      </div>

      {loading ? <Spinner label="Loading your registration" /> : !entry ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/50 p-8 text-center">
          <h2 className="text-xl font-bold">You have not registered yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">Add your project and team details to take part in the hackathon.</p>
          <Link to="/register" className="btn btn-accent mt-5">Register now</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-5">
          <div className="rounded-2xl border border-line bg-white p-6 md:col-span-3">
            <h2 className="text-lg font-bold">Project details</h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="Project">{entry.projectName}</Row>
              <Row label="Domain">{entry.domain}</Row>
              <Row label="PPT"><LinkOut href={entry.pptLink} /></Row>
              <Row label="Prototype"><LinkOut href={entry.prototypeLink} /></Row>
              <Row label="Demo video">{entry.demoVideoLink ? <LinkOut href={entry.demoVideoLink} /> : 'Not provided'}</Row>
              <Row label="College">{entry.collegeName}</Row>
              <Row label="Course">{entry.course}, {entry.branch}, {entry.yearOfStudy}</Row>
              <Row label="Mobile">{entry.mobileNumber}</Row>
            </dl>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 md:col-span-2">
            <h2 className="text-lg font-bold">Team</h2>
            <p className="mt-2 text-sm text-muted">{entry.teamSize === 1 ? 'Solo participation' : `${entry.teamSize} members`}</p>
            <ul className="mt-3 divide-y divide-line">
              {entry.teamMembers.map((m) => (
                <li key={m.email} className="py-2.5 text-sm">
                  <p className="font-medium">{m.name}</p>
                  <p className="break-all text-muted">{m.email}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-5">
            <Link to="/register?edit=1" className="btn btn-outline">Edit registration</Link>
            <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">{deleting ? 'Deleting' : 'Delete registration'}</button>
          </div>
        </div>
      )}
    </section>
  );
}
