/**
 * PrivateRoute component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PrivateRoute component
 * @param {object} props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} props.requireAdmin - If true, requires admin role
 */
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;

