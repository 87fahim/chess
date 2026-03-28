import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/userAuth';

const RequireAuth = ({ allowedRoles = [] }) => {
  const { isAuthenticated, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner

  const hasRole = roles?.some(r => allowedRoles.includes(r));

  if (!isAuthenticated) {
    // not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole) {
    // logged in but not authorized
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
