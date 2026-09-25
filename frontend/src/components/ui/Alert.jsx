const styles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  info: 'bg-sky-50 border-sky-200 text-sky-700',
};

export default function Alert({ variant = 'error', children }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${styles[variant]}`}
    >
      <span className="mt-0.5 shrink-0">&#9432;</span>
      <span>{children}</span>
    </div>
  );
}