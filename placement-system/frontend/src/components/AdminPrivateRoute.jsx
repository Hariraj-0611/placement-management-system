import { Navigate } from 'react-router-dom';

const AdminPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_access_token');

  if (!token) {
    // Redirect to admin login if no token
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminPrivateRoute;
