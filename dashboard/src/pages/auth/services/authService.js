export const authService = {
  login: async (credentials) => {
    try {
      console.log('Login attempt:', credentials);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            user: {
              email: credentials.email,
              name: 'Utilisateur Test',
              role: 'admin'
            },
            token: 'fake-jwt-token'
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export default authService;
