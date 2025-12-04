import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";  // Add this import
import axios from "axios";

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting:", { name, email, password });
        
        axios.post('http://localhost:3001/register', { name, email, password })
            .then(response => {
                console.log("Full response:", response);
                alert("Registration successful! Please login.");
                navigate('/login');
            })
            .catch(error => {
                console.error("Error details:", error.response?.data || error.message);
                alert(`Error: ${error.response?.data?.error || error.message}`);
            });
    };


  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: `'Merriweather', serif`,
        color: '#4a3b2c'
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
          <i className="bi bi-journal-text me-2"></i>Begin Your Journey
        </h2>
        <p className="text-center mb-4" style={{ color: '#6b5847', fontStyle: 'italic' }}>
          Start recording your travel memories today
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">
              <i className="bi bi-person me-2 text-brown"></i>Traveler Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="How should we call you?"
              name="name"
              autoComplete="off"
              className="form-control rounded-3"
              style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d' }}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              <i className="bi bi-envelope-open me-2 text-brown"></i>Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Where should we send updates?"
              name="email"
              autoComplete="off"
              className="form-control rounded-3"
              style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d' }}
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
              placeholder="Create your access code"
              name="password"
              className="form-control rounded-3"
              style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d' }}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 rounded-3 mb-3"
            style={{ backgroundColor: '#8b5e3c', color: '#fff', border: 'none' }}
            
          >
            <i className="bi bi-suitcase me-2"></i>Start My Travel Journal
          </button>

          <p className="text-center text-muted">Already documenting your adventures?</p>

          <button
            type="button"
            className="btn btn-outline-secondary w-100 rounded-3"
            style={{ borderColor: '#a18769', color: '#6b5847' }}
            onClick={() => window.location.href = '/login'}
          >
            <i className="bi bi-passport me-2"></i>Continue My Journey
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;