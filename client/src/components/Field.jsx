import { useId } from 'react';

/**
 * Labelled form control with inline error. Renders <input>, <select> or <textarea>.
 * For selects pass `options` (array of strings).
 */
export default function Field({ label, name, error, hint, as = 'input', options = [], placeholder, className = '', ...props }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const common = {
    id, name,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    className: `input ${error ? 'input-error' : ''}`,
    ...props,
  };

  let control;
  if (as === 'select') {
    control = (
      <select {...common}>
        <option value="">{placeholder || 'Select…'}</option>
        {options.map((o) => {
          const value = typeof o === 'object' ? o.value : o;
          const text = typeof o === 'object' ? o.label : o;
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea rows={5} placeholder={placeholder} {...common} />;
  } else {
    control = <input placeholder={placeholder} {...common} />;
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {control}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-rose">{error}</p>
        : hint ? <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
