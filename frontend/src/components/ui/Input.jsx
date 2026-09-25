export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 transition
          ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}