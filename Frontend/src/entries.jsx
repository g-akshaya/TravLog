// entries.jsx — same functionality, upgraded animated UI (keep same background)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MapDisplay from './MapDisplay';
import Menu from './Menu';

// Utility to get currency symbol
const getCurrencySymbol = (currencyCode) => {
  const map = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹' };
  return map[currencyCode] || currencyCode;
};

// small animated count-up hook (for totals)
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    if (to === 0) { setValue(0); return; }
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue((from + (to - from) * eased).toFixed(2));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function TotalExpenseDisplay({ expenses, currency }) {
  const total = (expenses || []).reduce((s, i) => s + (i.amount || 0), 0);
  return (
    <div className="total-expense px-3 py-2 rounded-2">
      <strong>Total:</strong>
      <span style={{ float: 'right', fontWeight: 800 }}>{getCurrencySymbol(currency || 'USD')} {total.toFixed(2)}</span>
    </div>
  );
}

export default function MyEntries() {
  const [travelEntries, setTravelEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [filter, setFilter] = useState({
    expenseMin: '',
    expenseMax: '',
    locationFilter: '',
    minPics: '',
  });

  const fetchEntries = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/entries/${user.email}`);
      // support array or nested shapes
      const payload = Array.isArray(response.data) ? response.data : (response.data.entries || response.data.data || []);
      setTravelEntries(payload);
    } catch (error) {
      console.error("Error fetching entries:", error);
      alert("Failed to load travel entries.");
    }
  }, [navigate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      await axios.delete(`http://localhost:3001/entries/${id}`);
      // slight visual confirmation via browser alert kept simple
      alert("Entry deleted successfully!");
      setSelectedEntry(null); 
      fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry.");
    }
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    localStorage.setItem("selectedEntry", JSON.stringify(entry));
  };

  const handleAddNewEntry = () => {
    navigate('/home'); 
  };

  const handleCloseModal = () => {
    setSelectedEntry(null);
    localStorage.removeItem("selectedEntry");
  };

  // filtering logic preserved, used to produce filteredEntries
  const filteredEntries = useMemo(() => {
    if (!travelEntries || travelEntries.length === 0) return [];
    const { expenseMin, expenseMax, locationFilter, minPics } = filter;
    return travelEntries.filter(entry => {
      const totalExpense = entry.expenses ? entry.expenses.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;
      const min = parseFloat(expenseMin) || 0;
      const max = parseFloat(expenseMax) || Infinity;
      if (totalExpense < min || totalExpense > max) return false;

      const search = (locationFilter || '').toLowerCase();
      if (search && !(entry.country?.toLowerCase().includes(search) || entry.title?.toLowerCase().includes(search) || entry.content?.toLowerCase().includes(search))) return false;

      const picCount = entry.images ? entry.images.length : 0;
      if (parseInt(minPics || 0) > picCount) return false;

      return true;
    });
  }, [travelEntries, filter]);

  const totalEntriesCount = useCountUp(travelEntries.length, 500);

  // Render
  return (
    <div className="entries-page">
      <style>{`
        /* Keep same background image, full-bleed */
        .entries-page {
          min-height: 100vh;
          background-image: url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
          background-size: cover;
          background-position: center;
          font-family: 'Merriweather', serif;
          color: #4a3b2c;
          padding: 28px;
        }

        /* Floating menu button */
        .menu-button {
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 1200;
          background: linear-gradient(180deg,#5a3d2b,#4a2f22);
          color: #fff;
          border: none;
          padding: 10px 14px;
          border-radius: 10px;
          box-shadow: 0 12px 36px rgba(10,8,6,0.18);
        }

        /* Centered container with glass card */
        .entries-container {
          max-width: 1080px;
          margin: 72px auto 40px;
          background: rgba(255,255,255,0.94);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(196,171,137,0.32);
          box-shadow: 0 30px 70px rgba(12,10,8,0.12);
          position: relative;
          overflow: visible;
        }

        /* Header */
        .entries-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom: 16px;
        }
        .brand {
          display:flex;
          gap:12px;
          align-items:center;
        }
        .brand .logo {
          width:56px; height:56px; border-radius:12px; display:grid; place-items:center;
          background: linear-gradient(135deg,#8b5e3c,#6f3f2a); color:#fff;
          box-shadow: 0 10px 28px rgba(139,94,60,0.16);
        }
        .brand h2 { margin:0; color:#5a3d2b; font-size:1.4rem; }
        .brand p { margin:0; color:#7a6656; font-size:0.95rem; }

        /* Filter card */
        .filter-card {
          margin-bottom: 16px;
          background: linear-gradient(180deg,#fffaf3,#fff7ec);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(204,184,157,0.6);
          display:flex;
          gap:12px;
          align-items:center;
          justify-content: space-between;
        }
        .filter-controls { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .filter-controls .form-control { min-width: 140px; }

        /* Animated list */
        .list {
          margin-top: 8px;
          display:flex;
          flex-direction:column;
          gap:12px;
        }

        .entry-card {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius: 12px;
          background: linear-gradient(180deg,#fff,#fffdf8);
          border: 1px solid rgba(200,180,150,0.12);
          box-shadow: 0 10px 32px rgba(12,10,8,0.06);
          cursor:pointer;
          transform-origin:center;
          transition: transform .28s cubic-bezier(.2,.9,.2,1), box-shadow .28s;
          will-change: transform;
          opacity: 0;
          transform: translateY(12px) scale(.995);
          animation: fadeSlideUp .46s forwards;
        }

        /* small stagger: uses inline style delays from map */
        @keyframes fadeSlideUp {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .entry-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 60px rgba(12,10,8,0.12);
        }

        .entry-left { display:flex; gap:12px; align-items:center; flex:1; min-width:0; }
        .entry-left .meta { color: #6b5847; font-size:0.93rem; }
        .entry-title { margin:0; color:#8b5e3c; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 420px; }

        .badges { display:flex; gap:8px; align-items:center; margin-right: 8px; }
        .badge {
          background: linear-gradient(90deg, rgba(250,250,250,0.9), rgba(245,240,236,0.9));
          border-radius: 8px;
          padding:6px 10px;
          display:inline-flex;
          gap:8px;
          align-items:center;
          font-weight:700;
          color:#4a3b2c;
          box-shadow: 0 6px 18px rgba(12,10,8,0.04);
        }
        .badge.photos { animation: badgeFloat 2000ms ease-in-out infinite; }
        @keyframes badgeFloat { 0%{ transform: translateY(0);} 50% { transform: translateY(-3px);} 100% { transform: translateY(0);} }

        .entry-actions { display:flex; gap:8px; align-items:center; }

        /* Add button */
        .add-btn {
          margin-top:8px;
          width:100%;
          padding:12px;
          border-radius: 12px;
          border: none;
          font-weight:700;
          color: #fff;
          background: linear-gradient(90deg,#8b5e3c,#b5774f);
          box-shadow: 0 18px 48px rgba(12,10,8,0.12);
          transition: transform .12s;
        }
        .add-btn:active { transform: translateY(2px); }

        /* Modal: high z-index so it appears over Menu */
        .modal-backdrop {
          position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index: 4000;
          background: linear-gradient(180deg, rgba(0,0,0,0.48), rgba(0,0,0,0.45));
          padding: 20px;
        }
        .modal-panel {
          width:100%; max-width: 980px; max-height: 86vh; overflow:auto; border-radius: 12px;
          background: white; box-shadow: 0 30px 90px rgba(12,10,8,0.2);
          animation: modalPop .34s cubic-bezier(.2,.9,.2,1);
        }
        @keyframes modalPop { from { transform: translateY(12px) scale(.98); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
        .modal-header { display:flex; justify-content:space-between; align-items:center; padding:14px; border-bottom: 1px solid rgba(240,240,240,0.8); }
        .modal-body { padding:14px; }

        /* prettier lists and expense box */
        .expense-list li { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom: 1px dashed rgba(220,220,220,0.6); }
        .total-expense { background: linear-gradient(90deg,#fffaf3,#fff7ec); border-radius:8px; border:1px solid rgba(200,180,150,0.08); margin-top:12px; }

        /* small responsive */
        @media (max-width: 920px) {
          .entry-title { max-width: 220px; }
          .entries-container { margin: 40px 14px; padding: 16px; }
        }
      `}</style>

      {/* Menu button */}
      <button className="menu-button" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
        <i className="bi bi-list" /> Menu
      </button>

      {/* Off-canvas Menu component (existing) */}
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main container */}
      <div className="entries-container" role="main" aria-labelledby="entries-heading">
        <div className="entries-header">
          <div className="brand">
            <div className="logo" aria-hidden><i className="bi bi-journal-text" style={{ fontSize: 22 }} /></div>
            <div>
              <h2 id="entries-heading">My Travel Journals</h2>
              <p>Check your memories here!</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#7a6656' }}>Total entries</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{totalEntriesCount}</div>
          </div>
        </div>

        {/* Filter card (UI-only, animations via transitions) */}
        <div className="filter-card" role="region" aria-label="Filters">
          <div className="filter-controls">
            <input className="form-control form-control-sm" placeholder="Search by country/title/content" value={filter.locationFilter} onChange={(e)=>setFilter({...filter, locationFilter: e.target.value})} />
            <input className="form-control form-control-sm" placeholder="Min expense" type="number" value={filter.expenseMin} onChange={(e)=>setFilter({...filter, expenseMin: e.target.value})} />
            <input className="form-control form-control-sm" placeholder="Max expense" type="number" value={filter.expenseMax} onChange={(e)=>setFilter({...filter, expenseMax: e.target.value})} />
            <input className="form-control form-control-sm" placeholder="Min pictures" type="number" value={filter.minPics} onChange={(e)=>setFilter({...filter, minPics: e.target.value})} />
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilter({ expenseMin:'', expenseMax:'', locationFilter:'', minPics:0 })}>Reset</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchEntries()}>Refresh</button>
          </div>
        </div>

        {/* List */}
        <div className="list" role="list" aria-live="polite">
          {filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 28, color: '#6b5847' }}>
              {travelEntries.length === 0 ? 'No entries yet — start one!' : 'No entries match your filters.'}
            </div>
          ) : (
            filteredEntries.map((entry, idx) => (
              <div
                role="listitem"
                key={entry._id || idx}
                className="entry-card"
                style={{ animationDelay: `${idx * 65}ms` }}
                onClick={() => handleViewEntry(entry)}
                title="Click to view details"
              >
                <div className="entry-left">
                  <div style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <h5 className="entry-title">{entry.title || 'Untitled'}</h5>
                      <div className="meta" style={{ marginLeft:6 }}>{entry.country || ''}</div>
                    </div>
                    <div className="meta" style={{ marginTop:6, maxWidth:600, overflow:'hidden', textOverflow:'ellipsis' }}>{entry.content}</div>
                    <div style={{ marginTop:8, color:'#8b7a67', fontSize:13 }}>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div className="badges" aria-hidden>
                    {entry.images && entry.images.length > 0 && <div className="badge photos"><i className="bi bi-image"></i> {entry.images.length}</div>}
                    {entry.expenses && entry.expenses.length > 0 && (
                      <div className="badge expense">
                        <i className="bi bi-wallet2"></i>
                        {getCurrencySymbol(entry.currency || 'USD')} {(entry.expenses.reduce((s,i)=>s+(i.amount||0),0)).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="entry-actions">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry._id); }}
                      aria-label={`Delete ${entry.title}`}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="add-btn" onClick={handleAddNewEntry}><i className="bi bi-plus-circle me-2"></i> Add New Entry</button>
      </div>

      {/* Modal for selected entry */}
      {selectedEntry && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={handleCloseModal}>
          <div className="modal-panel" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h4 style={{ margin: 0 }}>{selectedEntry.title}</h4>
                <div style={{ color: '#6b5847' }}>{selectedEntry.country || ''} • {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString() : ''}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm btn-outline-secondary" onClick={handleCloseModal}><i className="bi bi-x-lg" /></button>
                <button className="btn btn-sm btn-danger" onClick={() => { handleDeleteEntry(selectedEntry._id); handleCloseModal(); }}><i className="bi bi-trash" /></button>
              </div>
            </div>

            <div className="modal-body">
              {selectedEntry.location && (
                <>
                  <h6 className="text-muted"><i className="bi bi-pin-map me-1"></i> Location</h6>
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(200,180,150,0.12)', marginBottom: 12 }}>
                    <MapDisplay location={selectedEntry.location} />
                  </div>
                </>
              )}

              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <>
                  <h6 className="text-muted"><i className="bi bi-images me-1"></i> Trip Photos</h6>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                    {selectedEntry.images.map((img, i) => (
                      <img key={i} src={img.startsWith('http') ? img : `http://localhost:3001${img}`} alt={`img-${i}`} style={{ height: 120, objectFit: 'cover', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                    ))}
                  </div>
                </>
              )}

              <h6 className="text-muted"><i className="bi bi-journal-text me-1"></i> Story</h6>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedEntry.content}</p>

              {selectedEntry.expenses && selectedEntry.expenses.length > 0 && (
                <>
                  <h6 className="text-muted mt-3"><i className="bi bi-cash-stack me-1"></i> Expenses</h6>
                  <ul className="expense-list" style={{ listStyle:'none', paddingLeft:0 }}>
                    {selectedEntry.expenses.map((ex, i) => (
                      <li key={i}>
                        <span>{ex.category}</span>
                        <span style={{ float:'right', fontWeight:700 }}>{getCurrencySymbol(selectedEntry.currency || 'USD')}{(ex.amount||0).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <TotalExpenseDisplay expenses={selectedEntry.expenses} currency={selectedEntry.currency} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
