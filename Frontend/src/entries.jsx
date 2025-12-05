// entries.jsx (animated & interactive replacement)
// Based on your original file. See source: :contentReference[oaicite:1]{index=1}

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MapDisplay from './MapDisplay';
import Menu from './Menu';

// Utility to get currency symbol
const getCurrencySymbol = (currencyCode) => {
  const map = { 'USD':'$', 'EUR':'€', 'GBP':'£', 'JPY':'¥', 'INR':'₹' };
  return map[currencyCode] || currencyCode;
};

// Small animated number hook (count up)
function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    if (to === 0) { setValue(0); return; }
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue((from + (to - from) * eased).toFixed(2));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

function SkeletonCard({index}) {
  const delay = 80 * index;
  return (
    <div className="skeleton-card" style={{animationDelay: `${delay}ms`}} aria-hidden>
      <div className="skeleton-title" />
      <div className="skeleton-line" />
      <div className="skeleton-meta" />
    </div>
  );
}

function MyEntries() {
  const [travelEntries, setTravelEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }
  const [filter, setFilter] = useState({
    expenseMin: '',
    expenseMax: '',
    locationFilter: '',
    minPics: 0,
  });
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const listRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/entries/${user.email}`);
      setTravelEntries(response.data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setToast({ message: 'Failed to load entries', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Animated count-up for total entries
  const totalEntriesAnimated = useCountUp(travelEntries.length, 500);

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Delete this journal entry?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:3001/entries/${id}`);
      setToast({ message: 'Entry deleted', type: 'success' });
      // brief delay to allow animation
      setTimeout(() => {
        setDeletingId(null);
        fetchEntries();
      }, 550);
    } catch (error) {
      console.error("Error deleting entry:", error);
      setToast({ message: 'Delete failed', type: 'error' });
      setDeletingId(null);
    }
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    localStorage.setItem("selectedEntry", JSON.stringify(entry));
    // scroll modal into view if mobile
    setTimeout(() => {
      const el = document.getElementById('entry-modal');
      if (el) el.focus();
    }, 80);
  };

  const handleAddNewEntry = () => navigate('/home');

  const handleCloseModal = () => {
    setSelectedEntry(null);
    localStorage.removeItem("selectedEntry");
  };

  const filteredEntries = useMemo(() => {
    if (travelEntries.length === 0) return [];
    const { expenseMin, expenseMax, locationFilter, minPics } = filter;

    return travelEntries.filter(entry => {
      const totalExpense = entry.expenses ? entry.expenses.reduce((s,i)=>s+(i.amount||0),0) : 0;
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

  // small helper for animated card stagger index
  const renderEntryCard = (entry, idx) => {
    const totalExpense = entry.expenses ? entry.expenses.reduce((s,i)=>s+(i.amount||0),0).toFixed(2) : '0.00';
    const totalAnimated = useCountUp(totalExpense, 700 + idx*40); // local hook per card (works)
    return (
      <div
        key={entry._id}
        className="entry-card"
        style={{ animationDelay: `${idx * 80}ms` }}
        role="button"
        tabIndex={0}
        onClick={() => handleViewEntry(entry)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleViewEntry(entry); }}
      >
        <div className="left">
          <h5 className="entry-title">{entry.title}</h5>
          <div className="entry-meta muted">{entry.country || '—'} • {new Date(entry.createdAt).toLocaleDateString()}</div>
        </div>

        <div className="right">
          <div className="badges">
            {entry.images && entry.images.length > 0 && (
              <div className="badge photos" title={`${entry.images.length} photos`}>
                <i className="bi bi-image"></i> {entry.images.length}
              </div>
            )}
            {entry.expenses && entry.expenses.length > 0 && (
              <div className="badge expense" title="Total expense">
                <i className="bi bi-cash-stack"></i> {getCurrencySymbol(entry.currency || 'USD')} {totalAnimated}
              </div>
            )}
          </div>

          <div className="card-actions">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={(ev) => { ev.stopPropagation(); handleDeleteEntry(entry._id); }}
              aria-label={`Delete ${entry.title}`}
              disabled={deletingId === entry._id}
            >
              {deletingId === entry._id ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden /> : <i className="bi bi-trash"></i>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="entries-root">
      <style>{`
        /* Container + background (keeps same look as your other pages) */
        .entries-root {
          min-height: 100vh;
          padding: 28px;
          font-family: 'Merriweather', serif;
          color: #4a3b2c;
          background-image: url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
          background-size: cover;
          background-position: center;
        }

        /* Top bar with menu + stats */
        .topbar {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .menu-btn {
          background: linear-gradient(180deg,#5a3d2b,#4a2f22);
          color: #fff;
          border: none;
          padding: 10px 12px;
          border-radius: 10px;
          box-shadow: 0 10px 24px rgba(12,8,6,0.16);
        }
        .stats {
          display:flex;
          gap:12px;
          align-items:center;
        }
        .stat-pill {
          background: rgba(255,255,255,0.95);
          padding:10px 14px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(12,10,8,0.06);
          display:flex;
          gap:8px;
          align-items:center;
          font-weight:600;
        }

        /* FILTER panel */
        .filter-panel {
          margin-bottom: 16px;
          max-width: 980px;
          background: rgba(255,255,255,0.95);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 18px 40px rgba(10,8,6,0.08);
          transition: transform 320ms cubic-bezier(.2,.9,.2,1), max-height 320ms;
          overflow: hidden;
        }
        .filter-header {
          display:flex;
          gap:12px;
          align-items:center;
          justify-content:space-between;
        }
        .filter-controls {
          margin-top:12px;
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 920px) {
          .filter-controls { grid-template-columns: 1fr 1fr; }
        }

        .field {
          display:flex;
          flex-direction:column;
        }
        .field label { font-weight:700; font-size:0.9rem; color:#6b5847; margin-bottom:6px; }
        .field input { padding:8px 10px; border-radius:8px; border:1px solid rgba(200,180,150,0.2); background: #fffaf3; }

        .filter-toggle {
          background: transparent;
          border: 1px solid rgba(120,95,70,0.14);
          padding: 8px 10px;
          border-radius: 10px;
        }

        /* entries list container */
        .entries-container {
          max-width: 980px;
          margin: 12px 0 40px;
        }

        /* skeleton */
        .skeleton-card {
          background: linear-gradient(90deg, rgba(240,240,240,0.9), rgba(255,255,255,0.9));
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
          box-shadow: 0 8px 18px rgba(12,10,8,0.04);
          display:flex;
          justify-content:space-between;
        }
        .skeleton-title { height:14px; width:40%; background:rgba(220,220,220,0.7); border-radius:6px; margin-bottom:10px; }
        .skeleton-line { height:10px; width:60%; background:rgba(230,230,230,0.7); border-radius:6px; }
        .skeleton-meta { width:120px; height:10px; background:rgba(230,230,230,0.7); border-radius:6px; align-self:center; }

        /* entry cards */
        .entry-card {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          background: rgba(255,255,255,0.98);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
          box-shadow: 0 12px 32px rgba(12,10,8,0.06);
          cursor: pointer;
          transform: translateY(8px);
          opacity: 0;
          animation: cardIn 420ms forwards;
        }
        @keyframes cardIn { to { transform: translateY(0); opacity:1; } }

        .entry-card:focus { outline: 3px solid rgba(139,94,60,0.12); }

        /* hover micro-interaction */
        .entry-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 48px rgba(12,10,8,0.12);
        }

        .entry-title { margin:0; font-size:1.05rem; color:#8b5e3c; }
        .entry-meta { font-size:0.9rem; color:#6b5847; }

        .badges { display:flex; gap:8px; align-items:center; }
        .badge {
          background: linear-gradient(90deg, rgba(250,250,250,0.9), rgba(245,240,236,0.9));
          border-radius: 8px;
          padding:6px 8px;
          display:inline-flex;
          gap:8px;
          align-items:center;
          font-weight:700;
          color:#4a3b2c;
          box-shadow: 0 6px 18px rgba(12,10,8,0.04);
        }
        .badge.photos { animation: badgePulse 1600ms infinite; }
        @keyframes badgePulse { 0%{ transform: translateY(0);} 50%{ transform: translateY(-2px);} 100%{ transform: translateY(0);} }

        .card-actions button { transition: transform 150ms; }
        .card-actions button:active { transform: translateY(1px); }

        /* bottom add button */
        .add-button {
          max-width: 980px;
          margin-top: 10px;
          display:block;
          width:100%;
          padding:12px;
          border-radius:10px;
          background: linear-gradient(90deg,#8b5e3c,#b5774f);
          border:none;
          color:white;
          font-weight:700;
          box-shadow: 0 16px 40px rgba(12,8,6,0.12);
        }

        /* modal (entry details) */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:120;
          padding: 18px;
        }
        .modal-card {
          width:100%;
          max-width: 980px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          animation: modalPop 260ms cubic-bezier(.2,.9,.2,1);
        }
        @keyframes modalPop { from { transform: scale(.98); opacity:0 } to { transform: scale(1); opacity:1 } }

        .modal-body { padding: 18px; max-height: 70vh; overflow:auto; }
        .modal-header { display:flex; align-items:center; justify-content:space-between; padding: 12px 18px; border-bottom: 1px solid rgba(220,220,220,0.6); }
        .carousel {
          display:flex;
          gap:8px;
          align-items:center;
          justify-content:center;
          margin-top:10px;
        }
        .carousel img { max-height: 220px; border-radius:8px; box-shadow: 0 12px 30px rgba(12,10,8,0.08); cursor: pointer; transition: transform 180ms; }
        .carousel img:hover { transform: translateY(-6px); }

        .modal-footer { padding: 12px 18px; border-top: 1px solid rgba(220,220,220,0.6); display:flex; justify-content:space-between; align-items:center; }

        /* toast */
        .toast {
          position: fixed;
          right: 18px;
          bottom: 18px;
          min-width: 220px;
          padding: 12px 14px;
          border-radius: 10px;
          background: white;
          box-shadow: 0 10px 36px rgba(12,10,8,0.12);
          z-index: 150;
          display:flex;
          gap:8px;
          align-items:center;
        }
        .toast.success { border-left: 4px solid #2f8a52; }
        .toast.error { border-left: 4px solid #c14a4a; }

      `}</style>

      {/* Topbar */}
      <div className="topbar" style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="menu-btn" onClick={() => setIsMenuOpen(true)}><i className="bi bi-list"></i> Menu</button>
          <div style={{ alignSelf: 'center', color: '#fff', textShadow: '0 1px 0 rgba(0,0,0,0.2)' }}>
            <strong style={{ fontSize: 18 }}>My Travel Journals</strong>
          </div>
        </div>

        <div className="stats" aria-hidden>
          <div className="stat-pill"><i className="bi bi-journal-text"></i> <span style={{opacity:0.9}}>Entries</span> <span style={{marginLeft:8}}>{totalEntriesAnimated}</span></div>
          <div className="stat-pill"><i className="bi bi-image"></i> <span style={{opacity:0.9}}>Photos</span> <span style={{marginLeft:8}}>{travelEntries.reduce((s,e)=>s + (e.images?e.images.length:0),0)}</span></div>
        </div>
      </div>

      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Filter panel */}
      <div className="filter-panel" style={{ maxWidth: 980, margin: '18px auto' }}>
        <div className="filter-header">
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <strong style={{ fontSize: 16, color: '#5a3d2b' }}>Filters</strong>
            <small className="muted">Narrow results in real-time</small>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button className="filter-toggle" onClick={() => setFilterOpen(p=>!p)}>
              <i className={`bi ${filterOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i> {filterOpen ? 'Hide' : 'Show'}
            </button>
            <button className="filter-toggle" onClick={() => { setFilter({ expenseMin:'', expenseMax:'', locationFilter:'', minPics:0 }); }}>
              <i className="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, maxHeight: filterOpen ? '200px' : 0, transition: 'max-height 320ms ease', overflow:'hidden' }}>
          <div className="filter-controls">
            <div className="field">
              <label>Country / Text</label>
              <input value={filter.locationFilter} onChange={(e)=>setFilter({...filter, locationFilter:e.target.value})} placeholder="e.g., Paris, Italy" />
            </div>

            <div className="field">
              <label>Expense Min</label>
              <input type="number" value={filter.expenseMin} onChange={(e)=>setFilter({...filter, expenseMin:e.target.value})} placeholder="0.00" />
            </div>

            <div className="field">
              <label>Expense Max</label>
              <input type="number" value={filter.expenseMax} onChange={(e)=>setFilter({...filter, expenseMax:e.target.value})} placeholder="Max" />
            </div>

            <div className="field">
              <label>Min Photos</label>
              <input type="number" value={filter.minPics} onChange={(e)=>setFilter({...filter, minPics:e.target.value})} placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      {/* Entries list */}
      <div className="entries-container" ref={listRef} style={{ maxWidth: 980, margin: '0 auto' }}>
        {loading ? (
          <>
            <SkeletonCard index={0} />
            <SkeletonCard index={1} />
            <SkeletonCard index={2} />
          </>
        ) : filteredEntries.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 20, borderRadius: 10, textAlign: 'center', boxShadow: '0 12px 30px rgba(12,10,8,0.06)' }}>
            <p style={{ margin: 0, color: '#6b5847' }}>No entries match the current filters.</p>
            <button className="add-button" onClick={handleAddNewEntry}><i className="bi bi-plus-circle me-2"></i>Start a New Entry</button>
          </div>
        ) : (
          filteredEntries.map((entry, idx) => (
            <div key={entry._id} style={{ animationDelay: `${idx * 60}ms` }} className="animated-wrap">
              {renderEntryCard(entry, idx)}
            </div>
          ))
        )}

        {!loading && filteredEntries.length > 0 && (
          <button className="add-button" onClick={handleAddNewEntry}><i className="bi bi-plus-circle me-2"></i>Add New Entry</button>
        )}
      </div>

      {/* Entry Modal */}
      {selectedEntry && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" id="entry-modal" tabIndex={-1}>
          <div className="modal-card" role="document">
            <div className="modal-header">
              <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
                <h5 style={{ margin:0 }}>{selectedEntry.title}</h5>
                {selectedEntry.country && <small className="muted">({selectedEntry.country})</small>}
              </div>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleCloseModal}><i className="bi bi-x"></i></button>
                <button className="btn btn-sm btn-danger" onClick={() => { handleDeleteEntry(selectedEntry._id); handleCloseModal(); }}>
                  <i className="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>

            <div className="modal-body">
              {selectedEntry.images && selectedEntry.images.length > 0 && (
                <>
                  <h6 className="muted">Trip Photos</h6>
                  <div className="carousel" role="list">
                    {selectedEntry.images.map((p, i) => (
                      <img key={i} src={`http://localhost:3001${p}`} alt={`Trip photo ${i+1}`} onClick={() => window.open(`http://localhost:3001${p}`, '_blank')} />
                    ))}
                  </div>
                </>
              )}

              <div style={{ marginTop: 16 }}>
                <h6 className="muted">Story Details</h6>
                <p style={{ whiteSpace:'pre-wrap' }}>{selectedEntry.content}</p>
              </div>

              {selectedEntry.location && (
                <div style={{ marginTop: 12 }}>
                  <h6 className="muted">Location</h6>
                  <div style={{ height: 240, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(200,180,150,0.14)', marginTop: 8 }}>
                    <MapDisplay location={selectedEntry.location} />
                  </div>
                </div>
              )}

              {selectedEntry.expenses && selectedEntry.expenses.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <h6 className="muted">Expense Breakdown ({selectedEntry.currency})</h6>
                  <ul className="list-group list-group-flush" style={{ marginTop:8 }}>
                    {selectedEntry.expenses.map((exp, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div><strong>{exp.category}</strong></div>
                        <div>{getCurrencySymbol(selectedEntry.currency)} {(exp.amount || 0).toFixed(2)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <small className="me-auto muted">Created: {new Date(selectedEntry.createdAt).toLocaleDateString()}</small>
              <div>
                <button className="btn btn-secondary me-2" onClick={handleCloseModal}>Close</button>
                <button className="btn btn-danger" onClick={() => { handleDeleteEntry(selectedEntry._id); handleCloseModal(); }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'success' : 'error'}`} role="status" aria-live="polite">
          <div style={{ fontSize: 18 }}>{toast.type === 'success' ? <i className="bi bi-check-circle-fill" style={{ color:'#2f8a52' }} /> : <i className="bi bi-exclamation-triangle-fill" style={{ color:'#c14a4a' }} />}</div>
          <div style={{ marginLeft:8 }}>
            <div style={{ fontWeight:700 }}>{toast.type === 'success' ? 'Success' : 'Error'}</div>
            <div style={{ fontSize: 13, color:'#6b5847' }}>{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEntries;
