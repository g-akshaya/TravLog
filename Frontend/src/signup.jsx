import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * Beautified & animated Signup page
 * - Keeps original register flow (axios POST -> /register)
 * - Adds animated entrance, floating illustration, subtle field focus, animated CTA
 * - Self-contained CSS in a <style> tag so you can paste this file directly
 */

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    // subtle entrance focus for accessibility
    cardRef.current?.querySelector('input')?.focus();
  }, []);

  useEffect(() => {
    // shake when error appears
    if (errorMsg && cardRef.current) {
      cardRef.current.classList.remove('shake');
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add('shake');
    }
  }, [errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill all fields to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // assume server returns success message
      alert(res.data?.message || 'Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      setErrorMsg(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-root" role="main" aria-labelledby="signup-heading">
      <style>{`
        :root {
          --brand-1: #8b5e3c;
          --brand-2: #b5774f;
          --muted: #6b5847;
          --card: rgba(248,241,229,0.96);
        }

        .signup-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Merriweather', serif;
          padding: 36px;
          background:
            radial-gradient(900px 280px at 8% 12%, rgba(255,250,245,0.32), transparent 12%),
            radial-gradient(900px 280px at 92% 88%, rgba(240,235,230,0.20), transparent 12%),
            url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2');
          background-size: cover;
          background-position: center;
        }

        .signup-card {
          width: 100%;
          max-width: 980px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 28px;
          padding: 26px;
          border-radius: 16px;
          background: linear-gradient(180deg, var(--card), rgba(245,240,232,0.94));
          border: 1px solid rgba(196,171,137,0.6);
          box-shadow: 0 28px 64px rgba(18,16,14,0.16);
          animation: cardIn .6s cubic-bezier(.2,.9,.2,1) both;
          overflow: hidden;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .left {
          padding: 6px 10px;
        }
        .brand {
          display:flex;
          gap:12px;
          align-items:center;
          margin-bottom:6px;
        }

        .brand .logo {
          width:56px;
          height:56px;
          border-radius:12px;
          display:grid;
          place-items:center;
          background: linear-gradient(135deg,var(--brand-1), #6f3f2a);
          color:white;
          box-shadow: 0 8px 20px rgba(139,94,60,0.18);
          font-size:1.25rem;
        }

        .brand h2 { margin:0; color: var(--brand-1); font-size:1.35rem; }
        .brand p { margin:0; color: var(--muted); font-size:0.95rem; }

        form { margin-top: 12px; }

        .form-control {
          background: #fffaf3;
          border: 1px solid #ccb89d;
          padding: 12px 14px;
          border-radius: 10px;
          transition: box-shadow .18s, transform .12s;
        }
        .form-control:focus {
          outline: none;
          box-shadow: 0 12px 30px rgba(139,94,60,0.12);
          transform: translateY(-2px);
          border-color: var(--brand-1);
        }

        .input-icon { position: relative; }
        .input-icon .icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(107,88,71,0.9);
          font-size: 1rem;
        }
        .input-icon input { padding-left: 40px; }

        .password-toggle {
          position:absolute;
          right:8px;
          top:50%;
          transform: translateY(-50%);
          border:none;
          background:transparent;
          color: var(--muted);
          padding:6px;
        }

        .cta {
          display:flex;
          gap:10px;
          margin-top:14px;
        }
        .btn-primary-animated {
          background: linear-gradient(90deg,var(--brand-1), var(--brand-2));
          color: white;
          padding: 12px 18px;
          border-radius: 12px;
          border: none;
          font-weight:700;
          box-shadow: 0 14px 36px rgba(139,94,60,0.16);
          transition: transform .18s cubic-bezier(.2,.9,.2,1), box-shadow .18s;
        }
        .btn-primary-animated:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 26px 48px rgba(139,94,60,0.22); }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(161,135,105,0.9);
          color: var(--muted);
          padding: 10px 14px;
          border-radius: 12px;
        }
        .btn-ghost:hover { transform: translateY(-3px); background: rgba(161,135,105,0.04); }

        .right {
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 6px 10px;
        }

        .promo {
          width:100%;
          max-width:360px;
          padding:16px;
          border-radius:12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
          border: 1px solid rgba(204,184,157,0.6);
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

        .mini-row { display:flex; gap:8px; margin-top:12px; justify-content:center; }
        .mini-img { width:84px; height:64px; object-fit:cover; border-radius:8px; box-shadow: 0 8px 18px rgba(0,0,0,0.06); }

        .success-note { margin-top:12px; color: #256029; background: rgba(235,255,242,0.9); padding:8px; border-radius:8px; border: 1px solid rgba(100,200,150,0.12); }

        .error { margin-top:10px; color:#7a2b2b; background: rgba(255,235,235,0.92); padding:10px; border-radius:8px; border:1px solid rgba(200,120,120,0.2); }

        /* small badge row */
        .badges { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
        .badge-soft { background: rgba(139,94,60,0.06); padding:8px 10px; border-radius:10px; font-weight:600; color:var(--muted); }

        .shake { animation: shake 560ms cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        @media (max-width: 920px) {
          .signup-card { grid-template-columns: 1fr; padding:18px; gap:18px; }
          .right { order: -1; }
          .promo { max-width:100%; }
        }
      `}</style>

      <div ref={cardRef} className="signup-card" role="region" aria-label="Sign up panel">
        <div className="left" aria-hidden={false}>
          <div className="brand" aria-hidden>
            <div className="logo"><i className="bi bi-compass-fill"></i></div>
            <div>
              <h2>Create your TravLog</h2>
              <p>Begin storing your travel stories, photos and expenses with style.</p>
            </div>
          </div>

          {errorMsg && <div className="error" role="alert">{errorMsg}</div>}

          <form onSubmit={handleSubmit} aria-describedby={errorMsg ? "error" : undefined}>
            <div className="mb-3 input-icon">
              <span className="icon"><i className="bi bi-person"></i></span>
              <input
                className="form-control"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-label="Full name"
                required
              />
            </div>

            <div className="mb-3 input-icon">
              <span className="icon"><i className="bi bi-envelope"></i></span>
              <input
                className="form-control"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Email address"
                required
              />
            </div>

            <div className="mb-3 position-relative input-icon">
              <span className="icon"><i className="bi bi-key"></i></span>
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>

            <div className="badges" aria-hidden>
              <div className="badge-soft">Geo-tagged entries</div>
              <div className="badge-soft">Photo gallery</div>
              <div className="badge-soft">Expense tracking</div>
            </div>

            <div className="cta">
              <button
                className="btn-primary-animated"
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? 'Creating account…' : <><i className="bi bi-suitcase me-2"></i>Start my TravLog</>}
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate('/login')}
              >
                <i className="bi bi-box-arrow-in-left me-2"></i>Already have account
              </button>
            </div>
          </form>
        </div>

        <div className="right" aria-hidden>
          <div className="promo" role="img" aria-label="Illustration of travel preview">
            <h4>Ready to roam?</h4>
            <p>Capture the little details — café notes, street names, receipts — and keep memories beautifully organized.</p>

            <div className="mini-row">
              <img className="mini-img" src="https://images.pexels.com/photos/209898/pexels-photo-209898.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" alt="sample" />
              <img className="mini-img" src="https://images.pexels.com/photos/298292/pexels-photo-298292.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" alt="sample" />
              <img className="mini-img" src="https://images.pexels.com/photos/396547/pexels-photo-396547.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1" alt="sample" />
            </div>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <small style={{ color: '#7a6656' }}>Animated previews & micro-interactions make journaling delightful.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
