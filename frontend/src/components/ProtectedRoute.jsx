import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/primitives';

export function ProtectedRoute({ children, admin = false, roles, superAdmin = false }) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Memeriksa sesi..." />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (admin && !isAdmin) return <Navigate to="/account" replace />;
  if (superAdmin && !isSuperAdmin) return <Navigate to="/admin" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin" replace />;

  return children;
}

export default ProtectedRoute;
