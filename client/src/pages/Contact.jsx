import { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Field from '../components/Field.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { contactApi, parseError } from '../services/api.js';
import { validateContact } from '../utils/validators.js';
import { COMPANY_EMAIL } from '../utils/constants.js';

const EMPTY = { name: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateContact(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      const { data } = await contactApi.send({ ...form, email: form.email.trim().toLowerCase() });
      toast.success(data.message);
      setForm(EMPTY);
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Questions about the hackathon?</h1>
        <p className="mt-4 text-muted">Ask about eligibility, tracks, team rules or your registration. We read every message.</p>
        <a href={`mailto:${COMPANY_EMAIL}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
          <Mail className="h-5 w-5" aria-hidden="true" /> {COMPANY_EMAIL}
        </a>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm md:col-span-3">
        <Field label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} autoComplete="name" />
        <Field label="Email address" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
        <Field label="Message" name="message" as="textarea" value={form.message} onChange={onChange} error={errors.message} />
        <SubmitButton loading={loading}>{loading ? 'Sending' : 'Send message'}</SubmitButton>
      </form>
    </section>
  );
}
