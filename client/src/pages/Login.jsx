import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import useAuth from '../hooks/useAuth.js';
import { parseError } from '../services/api.js';
import { validateLogin } from '../utils/validators.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    const email = form.email.trim().toLowerCase();
    try {
      const u = await login({ email, password: form.password });
      toast.success(`Welcome back, ${u.fullName.split(' ')[0]}`);
      navigate(state?.from || '/dashboard', { replace: true });
    } catch (err) {
      const { message, code } = parseError(err);
      if (code === 'NOT_VERIFIED') {
        toast.error(message);
        navigate('/verify-otp', { state: { email } });
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Access your dashboard and hackathon registration."
      footer={<>New here? <Link to="/signup" className="font-semibold text-brand hover:underline">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Email address" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} autoComplete="current-password" />
        <SubmitButton loading={loading}>{loading ? 'Logging in' : 'Log in'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
