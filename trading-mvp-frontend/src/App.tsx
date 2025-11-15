import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Competitions from './pages/Competitions';
import MyCompetitions from './pages/MyCompetitions';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Check authentication on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    // Listen for storage changes (for logout/login)
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Function to update auth state (can be passed to child components if needed)
  const updateAuth = () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  };

  return (
    <Router>
      <Toaster position="top-right" />
      {isAuthenticated && <Navbar onLogout={updateAuth} />}

      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/competitions" /> : <Login onLogin={updateAuth} />}
        />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/competitions" /> : <Register onRegister={updateAuth} />}
        />

        <Route
          path="/competitions"
          element={isAuthenticated ? <Competitions /> : <Navigate to="/login" />}
        />

        <Route
          path="/my-competitions"
          element={isAuthenticated ? <MyCompetitions /> : <Navigate to="/login" />}
        />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/competitions" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
