import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/** Guards admin-only routes. Non-admins are sent back to the dashboard. */
export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}