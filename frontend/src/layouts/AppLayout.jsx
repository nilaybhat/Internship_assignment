import { Outlet } from 'react-router-dom';
import Navbar from '../components/features/Navbar';

/** Shell for authenticated pages: navigation on top, content below. */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}