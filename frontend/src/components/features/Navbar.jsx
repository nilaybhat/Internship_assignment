import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const linkBase = 'rounded-lg px-3 py-1.5 text-sm font-medium transition';
const linkActive = 'bg-indigo-50 text-indigo-700';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              &#9745;
            </span>
            TaskTracker
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              Dashboard
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : 'text-slate-600 hover:bg-slate-50'}`
                }
              >
                Admin
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800">{user?.name}</p>
            <p className="text-xs leading-tight text-slate-500">{user?.email}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
              isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {user?.role ?? ''}
          </span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
}