import { useState } from 'react';
import { Login } from './pages/auth';
import { Dashboard } from './pages/dashboard';
import { Collaboration } from './pages/collaboration';
import { Incident } from './pages/incident';
import { CollaborationProject } from './pages/collaboration-project';
import { CollaborationRequests } from './pages/collaboration-requests';
import { Impact } from './pages/impact';
import { Profile } from './pages/profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleLogin = (credentials) => {
    console.log('Login attempt:', credentials);
    setUser({ email: credentials.email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'collaboration':
        return (
          <Collaboration
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
      case 'incidents':
        return (
          <Incident
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
      case 'projects':
        return (
          <CollaborationProject
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
      case 'profile':
        return (
          <Profile
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
      case 'requests':
        return (
          <CollaborationRequests
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
      case 'impact':
        return (
          <Impact
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard
            onLogout={handleLogout}
            user={user}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        );
    }
  };

  return (
    <>
      {!isAuthenticated ? <Login onLogin={handleLogin} /> : renderPage()}
    </>
  );
}

export default App;
