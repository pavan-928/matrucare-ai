import { Loader2 } from 'lucide-react';

export default function SubmitButton({ loading, children, className = 'btn-primary', ...props }) {
  return (
    <button type="submit" disabled={loading} className={`btn w-full ${className}`} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
