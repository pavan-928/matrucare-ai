import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function RegistrationSuccess() {
  const { state } = useLocation();
  const reg = state?.registration;
  if (!reg) return <Navigate to="/dashboard" replace />;

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-14 w-14 text-brand" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-bold">You are registered, {reg.fullName.split(' ')[0]}</h1>
      <p className="mt-2 text-muted">
        {state.emailSent
          ? `We sent a confirmation email to ${reg.email}.`
          : 'Your registration is saved, but we could not send the confirmation email. Your dashboard has all the details.'}
      </p>
      <dl className="mx-auto mt-8 max-w-sm space-y-3 rounded-2xl border border-line bg-white p-6 text-left text-sm">
        <div className="flex justify-between gap-4"><dt className="text-muted">Project</dt><dd className="text-right font-semibold">{reg.projectName}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Domain</dt><dd className="font-semibold">{reg.domain}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Team size</dt><dd className="font-semibold">{reg.teamSize}</dd></div>
      </dl>
      <Link to="/dashboard" className="btn btn-primary mt-8">Go to dashboard</Link>
    </section>
  );
}
