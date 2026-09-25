export default function Spinner({ label = 'Loading' }) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-10 text-slate-500"
      role="status"
      aria-live="polite"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      <span className="text-sm font-medium">{label}...</span>
    </div>
  );
}