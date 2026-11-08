import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import useAuth from '../hooks/useAuth.js';
import { authApi, parseError } from '../services/api.js';
import { validateSignup } from '../utils/validators.js';

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateSignup(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const payload = { ...form, email: form.email.trim().toLowerCase(), fullName: form.fullName.trim() };
      const { data } = await authApi.signup(payload);
      toast.success(data.message);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      const { message, fieldErrors, status } = parseError(err);
      setErrors(fieldErrors);
      toast.error(message);
      // Account exists but the OTP email failed: let the user retry from the OTP page.
      if (status === 502) navigate('/verify-otp', { state: { email: payload_email(form) } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up to register your team for the hackathon."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Full name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} autoComplete="name" />
        <Field label="Email address" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} autoComplete="new-password" hint="At least 8 characters with a letter and a number." />
        <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} autoComplete="new-password" />
        <SubmitButton loading={loading}>{loading ? 'Creating account' : 'Create account'}</SubmitButton>
      </form>
    </AuthShell>
  );
}

const payload_email = (form) => form.email.trim().toLowerCase();
