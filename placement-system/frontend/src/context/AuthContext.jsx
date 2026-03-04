import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Set user data (including profile_photo for all roles)
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          department: data.department,
          profile_photo: data.profile_photo || null, // Add profile_photo to user object
        });
        
        // Set profile data if it exists (for students)
        if (data.cgpa || data.skills || data.profile_photo || data.resume) {
          setProfile({
            cgpa: data.cgpa || null,
            skills: data.skills || [],
            profile_photo: data.profile_photo || null,
            resume: data.resume || null,
            resume_filename: data.resume_filename || null,
          });
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh user data (call after profile photo upload)
  const refreshUser = async () => {
    if (token) {
      await fetchUserData();
    }
  };

  const login = async (username, password) => {
    try {
      const payload = { username, password };

      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setToken(data.access);
        
        // Set user immediately from login response
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          department: data.user.department,
        });
        
        return { 
          success: true, 
          role: data.user.role
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && token) {
        await fetch('http://localhost:8000/api/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    }
  };

  // Determine user role
  const isStudent = user?.role === 'STUDENT';
  const isStaff = user?.role === 'STAFF';
  const isPlacement = user?.role === 'PLACEMENT';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isStudent,
        isStaff,
        isPlacement,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
