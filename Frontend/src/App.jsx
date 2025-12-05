import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './signup';
import Login from './login';
import Home from './home';
import MyEntries from './entries';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Gallery from './Gallery'; 
import Profile from './Profile'; 
import Landing from './Landing'; // 🆕 Add this import

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); 
  }, []);

  const isAuthenticated = () => !!user;

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>; 
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/signup" element={<Signup />} />
        {/* Pass setUser to Login to update authentication state */}
        <Route path="/login" element={<Login setUser={setUser} />} /> 
        
        {/* 🆕 New Landing Page Route: accessible to all */}
        <Route path="/landing" element={<Landing />} />

        {/* Existing Authenticated Routes */}
        <Route
          path="/home"
          element={isAuthenticated() ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/entries"
          element={isAuthenticated() ? <MyEntries /> : <Navigate to="/login" />}
        />
        
        {/* NEW Authenticated Routes for Menu */}
        <Route
          path="/gallery"
          element={isAuthenticated() ? <Gallery /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated() ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Default route: Directs to /home if authenticated, otherwise to /landing */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? "/home" : "/landing"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;