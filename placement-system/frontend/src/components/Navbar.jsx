import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useState } from 'react';

function Navbar() {
  const { user, isAuthenticated, isStudent, isStaff, isPlacement, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
        isActive(to)
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
      {isActive(to) && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
      )}
    </Link>
  );

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || '?';
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'STAFF':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PLACEMENT':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const UserAvatar = () => {
    // Determine profile route based on role
    const profileRoute = isStudent ? '/profile' : isStaff ? '/staff/profile' : '/placement/profile';
    
    // Use profile_photo from user object (updated by refreshUser)
    const avatarContent = user?.profile_photo ? (
      <img
        src={`http://localhost:8000${user.profile_photo}`}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
        {getInitials()}
      </div>
    );

    return (
      <Link 
        to={profileRoute} 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        title="View Profile"
      >
        {avatarContent}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Placement System
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {/* Student Navigation */}
              {isStudent && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/drives">Drives</NavLink>
                  <NavLink to="/applications">My Applications</NavLink>
                </>
              )}

              {/* Staff Navigation */}
              {isStaff && (
                <>
                  <NavLink to="/staff/dashboard">Dashboard</NavLink>
                  <NavLink to="/staff/students">Students</NavLink>
                  <NavLink to="/staff/drives">Drives</NavLink>
                  <NavLink to="/staff/applications">Applications</NavLink>
                </>
              )}

              {/* Placement Navigation */}
              {isPlacement && (
                <>
                  <NavLink to="/placement/dashboard">Dashboard</NavLink>
                  <NavLink to="/placement/drives">Drives</NavLink>
                  <NavLink to="/placement/students">Students</NavLink>
                  <NavLink to="/placement/applications">Applications</NavLink>
                  <NavLink to="/placement/users">Users</NavLink>
                </>
              )}
            </div>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name || user?.username}
                </p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor()}`}>
                  {user?.role}
                </span>
              </div>
              <UserAvatar />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Mobile User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-3">
              <UserAvatar />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name || user?.username}
                </p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor()}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            {isStudent && (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link to="/drives" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Drives
                </Link>
                <Link to="/applications" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  My Applications
                </Link>
              </>
            )}

            {isStaff && (
              <>
                <Link to="/staff/dashboard" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link to="/staff/students" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Students
                </Link>
                <Link to="/staff/drives" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Drives
                </Link>
                <Link to="/staff/applications" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Applications
                </Link>
              </>
            )}

            {isPlacement && (
              <>
                <Link to="/placement/dashboard" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link to="/placement/drives" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Drives
                </Link>
                <Link to="/placement/students" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Students
                </Link>
                <Link to="/placement/applications" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Applications
                </Link>
                <Link to="/placement/users" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Users
                </Link>
              </>
            )}

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
