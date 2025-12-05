import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MapInput from './MapInput';
import Menu from './Menu';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Activities', 'Misc'];
const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];
const DEFAULT_CURRENCY = 'USD';

function Home() {
  const navigate = useNavigate();

  // form state (original logic preserved)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: null,
    country: '',
    expenses: [{ category: 'Food', amount: 0 }],
    currency: DEFAULT_CURRENCY,
    images: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ui state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [animateStage, setAnimateStage] = useState(0); // for staggered entrance
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);

  // trigger staggered entrance on mount
  useEffect(() => {
    let t = 0;
    const timer = setInterval(() => {
      setAnimateStage(prev => Math.min(prev + 1, 6));
      t++;
      if (t > 6) clearInterval(timer);
    }, 110);
    return () => clearInterval(timer);
  }, []);

  // --------------------------
  // Handlers (preserve original logic)
  // --------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setFormData(prev => ({ ...prev, images: files }));

    // create previews (max 5)
    const arr = [];
    for (let i = 0; i < files.length && i < 5; i++) {
      const url = URL.createObjectURL(files[i]);
      arr.push(url);
    }
    setImagePreviews(arr);
  };

  const handleLocationSelect = (newLocation) => {
    setFormData(prev => ({ ...prev, location: newLocation, country: '' }));
  };

  const handleGeocodeSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    const address = encodeURIComponent(searchQuery.trim());
    const GEOCODE_URL = `https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1&addressdetails=1`;

    try {
      const response = await axios.get(GEOCODE_URL, {
        headers: { 'User-Agent': 'TravLog-App' },
      });

      if (response.data.length === 0) {
        alert(`Location "${searchQuery}" not found. Try a more specific search.`);
        return;
      }

      const result = response.data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const country = result.address?.country || '';

      const newLocation = {
        type: 'Point',
        coordinates: [lng, lat],
        name: result.display_name,
      };

      setFormData(prev => ({ ...prev, location: newLocation, country }));
      setSearchQuery('');
    } catch (err) {
      console.error('Geocoding API Error:', err);
      alert('An error occurred during search. This service may have rate limits. Try again in a minute.');
    }
  };

  const handleExpenseChange = (index, name, value) => {
    const newExpenses = [...formData.expenses];
    const newValue = name === 'amount' ? parseFloat(value) || 0 : value;
    newExpenses[index][name] = newValue;
    setFormData(prev => ({ ...prev, expenses: newExpenses }));
  };

  const handleAddExpense = () => {
    setFormData(prev => ({ ...prev, expenses: [...prev.expenses, { category: 'Food', amount: 0 }] }));
  };

  const handleRemoveExpense = (index) => {
    const newExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, expenses: newExpenses }));
  };

  const totalExpense = useMemo(() => {
    return formData.expenses.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2);
  }, [formData.expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      alert('User session expired. Please log in.');
      navigate('/login');
      return;
    }

    setIsSaving(true);

    const data = new FormData();
    data.append('userEmail', user.email);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('country', formData.country);
    data.append('currency', formData.currency);
    data.append('location', JSON.stringify(formData.location));
    data.append('expenses', JSON.stringify(formData.expenses.filter(e => e.amount > 0)));

    if (formData.images) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append('images', formData.images[i]);
      }
    }

    try {
      await axios.post('http://localhost:3001/save-travel-entry', data);

      setSaveSuccess(true);
      // short success animation then navigate
      setTimeout(() => {
        setSaveSuccess(false);
        setFormData({
          title: '',
          content: '',
          location: null,
          country: '',
          expenses: [{ category: 'Food', amount: 0 }],
          currency: DEFAULT_CURRENCY,
          images: null,
        });
        setImagePreviews([]);
        navigate('/entries');
      }, 1000);
    } catch (error) {
      console.error('Failed to create entry:', error.response ? error.response.data : error.message);
      alert('Failed to save travel entry. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  // cleanup preview object urls
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const currencySymbol = (c) => {
    const map = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹' };
    return map[c] || c;
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="home-root-plain-bg">
      <style>{`
        /* ---------- keep the original background image plain (no gradients) ---------- */
        .home-root-plain-bg {
          min-height: 100vh;
          background-image: url('https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1800&h=900&dpr=2');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          font-family: 'Merriweather', serif;
          color: #3f2f26;
          padding: 28px;
        }

        /* MENU BUTTON (stays visible) */
        .menu-button {
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 60;
          background: linear-gradient(180deg,#5a3d2b,#4a2f22);
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(12,8,6,0.18);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* MAIN CARD - elevated glass-ish card */
        .entry-card {
          max-width: 980px;
          margin: 60px auto;
          border-radius: 16px;
          background: rgba(255,255,255,0.93);
          border: 1px solid rgba(200,180,150,0.18);
          padding: 24px;
          box-shadow: 0 30px 80px rgba(12,10,8,0.16);
          position: relative;
          overflow: visible;
        }

        /* Staggered entrance classes (fade/slide) */
        .stage-0 { opacity: 0; transform: translateY(12px); }
        .stage-1 { opacity: 1; transform: translateY(0); transition: all 320ms cubic-bezier(.2,.9,.2,1); }
        .stagger { transition: opacity 360ms ease, transform 360ms cubic-bezier(.2,.9,.2,1); }

        /* header */
        .entry-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
        .brand-bubble {
          width:56px; height:56px; border-radius:12px; display:grid; place-items:center;
          background: linear-gradient(135deg,#8b5e3c,#6f3f2a); color:#fff;
          box-shadow: 0 10px 30px rgba(139,94,60,0.18);
        }
        .header-title h2 { margin:0; color:#5a3d2b; font-size:1.35rem; }
        .header-title p { margin:0; color:#7a6656; font-size:0.95rem; }

        /* grid layout */
        .form-grid { display:grid; grid-template-columns: 1fr 360px; gap: 18px; align-items:start; }
        @media (max-width: 920px) { .form-grid { grid-template-columns: 1fr; } }

        /* inputs animated: gentle float up on focus and reveal underline */
        .field { margin-bottom:12px; position: relative; }
        .field label { display:block; margin-bottom:6px; color:#6b5847; font-weight:600; }
        .field input, .field textarea, .form-select {
          width:100%;
          padding:12px 14px;
          border-radius:10px;
          background: #fffaf6;
          border: 1px solid rgba(200,180,150,0.22);
          transition: transform .12s ease, box-shadow .16s, border-color .16s;
        }
        .field input:focus, .field textarea:focus, .form-select:focus {
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(139,94,60,0.10);
          border-color: #8b5e3c;
          outline: none;
        }

        textarea { min-height:120px; resize: vertical; }

        /* Search row: input + animated button (slide-in) */
        .search-row { display:flex; gap:10px; align-items:center; }
        .search-row input { flex:1; }

        .map-wrapper {
          border-radius: 12px;
          border: 1px dashed rgba(196,171,137,0.18);
          padding: 8px;
          background: #ffffff;
          transition: box-shadow .18s, transform .18s;
          position: relative;
        }

        .map-wrapper.map-has-location {
          box-shadow: 0 14px 40px rgba(139,94,60,0.06);
          border-style: solid;
          border-color: rgba(139,94,60,0.12);
        }

        /* location pulse (when tagged) */
        .map-pulse { position:absolute; right:14px; top:14px; width:12px; height:12px; background:#ff7b5c; border-radius:50%; box-shadow:0 0 0 6px rgba(255,123,92,0.08); animation:pulse 1400ms infinite; }
        @keyframes pulse { 0%{ transform:scale(.9); opacity:0.95;} 70%{ transform:scale(1.6); opacity:0; } 100%{ transform:scale(.9); opacity:0; } }

        /* preview thumbnails - appear with small staggered scale/fade */
        .preview-strip { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
        .preview-thumb {
          width:86px; height:68px; object-fit:cover; border-radius:8px;
          border:1px solid rgba(200,180,150,0.14);
          transform: translateY(8px) scale(.98); opacity:0;
          animation:thumbIn 420ms forwards;
        }
        .preview-thumb.delay-0 { animation-delay: 80ms; }
        .preview-thumb.delay-1 { animation-delay: 160ms; }
        .preview-thumb.delay-2 { animation-delay: 240ms; }
        .preview-thumb.delay-3 { animation-delay: 320ms; }
        .preview-thumb.delay-4 { animation-delay: 400ms; }
        @keyframes thumbIn { to { transform: translateY(0) scale(1); opacity:1; } }

        /* expense lines: slide & pop animation */
        .expense-line { display:flex; gap:8px; align-items:center; margin-bottom:8px; transform: translateX(-10px); opacity:0; animation: expenseIn 360ms forwards; }
        .expense-line.delay-0 { animation-delay: 60ms; }
        .expense-line.delay-1 { animation-delay: 140ms; }
        .expense-line.delay-2 { animation-delay: 220ms; }
        .expense-line.delay-3 { animation-delay: 300ms; }
        @keyframes expenseIn { to { transform: translateX(0); opacity:1; } }

        .expense-line select, .expense-line input { border-radius:8px; padding:8px 10px; }

        .total-row { margin-top:8px; display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-radius:10px; background:#fff9f3; border:1px solid rgba(200,180,150,0.1); }

        /* Save button: animated micro bounce + ripple effect on success */
        .save-btn { width:100%; padding:12px 14px; border-radius:12px; border:none; background: linear-gradient(90deg,#8b5e3c,#b5774f); color:white; font-weight:700; box-shadow:0 14px 34px rgba(139,94,60,0.14); transition: transform .12s; }
        .save-btn:active { transform: translateY(1px); }
        .save-btn.saving { opacity:0.9; transform: scale(.995); }

        /* success tick overlay (small) */
        .success-tick { position: absolute; right: 22px; top: -26px; width:54px; height:54px; background: #eafaf0; border-radius:50%; display:grid; place-items:center; border: 3px solid rgba(66,160,110,0.16); color: #2f8a52; box-shadow: 0 10px 28px rgba(46,120,80,0.06); transform: scale(.6); opacity:0; transition: all 420ms cubic-bezier(.2,.9,.2,1); }
        .success-tick.show { transform: scale(1); opacity:1; }

        /* subtle floating labels for small helpers */
        .muted { color:#7a6656; font-size:0.95rem; }

        /* small responsive tweaks */
        @media (max-width: 920px) {
          .entry-card { margin: 36px 14px; padding:18px; }
          .success-tick { right: 18px; top: -20px; }
        }
      `}</style>

      {/* Menu button and drawer */}
      <button className="menu-button" onClick={() => setIsMenuOpen(true)} type="button" aria-label="Open menu">
        <i className="bi bi-list" aria-hidden></i> Menu
      </button>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main card */}
      <div className="entry-card" ref={cardRef}>
        {/* small animated success tick */ }
        <div className={`success-tick ${saveSuccess ? 'show' : ''}`} aria-hidden>
          <i className="bi bi-check-lg" style={{ fontSize: 20 }}></i>
        </div>

        {/* Header (staggered) */}
        <div className={`entry-header stagger ${animateStage >= 1 ? 'stage-1' : 'stage-0'}`}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="brand-bubble" aria-hidden><i className="bi bi-journal-plus"></i></div>
            <div className="header-title">
              <h2>New Travel Entry</h2>
              <p>Tag places, upload photos, and track expenses — animated for clarity.</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="muted">Estimated total</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{currencySymbol(formData.currency)} {totalExpense}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`form-grid stagger ${animateStage >= 2 ? 'stage-1' : 'stage-0'}`}>
            {/* LEFT column */}
            <div>
              {/* Title */}
              <div className={`field stagger ${animateStage >= 3 ? 'stage-1' : 'stage-0'}`}>
                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Weekend in Goa" required />
              </div>

              {/* Location search + Map */}
              <div className={`field stagger ${animateStage >= 4 ? 'stage-1' : 'stage-0'}`}>
                <label>Search Location or Click on Map</label>
                <div className="search-row">
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type location name (Mumbai, Paris...)" />
                  <button className="btn btn-outline-secondary" type="button" onClick={handleGeocodeSearch}>Search</button>
                </div>

                <div className={`map-wrapper ${formData.location ? 'map-has-location' : ''}`} style={{ marginTop: 10 }}>
                  <MapInput onLocationSelect={handleLocationSelect} locationData={formData.location} />
                  {formData.location && <div className="map-pulse" title="Location tagged" aria-hidden />}
                </div>

                {formData.location && <p className="muted" style={{ marginTop: 8 }}><strong>Tagged:</strong> {formData.location.name}</p>}
              </div>

              {/* Story */}
              <div className={`field stagger ${animateStage >= 5 ? 'stage-1' : 'stage-0'}`}>
                <label htmlFor="content">Story / Details</label>
                <textarea id="content" name="content" value={formData.content} onChange={handleChange} placeholder="Tell the story..." required />
              </div>

              {/* Images */}
              <div className={`field stagger ${animateStage >= 6 ? 'stage-1' : 'stage-0'}`}>
                <label>Upload Pictures</label>
                <input ref={fileInputRef} type="file" name="images" className="form-control" multiple accept="image/*" onChange={handleFileChange} />
                <div className="muted" style={{ marginTop: 6 }}>You can select up to 5 images. Previews animate in.</div>
                <div className="preview-strip" aria-live="polite">
                  {imagePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview ${i + 1}`}
                      className={`preview-thumb delay-${Math.min(i,4)}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT column */}
            <div>
              <div className={`field stagger ${animateStage >= 3 ? 'stage-1' : 'stage-0'}`}>
                <label htmlFor="country">Country Visited</label>
                <input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="e.g., France, Japan" />
              </div>

              <div className={`field stagger ${animateStage >= 4 ? 'stage-1' : 'stage-0'}`}>
                <label htmlFor="currency">Select Primary Currency</label>
                <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className="form-select">
                  {AVAILABLE_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className={`field stagger ${animateStage >= 5 ? 'stage-1' : 'stage-0'}`}>
                <label>Expense Categories</label>
                <div>
                  {formData.expenses.map((expense, index) => (
                    <div key={index} className={`expense-line delay-${Math.min(index,3)}`}>
                      <select value={expense.category} onChange={(e) => handleExpenseChange(index, 'category', e.target.value)} className="form-select" style={{ flex: 1 }}>
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>

                      <input
                        type="number"
                        value={expense.amount === 0 ? '' : expense.amount}
                        onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                        placeholder={`Amount (${formData.currency})`}
                        style={{ width: 120 }}
                      />

                      <button type="button" className="btn btn-outline-danger" onClick={() => handleRemoveExpense(index)} disabled={formData.expenses.length === 1} aria-label="Remove expense">
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}

                  <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={handleAddExpense}>
                    <i className="bi bi-plus"></i> Add Expense Line
                  </button>
                </div>
              </div>

              <div className="total-row stagger" style={{ marginTop: 8 }}>
                <div>Total Estimated</div>
                <div style={{ fontWeight: 700 }}>{currencySymbol(formData.currency)} {totalExpense}</div>
              </div>

              <div style={{ marginTop: 14 }} className={`stagger ${animateStage >= 6 ? 'stage-1' : 'stage-0'}`}>
                <button type="submit" className={`save-btn ${isSaving ? 'saving' : ''}`} disabled={isSaving}>
                  {isSaving ? (<><i className="bi bi-hourglass-split me-2"></i> Saving...</>) : (<><i className="bi bi-save me-2"></i> Save Entry</>)}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* small success overlay (keeps background visible) */}
      {saveSuccess && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 80
        }}>
          <div style={{
            width: 160, height: 160, borderRadius: 100, background: 'rgba(255,255,255,0.95)',
            display: 'grid', placeItems: 'center', boxShadow: '0 30px 80px rgba(12,10,8,0.12)'
          }}>
            <div style={{ fontSize: 36, color: '#2f8a52' }}><i className="bi bi-check2-circle" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
