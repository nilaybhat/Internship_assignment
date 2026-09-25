export default function StatCard({ label, value, accent = 'indigo' }) {
  const palettes = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${palettes[accent]}`}>{value}</p>
    </div>
  );
}