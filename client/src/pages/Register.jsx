import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Field from '../components/Field.jsx';
import Spinner from '../components/Spinner.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import TeamMembers from '../components/TeamMembers.jsx';
import useAuth from '../hooks/useAuth.js';
import { hackathonApi, parseError } from '../services/api.js';
import { validateRegistration } from '../utils/validators.js';
import { BRANCHES, COLLEGES, COURSES, DOMAINS, YEARS } from '../utils/constants.js';

const emptyMember = () => ({ name: '', email: '' });
// Team size 1 is solo (no extra rows); sizes 2-5 generate that many member rows.
const memberCount = (size) => (Number(size) <= 1 ? 0 : Number(size));

const section = 'text-lg font-bold text-ink';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editing = params.get('edit') === '1';

  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '', mobileNumber: '', collegeName: '', course: '',
    branch: '', yearOfStudy: '', domain: '', projectName: '', pptLink: '', prototypeLink: '', demoVideoLink: '',
    teamSize: '1', teamMembers: [],
  });

  // Load any existing entry: block duplicates, or prefill the form when editing.
  useEffect(() => {
    hackathonApi.myEntry()
      .then(({ data }) => {
        const reg = data.registration;
        setExisting(reg);
        if (reg && editing) {
          setForm({
            fullName: reg.fullName, email: reg.email, mobileNumber: reg.mobileNumber, collegeName: reg.collegeName,
            course: reg.course, branch: reg.branch, yearOfStudy: reg.yearOfStudy, domain: reg.domain,
            projectName: reg.projectName, pptLink: reg.pptLink, prototypeLink: reg.prototypeLink,
            demoVideoLink: reg.demoVideoLink || '', teamSize: String(reg.teamSize), teamMembers: reg.teamMembers || [],
          });
        }
      })
      .catch((err) => toast.error(parseError(err).message))
      .finally(() => setChecking(false));
  }, [editing]);

  if (checking) return <Spinner label="Loading registration form" className="min-h-[60vh]" />;
  if (existing && !editing) return <Navigate to="/dashboard" replace />;

  const clearError = (key) => errors[key] && setErrors((prev) => ({ ...prev, [key]: '' }));
  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    clearError(e.target.name);
  };
  const onTeamSize = (e) => {
    const size = e.target.value;
    const count = memberCount(size);
    setForm((f) => ({
      ...f,
      teamSize: size,
      // Keep what was already typed, add blank rows or trim extras.
      teamMembers: Array.from({ length: count }, (_, i) => f.teamMembers[i] || emptyMember()),
    }));
    clearError('teamSize');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateRegistration(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields');
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      projectName: form.projectName.trim(),
      pptLink: form.pptLink.trim(),
      prototypeLink: form.prototypeLink.trim(),
      demoVideoLink: form.demoVideoLink.trim(),
      teamSize: Number(form.teamSize),
      teamMembers: form.teamMembers.map((m) => ({ name: m.name.trim(), email: m.email.trim().toLowerCase() })),
    };
    try {
      if (editing && existing) {
        await hackathonApi.update(existing._id, payload);
        toast.success('Registration updated');
        navigate('/dashboard');
      } else {
        const { data } = await hackathonApi.register(payload);
        navigate('/register/success', { state: { registration: data.registration, emailSent: data.emailSent } });
      }
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">{editing ? 'Edit your registration' : 'Register for the hackathon'}</h1>
      <p className="mt-2 text-muted">All fields are required except the demo video.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-10">
        <div className="space-y-4">
          <h2 className={section}>About you</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} autoComplete="name" />
            <Field label="Email address" name="email" type="email" value={form.email} readOnly error={errors.email} hint="Taken from your verified account." className="[&_input]:bg-mist" />
            <Field label="Mobile number" name="mobileNumber" type="tel" inputMode="numeric" maxLength={10} value={form.mobileNumber}
              onChange={(e) => onChange({ target: { name: 'mobileNumber', value: e.target.value.replace(/\D/g, '') } })}
              error={errors.mobileNumber} placeholder="10-digit number" autoComplete="tel-national" />
            <Field label="College name" name="collegeName" as="select" options={COLLEGES} value={form.collegeName} onChange={onChange} error={errors.collegeName} />
            <Field label="Course" name="course" as="select" options={COURSES} value={form.course} onChange={onChange} error={errors.course} />
            <Field label="Branch" name="branch" as="select" options={BRANCHES} value={form.branch} onChange={onChange} error={errors.branch} />
            <Field label="Year of study" name="yearOfStudy" as="select" options={YEARS} value={form.yearOfStudy} onChange={onChange} error={errors.yearOfStudy} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={section}>Your project</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Domain / track" name="domain" as="select" options={DOMAINS} value={form.domain} onChange={onChange} error={errors.domain} />
            <Field label="Project name" name="projectName" value={form.projectName} onChange={onChange} error={errors.projectName} />
            <Field label="PPT link" name="pptLink" type="url" value={form.pptLink} onChange={onChange} error={errors.pptLink} placeholder="Google Drive or OneDrive link" hint="Set sharing to “anyone with the link can view”." className="sm:col-span-2" />
            <Field label="Prototype link" name="prototypeLink" type="url" value={form.prototypeLink} onChange={onChange} error={errors.prototypeLink} placeholder="GitHub, Figma or live demo URL" className="sm:col-span-2" />
            <Field label="Demo video link (optional)" name="demoVideoLink" type="url" value={form.demoVideoLink} onChange={onChange} error={errors.demoVideoLink} placeholder="YouTube or Google Drive link" className="sm:col-span-2" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={section}>Your team</h2>
          <Field label="Team size" name="teamSize" as="select" options={['1', '2', '3', '4', '5'].map((n) => ({ value: n, label: n === '1' ? '1 (solo)' : `${n} members` }))}
            value={form.teamSize} onChange={onTeamSize} error={errors.teamSize} className="sm:max-w-xs" placeholder="Select team size" />
          <TeamMembers members={form.teamMembers} onChange={(teamMembers) => setForm((f) => ({ ...f, teamMembers }))} errors={errors} />
        </div>

        <SubmitButton loading={loading}>
          {loading ? 'Saving' : editing ? 'Save changes' : 'Submit registration'}
        </SubmitButton>
      </form>
    </section>
  );
}
