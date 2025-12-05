// Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Menu from './Menu'; // keep this filename or update import if you save Menu differently

function Profile() {
  const navigate = useNavigate();

  // Initialize user — create createdAt if new
  const [user, setUser] = useState(() => {
    const existing = JSON.parse(localStorage.getItem('user'));
    if (existing) return existing;

    const newUser = {
      name: 'Guest',
      email: 'guest@example.com',
      about: 'Hello! I am new here.',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    newPassword: '',
    about: user?.about || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // optionally redirect if unauthenticated — commented out for local testing
    // if (!user || !user.email) navigate('/login');
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'about' && value.length > 300) return;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        name: formData.name || user.name,
        about: formData.about,
        // preserve createdAt
        createdAt: user.createdAt || new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      // Replace with your toast system if you have one
      alert('Profile updated successfully (local).');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser({ name: 'Guest', email: '' });
    navigate('/login');
  };

  // safe parse of createdAt
  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : '—';

  return (
    <>
      <style>{`
        :root{
          --bg-1: #f8f1ea;
          --card-bg: rgba(255,255,255,0.92);
          --accent: #9b6f4a; /* warm pastel brown */
          --accent-2: #b0896a;
          --muted: #6b5846;
        }

        /* page background - retained decorative image for blown pastel look */
        .profile-bg {
          min-height: 100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          background-image:
            linear-gradient(180deg, rgba(255,250,247,0.6), rgba(244,237,229,0.5)),
            url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=1');
          background-size: cover;
          background-position:center;
          font-family: 'Inter', system-ui, -apple-system, 'Merriweather', serif;
          color:var(--muted);
          position:relative;
          padding: 40px 24px;
        }

        /* blown pastel card */
        .profile-card {
          width: min(860px, 96%);
          padding: 36px;
          border-radius: 22px;
          box-shadow:
            0 8px 30px rgba(17,12,9,0.12),
            inset 0 1px 0 rgba(255,255,255,0.6);
          background: linear-gradient(135deg, rgba(255,255,255,0.95), var(--card-bg));
          border: 1px solid rgba(154,121,93,0.08);
          transform: translateY(0);
          animation: floaty 6s ease-in-out infinite;
          position: relative;
          overflow: visible;
          transition: transform 300ms ease;
        }

        @keyframes floaty{
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        .profile-header {
          display:flex;
          gap:18px;
          align-items:center;
          margin-bottom: 20px;
        }

        .avatar {
          width:92px;
          height:92px;
          border-radius: 18px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:38px;
          color: #fff;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          box-shadow: 0 12px 30px rgba(155,111,74,0.18);
          transform: rotate(-6deg);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .avatar:hover { transform: rotate(0deg) scale(1.04); box-shadow: 0 18px 38px rgba(155,111,74,0.22); }

        .profile-title {
          font-weight:800;
          font-size:22px;
          letter-spacing: 0.2px;
          color:var(--muted);
        }
        .profile-sub {
          color: #7b6454;
          font-size:13px;
          margin-top:6px;
        }

        .btn-accent {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          border: none;
          color: #fff;
          box-shadow: 0 10px 26px rgba(154,121,93,0.16);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .btn-accent:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(154,121,93,0.22); }

        .btn-ghost {
          background: transparent;
          border: 1px dashed rgba(107,88,70,0.12);
          color: var(--muted);
        }

        .edit-panel {
          margin-top: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.45));
          padding: 18px;
          border-radius: 12px;
          border: 1px solid rgba(160,135,112,0.06);
          box-shadow: 0 6px 18px rgba(17,12,9,0.04);
        }

        .form-control:focus {
          box-shadow: 0 8px 20px rgba(154,121,93,0.06) !important;
          border-color: var(--accent-2);
          transform: translateY(-1px);
        }

        label {
          color: #6b5846;
          font-weight: 600;
          font-size: 13px;
        }

        .meta-row {
          display:flex;
          gap:12px;
          align-items:center;
          margin-top: 8px;
          margin-bottom: 6px;
        }

        .menu-toggle {
          position: absolute;
          left: 22px;
          top: 22px;
          z-index: 40;
          border-radius: 12px;
          padding: 8px 12px;
          display:flex;
          gap:8px;
          align-items:center;
          background: linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3));
          border: 1px solid rgba(107,88,70,0.08);
          box-shadow: 0 6px 18px rgba(17,12,9,0.08);
          transition: transform 160ms ease;
        }
        .menu-toggle:hover { transform: translateY(-3px); }

        .muted-small { color: #7d6a57; font-size:13px; }

        .section-title {
          position:relative;
          display:inline-block;
          padding-bottom:6px;
          font-weight:700;
          color: var(--muted);
        }
        .section-title::after{
          content:'';
          position:absolute;
          left:0;
          bottom:0;
          height:3px;
          width:36%;
          background: linear-gradient(90deg, rgba(155,111,74,0.6), rgba(176,137,107,0.6));
          border-radius:3px;
          transform-origin:left;
          transition: width 350ms ease;
        }
        .section-title:hover::after { width:100%; }

        /* responsive */
        @media (max-width:900px){
          .profile-card { padding: 22px; border-radius:16px; }
          .avatar { width:78px; height:78px; font-size:30px; }
        }
        @media (max-width:600px){
          .profile-header { gap:12px; }
          .profile-card { padding: 18px; }
          .avatar { width:66px; height:66px; font-size:24px; }
        }
      `}</style>

      <div className="profile-bg">
        {/* Menu button */}
        <button
          aria-label="Open menu"
          className="menu-toggle"
          onClick={() => setIsMenuOpen(true)}
        >
          <i className="bi bi-list" style={{ fontSize: 18, color: 'var(--muted)' }}></i>
          <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Menu</span>
        </button>

        {/* Sliding Menu component */}
        <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Main card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar" title={user.name}>
              {user.name && user.name[0] ? user.name[0].toUpperCase() : 'U'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div>
                  <div className="profile-title">{user.name}</div>
                  <div className="profile-sub">
                    Member since: <span className="muted-small">{memberYear}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#7b6454', fontWeight: 700 }}>{user.email}</div>
                  <div className="meta-row" style={{ marginTop: 10 }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={handleLogout}
                      title="Log out"
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic info area */}
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 240 }}>
              <div className="section-title">Profile</div>
              <div style={{ marginTop: 10 }} className="muted-small">
                A cozy little dashboard where users make the space their own.
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {!isEditing && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6b5846', fontWeight: 600 }}>Name</div>
                      <div style={{ marginTop: 6 }}>{user.name}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, color: '#6b5846', fontWeight: 600 }}>Email</div>
                      <div style={{ marginTop: 6 }}>{user.email}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 13, color: '#6b5846', fontWeight: 600, marginBottom: 6 }}>About</div>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(255,255,255,0.8)',
                      padding: 14,
                      borderRadius: 12,
                      border: '1px solid rgba(160,135,112,0.05)',
                      boxShadow: '0 8px 20px rgba(17,12,9,0.04)'
                    }}>
                      {user.about || <span style={{ color: '#a78a71' }}>No about set yet. Click Edit to add one.</span>}
                    </div>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <button
                      className="btn btn-accent"
                      onClick={() => {
                        setFormData({ ...formData, name: user.name, about: user.about || '' });
                        setIsEditing(true);
                      }}
                      style={{ width: 180 }}
                    >
                      <i className="bi bi-pencil-square me-2"></i>Edit Profile
                    </button>
                  </div>
                </>
              )}

              {isEditing && (
                <form className="edit-panel" onSubmit={handleUpdate}>
                  <div className="row">
                    <div className="col-12 col-md-6 mb-3">
                      <label htmlFor="name">Name</label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="col-12 col-md-6 mb-3">
                      <label htmlFor="newPassword">New password (optional)</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Leave blank to keep current"
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label htmlFor="about">About (max 300 chars)</label>
                      <textarea
                        id="about"
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        className="form-control"
                        rows={4}
                        placeholder="Tell others something about you..."
                      />
                      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 12, color: '#8b6f55' }}>A short bio shown on your profile.</div>
                        <div style={{ fontSize: 12, color: '#9b6f4a' }}>{formData.about.length}/300</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        // reset edits
                        setFormData({ name: user.name, newPassword: '', about: user.about || '' });
                        setIsEditing(false);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-accent"
                      disabled={loading}
                      style={{ minWidth: 120 }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
