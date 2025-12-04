import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/login', { 
        email, 
        password 
      });
      
      if (response.data.message === 'Login successful') {
  localStorage.setItem('user', JSON.stringify(response.data.user));
  console.log("Redirecting to home...");
  navigate('/home');
}

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: `'Merriweather', serif`,
        color: '#4a3b2c',
      }}
    >
      <div
        className="p-4 shadow-lg rounded-4"
        style={{
          minWidth: '370px',
          backgroundColor: 'rgba(248, 241, 229, 0.92)',
          border: '1px solid #c4ab89',
          backdropFilter: 'blur(6px)',
        }}
      >
        <h2 className="text-center mb-3" style={{ color: '#5a3d2b' }}>
          <i className="bi bi-box-arrow-in-right me-2"></i>Welcome Back
        </h2>
        <p className="text-center mb-4" style={{ color: '#6b5847', fontStyle: 'italic' }}>
          Continue your adventure log
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              <i className="bi bi-envelope-open me-2 text-brown"></i>Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your registered email"
              autoComplete="off"
              className="form-control rounded-3"
              style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              <i className="bi bi-key me-2 text-brown"></i>Secret Code
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Your access code"
              className="form-control rounded-3"
              style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 rounded-3 mb-3"
            style={{ backgroundColor: '#8b5e3c', color: '#fff', border: 'none' }}
          >
            <i className="bi bi-journal-arrow-up me-2"></i>Log Back In
          </button>

          <p className="text-center text-muted">New to the adventure?</p>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 rounded-3"
            style={{ borderColor: '#a18769', color: '#6b5847' }}
            onClick={() => navigate('/signup')}
          >
            <i className="bi bi-pencil-square me-2"></i>Create a Travel Journal
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;