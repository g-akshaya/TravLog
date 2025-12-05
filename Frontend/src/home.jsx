import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MapInput from './MapInput';
import Menu from './Menu'; // ✅ Using the fixed Menu component

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Activities', 'Misc'];
const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];
const DEFAULT_CURRENCY = 'USD';

function Home() {
  const navigate = useNavigate();
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

  // INPUT HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: e.target.files,
    }));
  };

  const handleLocationSelect = (newLocation) => {
    setFormData((prevData) => ({
      ...prevData,
      location: newLocation,
      country: '',
    }));
  };

  // 🔍 LOCATION SEARCH (GEOCODING)
  const handleGeocodeSearch = async (e) => {
    e.preventDefault();
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

      setFormData((prevData) => ({
        ...prevData,
        location: newLocation,
        country: country,
      }));

      setSearchQuery('');
    } catch (error) {
      console.error('Geocoding API Error:', error);
      alert('An error occurred during search. This service may have rate limits. Try again in a minute.');
    }
  };

  const handleExpenseChange = (index, name, value) => {
    const newExpenses = [...formData.expenses];
    const newValue = name === 'amount' ? parseFloat(value) || 0 : value;
    newExpenses[index][name] = newValue;

    setFormData((prev) => ({
      ...prev,
      expenses: newExpenses,
    }));
  };

  const handleAddExpense = () => {
    setFormData((prevData) => ({
      ...prevData,
      expenses: [...prevData.expenses, { category: 'Food', amount: 0 }],
    }));
  };

  const handleRemoveExpense = (index) => {
    const newExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      expenses: newExpenses,
    }));
  };

  const totalExpense = useMemo(() => {
    return formData.expenses
      .reduce((sum, item) => sum + (item.amount || 0), 0)
      .toFixed(2);
  }, [formData.expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      alert('User session expired. Please log in.');
      navigate('/login');
      return;
    }

    const data = new FormData();
    data.append('userEmail', user.email);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('country', formData.country);
    data.append('currency', formData.currency);
    data.append('location', JSON.stringify(formData.location));
    data.append(
      'expenses',
      JSON.stringify(formData.expenses.filter((e) => e.amount > 0))
    );

    if (formData.images) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append('images', formData.images[i]);
      }
    }

    try {
      await axios.post('http://localhost:3001/save-travel-entry', data);

      alert('Entry saved successfully!');
      setFormData({
        title: '',
        content: '',
        location: null,
        country: '',
        expenses: [{ category: 'Food', amount: 0 }],
        currency: DEFAULT_CURRENCY,
        images: null,
      });
      navigate('/entries');
    } catch (error) {
      console.error(
        'Failed to create entry:',
        error.response ? error.response.data : error.message
      );
      alert('Failed to save travel entry. See console for details.');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: `'Merriweather', serif`,
        color: '#4a3b2c',
        overflowY: 'auto',
        padding: '20px 0',
        position: 'relative',
      }}
    >
      {/* ☰ MENU BUTTON */}
      <button
        className="btn btn-dark position-absolute top-0 start-0 m-3 shadow-lg"
        onClick={() => setIsMenuOpen(true)}
        style={{
          zIndex: 5,
          backgroundColor: '#5a3d2b',
          borderColor: '#4a3b2c',
        }}
        type="button"
      >
        <i className="bi bi-list"></i> Menu
      </button>

      {/* 🧭 SLIDING MENU */}
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* MAIN CARD */}
      <div
        className="p-4 shadow-lg rounded-4"
        style={{
          minWidth: '500px',
          backgroundColor: 'rgba(248, 241, 229, 0.92)',
          border: '1px solid #c4ab89',
          backdropFilter: 'blur(6px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        <h2 className="text-center mb-3" style={{ color: '#5a3d2b' }}>
          <i className="bi bi-journal-plus me-2"></i>New Travel Entry
        </h2>

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              placeholder="Title of your entry"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* LOCATION SEARCH + MAP */}
          <h6 style={{ color: '#5a3d2b', marginBottom: '5px' }}>
            <i className="bi bi-pin-map me-2"></i>Search Location or Click on Map
          </h6>

          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Type location name (e.g., Mumbai, Paris)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleGeocodeSearch}
            >
              Search
            </button>
          </div>

          <div className="mb-3">
            <MapInput
              onLocationSelect={handleLocationSelect}
              locationData={formData.location}
            />
          </div>

          {formData.location && (
            <p
              className="text-success mb-3"
              style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap' }}
            >
              <strong>Location Tagged:</strong> {formData.location.name}
            </p>
          )}

          {/* COUNTRY */}
          <div className="mb-4">
            <label htmlFor="country" className="form-label">
              Country Visited
            </label>
            <input
              type="text"
              className="form-control"
              id="country"
              name="country"
              placeholder="e.g., France, Japan"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          {/* STORY */}
          <div className="mb-4">
            <label htmlFor="content" className="form-label">
              Story / Details
            </label>
            <textarea
              className="form-control"
              id="content"
              name="content"
              rows="4"
              placeholder="What adventures did you have?"
              value={formData.content}
              onChange={handleChange}
              required
            />
          </div>

          {/* IMAGES */}
          <h6
            style={{
              color: '#5a3d2b',
              marginBottom: '5px',
              borderTop: '1px solid #ccb89d',
              paddingTop: '15px',
            }}
          >
            <i className="bi bi-images me-2"></i>Upload Pictures
          </h6>
          <div className="mb-4">
            <input
              type="file"
              className="form-control"
              name="images"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <small className="form-text text-muted">
              You can select up to 5 images.
            </small>
          </div>

          {/* EXPENSES */}
          <h4
            style={{
              fontSize: '1.25rem',
              color: '#5a3d2b',
              borderTop: '1px solid #ccb89d',
              paddingTop: '15px',
            }}
          >
            <i className="bi bi-currency-dollar me-2"></i>Travel Expenses
          </h4>

          <div className="mb-3">
            <label htmlFor="currency" className="form-label">
              Select Primary Currency
            </label>
            <select
              className="form-select"
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              {AVAILABLE_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Expense Categories</label>
            {formData.expenses.map((expense, index) => (
              <div key={index} className="input-group mb-2">
                <select
                  className="form-select flex-grow-1"
                  name="category"
                  value={expense.category}
                  onChange={(e) =>
                    handleExpenseChange(index, e.target.name, e.target.value)
                  }
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-control flex-grow-1"
                  name="amount"
                  placeholder={`Amount in ${formData.currency}`}
                  value={expense.amount === 0 ? '' : expense.amount}
                  onChange={(e) =>
                    handleExpenseChange(index, e.target.name, e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => handleRemoveExpense(index)}
                  disabled={formData.expenses.length === 1}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={handleAddExpense}
            >
              <i className="bi bi-plus"></i> Add Expense Line
            </button>
          </div>

          <div className="alert alert-info d-flex justify-content-between">
            <strong>Total Estimated Expense:</strong>
            <span>
              {formData.currency} {totalExpense}
            </span>
          </div>

          <button
            type="submit"
            className="btn w-100 rounded-3"
            style={{
              backgroundColor: '#8b5e3c',
              color: '#fff',
              border: 'none',
            }}
          >
            <i className="bi bi-save me-2"></i>Save Entry
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
