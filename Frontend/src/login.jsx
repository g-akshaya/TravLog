import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Beautified & animated Login page.
 * - Keeps original login flow and setUser prop usage.
 * - Adds animations (entrance, floating accent, button hover, form field focus).
 * - Includes password reveal, "remember me", and error shake animation.
 * - Self-contained styles so you can paste directly.
 */

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    // If an error appears, trigger a subtle shake animation
    if (error && cardRef.current) {
      cardRef.current.classList.remove('shake');
      // reflow to restart animation
      // eslint-disable-next-line no-unused-expressions
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add('shake');
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email,
        password
      });

      if (response.data.message === 'Login successful') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (remember) localStorage.setItem('rememberEmail', email);
        setUser(response.data.user);
        navigate('/home');
      } else {
        setError(response.data.error || 'Login failed. Please try again.');
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      localStorage.removeItem('user');
      setUser(null);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // prefill remembered email if any
    const remembered = localStorage.getItem('rememberEmail');
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, []);

  return (
    <div className="login-root" role="main" aria-labelledby="login-heading">
      <style>{`
        :root{
          --brand-1: #8b5e3c;
          --brand-2: #b5774f;
          --muted: #6b5847;
          --card-bg: rgba(248,241,229,0.96);
        }

        .login-root{
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:32px;
          background:
            radial-gradient(800px 300px at 10% 10%, rgba(255,250,245,0.28), transparent 10%),
            radial-gradient(800px 300px at 90% 90%, rgba(240,235,230,0.22), transparent 10%),
            url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2');
          background-size:cover;
          background-position:center;
          font-family: 'Merriweather', serif;
        }

        /* Center card */
        .login-card{
          width:100%;
          max-width:920px;
          display:grid;
          grid-template-columns: 1fr 420px;
          gap: 28px;
          background: linear-gradient(180deg, var(--card-bg), rgba(245,240,232,0.94));
          border: 1px solid rgba(196,171,137,0.6);
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(18,16,14,0.16);
          padding: 28px;
          align-items:center;
          overflow: hidden;
          animation: cardEntrance .6s cubic-bezier(.2,.9,.2,1) both;
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(18px) scale(.995); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* left: form area */
        .login-left {
          padding: 8px 12px;
        }
        .logo {
          display:flex;
          align-items:center;
          gap:12px;
          margin-bottom:8px;
        }
        .logo .badge{
          width:56px;
          height:56px;
          border-radius:12px;
          display:inline-grid;
          place-items:center;
          color:#fff;
          background: linear-gradient(135deg,var(--brand-1), #6f3f2a);
          box-shadow: 0 8px 20px rgba(139,94,60,0.18);
          font-size:1.25rem;
        }
        .login-title{
          font-size:1.6rem;
          color:var(--brand-1);
          margin:0;
        }
        .login-sub {
          margin-top:6px;
          color:var(--muted);
          font-style: italic;
        }

        /* form */
        form { margin-top: 14px; }
        .form-floating .form-control, .form-control {
          background: #fffaf3;
          border: 1px solid #ccb89d;
          padding: 12px 14px;
          border-radius: 10px;
          transition: box-shadow .18s, transform .12s ease;
        }
        .form-control:focus {
          outline: none;
          box-shadow: 0 10px 30px rgba(139,94,60,0.12);
          transform: translateY(-2px);
          border-color: var(--brand-1);
        }

        .input-with-icon { position: relative; }
        .input-with-icon .icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(107,88,71,0.85);
          font-size: 1.05rem;
          pointer-events: none;
        }
        .input-with-icon input { padding-left: 40px; }

        /* password reveal button */
        .password-toggle {
          position:absolute;
          right:8px;
          top:50%;
          transform: translateY(-50%);
          border:none;
          background: transparent;
          color: var(--muted);
          padding:6px 8px;
          border-radius:8px;
        }

        /* remember + links */
        .small-row { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:8px; }
        .small-row a { color: var(--muted); text-decoration:none; font-size:0.92rem; }
        .small-row a:hover { text-decoration:underline; }

        /* cta buttons */
        .cta-group { display:flex; gap:10px; margin-top:14px; }
        .btn-primary-animated {
          background: linear-gradient(90deg,var(--brand-1), var(--brand-2));
          color: #fff;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          box-shadow: 0 14px 32px rgba(139,94,60,0.16);
          transition: transform .18s cubic-bezier(.2,.9,.2,1), box-shadow .18s;
        }
        .btn-primary-animated:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 26px 48px rgba(139,94,60,0.22); }
        .btn-ghost {
          background: transparent;
          color: var(--muted);
          border: 1px solid rgba(161,135,105,0.9);
          padding: 10px 14px;
          border-radius: 12px;
        }
        .btn-ghost:hover { transform: translateY(-3px); background: rgba(161,135,105,0.04); }

        /* right: marketing / illustration */
        .login-right {
          padding: 12px;
          display:flex;
          justify-content:center;
          align-items:center;
        }
        .promo {
          width:100%;
          max-width:360px;
          border-radius:12px;
          padding:18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
          border:1px solid rgba(204,184,157,0.6);
          box-shadow: 0 12px 30px rgba(20,18,16,0.06);
          transform-origin:center;
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0) rotate(-0.8deg); }
          50% { transform: translateY(-8px) rotate(0.8deg); }
          100% { transform: translateY(0) rotate(-0.8deg); }
        }
        .promo h4 { margin:0 0 6px 0; color:var(--brand-1); }
        .promo p { margin:0; color:#7a6656; font-size:0.95rem; }

        .images-row { display:flex; gap:8px; margin-top:12px; justify-content:center; }
        .mini-img { width:84px; height:64px; object-fit:cover; border-radius:8px; box-shadow: 0 8px 18px rgba(0,0,0,0.06); }

        /* error box */
        .error-box { margin-top:10px; color:#7a2b2b; background: rgba(255,235,235,0.9); border:1px solid rgba(200,120,120,0.2); padding:10px; border-radius:8px; }

        /* small social row */
        .social-row { display:flex; gap:8px; justify-content:center; margin-top:14px; }
        .social-btn {
          border-radius:10px;
          padding:8px 10px;
          border:1px solid rgba(0,0,0,0.06);
          background: rgba(255,255,255,0.7);
          font-size:16px;
        }

        /* shake animation on error */
        .shake { animation: shake 560ms cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        /* responsive */
        @media (max-width: 920px) {
          .login-card { grid-template-columns: 1fr; padding:18px; gap:18px; }
          .login-right { order: -1; }
          .promo { max-width:100%; }
        }
      `}</style>

      <div ref={cardRef} className="login-card" role="region" aria-label="Login panel">
        {/* LEFT: Form */}
        <div className="login-left">
          <div className="logo" aria-hidden>
            <div className="badge"><i className="bi bi-compass-fill"></i></div>
            <div>
              <h3 className="login-title">TravLog</h3>
              <div className="login-sub">Welcome back — pick up where you left off.</div>
            </div>
          </div>

          {error && <div className="error-box" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} aria-describedby={error ? "error-msg" : undefined}>
            <div className="mb-3 input-with-icon">
              <span className="icon"><i className="bi bi-envelope"></i></span>
              <input
                aria-label="Email address"
                type="email"
                id="email"
                className="form-control"
                placeholder="Your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3 position-relative input-with-icon">
              <span className="icon"><i className="bi bi-key"></i></span>
              <input
                aria-label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control"
                placeholder="Your access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(s => !s)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>

            <div className="small-row">
              <label className="d-flex align-items-center gap-2" style={{ fontSize: '0.93rem' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span style={{ color: 'var(--muted)' }}>Remember me</span>
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Use password reset flow (not implemented).'); }}>
                Forgot password?
              </a>
            </div>

            <div className="cta-group">
              <button
                disabled={isLoading}
                type="submit"
                className="btn-primary-animated"
              >
                {isLoading ? 'Signing in…' : <><i className="bi bi-journal-arrow-up me-2"></i>Log Back In</>}
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate('/signup')}
                aria-label="Sign up"
              >
                <i className="bi bi-pencil-square me-2"></i>Create account
              </button>
            </div>

            <div className="social-row" aria-hidden>
              <button className="social-btn"><i className="bi bi-google"></i></button>
              <button className="social-btn"><i className="bi bi-facebook"></i></button>
              <button className="social-btn"><i className="bi bi-github"></i></button>
            </div>
          </form>
        </div>

        {/* RIGHT: Promo / floating preview */}
        <div className="login-right" aria-hidden>
          <div className="promo">
            <h4>Capture Memories</h4>
            <p>Geo-tag entries, upload photos, and keep expense notes — elegantly stored and easy to revisit.</p>

            <div className="images-row" role="img" aria-label="Sample trip photos">
              <img alt="sample" className="mini-img" src="https://images.pexels.com/photos/209898/pexels-photo-209898.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" />
              <img alt="sample" className="mini-img" src="https://images.pexels.com/photos/298292/pexels-photo-298292.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" />
              <img alt="sample" className="mini-img" src="https://images.pexels.com/photos/396547/pexels-photo-396547.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
