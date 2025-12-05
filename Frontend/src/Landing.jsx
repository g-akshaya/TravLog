import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';

/**
 * Landing.jsx — fixed GitHub CTA overlap
 *
 * - The corner GitHub link is hidden on large screens (>=900px)
 *   so it doesn't overlap the in-card "View on GitHub" button.
 * - On small screens, the in-card CTA moves into the flow and
 *   the corner link appears (small icon + text) so repo remains reachable.
 */

function Landing() {
  const navigate = useNavigate();
  const repoUrl = "https://github.com/g-akshaya/TravLog.git";

  const openRepo = () => {
    window.open(repoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="landing-root">
      <style>{`
        /* Base layout + background */
        .landing-root {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Merriweather', serif;
          color: #4a3b2c;
          background: radial-gradient(1200px 400px at 10% 10%, rgba(255,250,245,0.35), transparent 15%),
                      radial-gradient(1200px 400px at 90% 90%, rgba(240,235,230,0.28), transparent 15%),
                      url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=2');
          background-size: cover;
          background-position: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        /* Glass-card */
        .hero-card {
          width: 100%;
          max-width: 980px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(248,241,229,0.96), rgba(245,240,232,0.92));
          border: 1px solid rgba(196,171,137,0.6);
          box-shadow: 0 20px 40px rgba(20,18,16,0.18);
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 30px;
          align-items: center;
          transform: translateY(10px);
          animation: cardPop 700ms cubic-bezier(.2,.9,.2,1) both;
          position: relative;
        }

        @keyframes cardPop {
          from { opacity: 0; transform: translateY(18px) scale(.995); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top-right repo button inside the card */
        .repo-cta {
          position: absolute;
          top: 14px;
          right: 14px;
          display:flex;
          gap:8px;
          align-items:center;
          z-index: 5;
        }
        .repo-btn {
          background: linear-gradient(90deg,#8b5e3c,#b5774f);
          color: #fff;
          border: none;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(139,94,60,0.16);
          display:inline-flex;
          gap:8px;
          align-items:center;
          cursor:pointer;
        }

        /* Corner persistent GitHub link (small) */
        .repo-corner {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 1400;
          background: rgba(255,255,255,0.9);
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          display:flex;
          gap:8px;
          align-items:center;
        }
        .repo-corner a { color:#5A3E2B; font-weight:700; text-decoration:none; display:flex; gap:8px; align-items:center; }

        /* Hide the corner link on large screens so it doesn't overlap the in-card CTA */
        @media (min-width: 900px) {
          .repo-corner {
            display: none;
          }
        }

        /* And conversely hide the in-card CTA on very small screens (so a single corner control remains) */
        @media (max-width: 520px) {
          .repo-cta { display: none; }
          .repo-corner { right: 10px; top: 10px; padding: 6px; }
          .repo-corner a span { display: inline-block; }
        }

        /* Left text column */
        .hero-left h1 {
          font-size: 2.6rem;
          margin-bottom: 8px;
          color: #5a3d2b;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-badge {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background: linear-gradient(135deg,#8b5e3c,#6f3f2a);
          color: #fff;
          width:56px;
          height:56px;
          border-radius:12px;
          box-shadow: 0 6px 18px rgba(139,94,60,0.28);
          font-size: 1.35rem;
        }
        .hero-sub {
          color:#6b5847;
          font-size:1.05rem;
          line-height:1.5;
          margin-bottom: 18px;
        }

        /* CTA group */
        .cta-row {
          display:flex;
          gap:12px;
          align-items:center;
          margin-top:6px;
        }

        .btn-primary-animated {
          background: linear-gradient(90deg,#8b5e3c,#b5774f);
          border: none;
          color: white;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 8px 20px rgba(139,94,60,0.18);
          transition: transform .22s cubic-bezier(.2,.9,.2,1), box-shadow .22s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary-animated:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 18px 36px rgba(139,94,60,0.22);
        }
        .btn-secondary-ghost {
          background: transparent;
          border: 1px solid rgba(161,135,105,0.9);
          color: #6b5847;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 600;
          transition: transform .18s, background .18s, color .18s;
        }
        .btn-secondary-ghost:hover {
          background: rgba(161,135,105,0.06);
          transform: translateY(-3px);
        }

        /* Right preview column (illustration + plane) */
        .hero-right {
          position: relative;
          min-height: 240px;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .preview-card {
          width:100%;
          max-width:360px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
          border-radius:14px;
          padding:18px;
          box-shadow: 0 12px 30px rgba(20,18,16,0.08);
          border: 1px solid rgba(204,184,157,0.6);
          transform-origin: center;
          animation: floatSlow 6s ease-in-out infinite;
        }
        @keyframes floatSlow {
          0% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0) rotate(-1deg); }
        }

        .preview-title {
          font-weight:700;
          color:#4a3b2c;
          margin-bottom:6px;
        }
        .preview-sub {
          color:#7a6656;
          font-size:0.95rem;
        }

        /* Paper plane flying across */
        .paper-plane {
          position: absolute;
          top: -10%;
          right: -6%;
          width: 100px;
          height: 100px;
          transform-origin: center;
          animation: planeFly 6.8s linear infinite;
          z-index: 2;
          opacity: 0.95;
        }
        @keyframes planeFly {
          0% { transform: translate(0, 0) rotate(-20deg) scale(.85); opacity: 0; }
          8% { opacity: 1; }
          50% { transform: translate(-330px, 80px) rotate(10deg) scale(1); opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translate(-700px, 180px) rotate(40deg) scale(.7); opacity: 0; }
        }

        /* subtle badges */
        .feature-badges {
          display:flex;
          gap:8px;
          margin-top:14px;
          flex-wrap:wrap;
        }
        .feature {
          background: rgba(139,94,60,0.06);
          color:#6b5847;
          padding:8px 10px;
          border-radius:10px;
          font-weight:600;
          font-size:0.85rem;
          border: 1px solid rgba(139,94,60,0.06);
        }

        /* Wave bottom decorative */
        .hero-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hero-card { grid-template-columns: 1fr; padding: 26px; gap: 18px; }
          .hero-right { order: -1; }
          .paper-plane { width:70px; height:70px; top:-8%; right:-8%; }
          .repo-cta { position: static; margin-bottom: 12px; justify-content:flex-end; }
        }

        /* Keyboard focus style */
        .btn-primary-animated:focus, .btn-secondary-ghost:focus, .repo-btn:focus {
          outline: 3px solid rgba(139,94,60,0.14);
          outline-offset: 3px;
        }
      `}</style>

      <div className="hero-card" role="main" aria-labelledby="hero-title">
        {/* GitHub CTA (top-right inside card) */}
        <div className="repo-cta" aria-hidden>
          <button className="repo-btn" onClick={openRepo} aria-label="View TravLog on GitHub">
            <i className="bi bi-github" aria-hidden />
            View on GitHub
          </button>
        </div>

        {/* Corner persistent GitHub link (small) - hidden on wide screens to prevent overlap */}
        <div className="repo-corner" aria-hidden>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" title="View TravLog on GitHub">
            <i className="bi bi-github" aria-hidden />
            <span>GitHub</span>
          </a>
        </div>

        {/* LEFT - Brand + Text */}
        <div className="hero-left">
          <h1 id="hero-title">
            <span className="brand-badge" aria-hidden>
              <i className="bi bi-compass-fill"></i>
            </span>
            <span style={{ marginLeft: 8 }}>TravLog</span>
          </h1>

          <p className="hero-sub">
            TravLog is your pocket travel-journal: beautifully capture stories, geo-tag your adventures, upload photos, and track trip expenses , all in one place.
          </p>

          <div className="cta-row" role="group" aria-label="Primary actions">
            <button
              className="btn-primary-animated"
              onClick={() => navigate('/login')}
              aria-label="Go to login"
            >
              <i className="bi bi-journal-arrow-up me-2" aria-hidden></i>
              I already have an account
            </button>

            <button
              className="btn-secondary-ghost"
              onClick={() => navigate('/signup')}
              aria-label="Sign up for TravLog"
            >
              <i className="bi bi-pencil-square me-2" aria-hidden></i>
              New here? Start a journal
            </button>
          </div>

          <div className="feature-badges" aria-hidden>
            <div className="feature">Geo-tagged maps</div>
            <div className="feature">Photo gallery</div>
            <div className="feature">Expense tracker</div>
            <div className="feature">Offline-ready (soon)</div>
          </div>

          <p style={{ marginTop: 18, color: '#7a6656', fontSize: '0.92rem' }}>
            Start documenting your travels with a design that matches your memories — calm, warm and personal.
          </p>
        </div>

        {/* RIGHT - Preview / Illustration */}
        <div className="hero-right" aria-hidden>
          {/* Flying paper plane SVG (decorative) */}
          <svg className="paper-plane" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M2 30 L62 2 L38 36 L54 62 L26 40 L2 30 Z" fill="#f2e9e0" stroke="#c4ab89" strokeWidth="1.2" />
            <path d="M62 2 L38 36" stroke="#b5774f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          </svg>

          <div className="preview-card" role="img" aria-label="Preview card showing an entry snapshot">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: '#9a7c5f', fontWeight: 700 }}>Paris • Sep 2025</div>
              <div style={{ fontSize: 12, color: '#7a6656' }}>₹ 7,452</div>
            </div>

            <h3 className="preview-title">Cafés & Cobblestones</h3>
            <p className="preview-sub">Stumbled upon a tiny cafe near the river. Croissant like a dream, afternoon like a painting.</p>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <img src="https://images.pexels.com/photos/209898/pexels-photo-209898.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1"
                   alt="trip-sample-1"
                   style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, boxShadow: '0 8px 18px rgba(0,0,0,0.06)' }} />
              <img src="https://images.pexels.com/photos/298292/pexels-photo-298292.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1"
                   alt="trip-sample-2"
                   style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#6b5847' }}>
                +{3}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave SVG at bottom */}
        <svg className="hero-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 C150,120 350,0 600,50 C850,100 1050,30 1200,70 L1200,120 L0,120 Z" fill="rgba(241,235,226,0.85)"></path>
        </svg>
      </div>
    </div>
  );
}

export default Landing;
