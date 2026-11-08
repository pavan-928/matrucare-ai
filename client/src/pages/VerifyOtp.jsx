import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';
import OtpInput from '../components/OtpInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';
import { authApi, parseError } from '../services/api.js';
import { vEmail } from '../utils/validators.js';

const RESEND_SECONDS = 30;

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state?.email || '');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(state?.email ? RESEND_SECONDS : 0);

  // Resend countdown.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const needsEmail = !state?.email;
  const checkEmail = () => {
    const msg = vEmail(email);
    setEmailError(msg);
    return !msg;
  };

  const onVerify = async (e) => {
    e.preventDefault();
    if (needsEmail && !checkEmail()) return;
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ email: email.trim().toLowerCase(), otp });
      toast.success(data.message);
      navigate('/login', { replace: true, state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      const { message } = parseError(err);
      setError(message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (needsEmail && !checkEmail()) return;
    setResending(true);
    try {
      const { data } = await authApi.resendOtp({ email: email.trim().toLowerCase() });
      toast.success(data.message);
      setCooldown(RESEND_SECONDS);
      setError('');
      setOtp('');
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={state?.email ? `We sent a 6-digit code to ${state.email}. It expires in 10 minutes.` : 'Enter your email and the 6-digit code we sent you.'}
      footer={<Link to="/login" className="font-semibold text-brand hover:underline">Back to login</Link>}
    >
      <form onSubmit={onVerify} noValidate className="space-y-5">
        {needsEmail && <Field label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} autoComplete="email" />}
        <div>
          <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(''); }} disabled={loading} hasError={!!error} />
          {error && <p role="alert" className="mt-2 text-sm text-rose">{error}</p>}
        </div>
        <SubmitButton loading={loading}>{loading ? 'Verifying' : 'Verify OTP'}</SubmitButton>
        <button type="button" onClick={onResend} disabled={resending || cooldown > 0} className="btn btn-outline w-full">
          {resending ? 'Sending' : cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </button>
      </form>
    </AuthShell>
  );
}
