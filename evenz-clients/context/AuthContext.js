// // client/src/context/AuthContext.js
import React, { createContext,useContext, useState, useEffect } from 'react';
import api from '../services/api';

// export const AuthContext = createContext();
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  register: () => {},
  login: () => {},
  logout: () => {},
  updateProfile: () => {}
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/api/user/auth/me');
          setCurrentUser(res.data.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    const res = await api.post('/api/user/auth/register', userData);
    localStorage.setItem('authToken', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user);
    return res.data;
  };

  const login = async (credentials) => {
    const res = await api.post('/api/user/auth/login', credentials);
    localStorage.setItem('authToken', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const updateProfile = (userData) => {
    setCurrentUser({ ...currentUser, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// // Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// client/src/context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import api from '../services/api';

// export const AuthContext = createContext({
//   currentUser: null,
//   loading: true,
//   register: () => {},
//   login: () => {},
//   logout: () => {},
//   updateProfile: () => {}
// });

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           // Set token in API headers
//           api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
//           // Fetch current user
//           const res = await api.get('/api/user/auth/me');
//           setCurrentUser(res.data.user);
//         }
//       } catch (error) {
//         console.error('Failed to load user:', error);
//         // Clear invalid token
//         localStorage.removeItem('authToken');
//         delete api.defaults.headers.common['Authorization'];
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   const register = async (userData) => {
//     try {
//       const res = await api.post('/api/user/auth/register', userData);
      
//       // Store token
//       localStorage.setItem('authToken', res.data.token);
//       api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
//       // Set current user
//       setCurrentUser(res.data.user);
      
//       return res.data;
//     } catch (error) {
//       console.error('Registration error:', error);
//       throw error;
//     }
//   };

//   const login = async (credentials) => {
//     try {
//       const res = await api.post('/api/user/auth/login', credentials);
      
//       // Store token
//       localStorage.setItem('authToken', res.data.token);
//       api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
//       // Set current user
//       setCurrentUser(res.data.user);
      
//       return res.data;
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       // Call logout endpoint (optional)
//       if (currentUser) {
//         await api.post('/api/user/auth/logout');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Clear local storage and state
//       localStorage.removeItem('authToken');
//       delete api.defaults.headers.common['Authorization'];
//       setCurrentUser(null);
//     }
//   };

//   const updateProfile = async (userData) => {
//     try {
//       const res = await api.put('/api/user/auth/profile', userData);
//       setCurrentUser(res.data.user);
//       return res.data;
//     } catch (error) {
//       console.error('Update profile error:', error);
//       throw error;
//     }
//   };

//   const changePassword = async (passwordData) => {
//     try {
//       const res = await api.put('/api/user/auth/change-password', passwordData);
//       return res.data;
//     } catch (error) {
//       console.error('Change password error:', error);
//       throw error;
//     }
//   };

//   const value = {
//     currentUser,
//     loading,
//     register,
//     login,
//     logout,
//     updateProfile,
//     changePassword
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook for using auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };