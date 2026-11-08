import Field from './Field.jsx';

/** Dynamic member rows. The parent resizes `members` whenever team size changes. */
export default function TeamMembers({ members, onChange, errors }) {
  if (members.length === 0) {
    return <p className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-dark">You are participating solo. No extra team members needed.</p>;
  }
  const update = (i, key, value) => onChange(members.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));

  return (
    <div className="space-y-4">
      {members.map((m, i) => (
        <fieldset key={i} className="rounded-xl border border-line bg-mist/60 p-4">
          <legend className="px-1 text-sm font-semibold text-brand-dark">Member {i + 1}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Member name" value={m.name} onChange={(e) => update(i, 'name', e.target.value)} error={errors[`teamMembers.${i}.name`]} autoComplete="off" />
            <Field label="Member email" type="email" value={m.email} onChange={(e) => update(i, 'email', e.target.value)} error={errors[`teamMembers.${i}.email`]} autoComplete="off" />
          </div>
        </fieldset>
      ))}
    </div>
  );
}
