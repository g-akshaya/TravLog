import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import MapInput from './MapInput'; 

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Activities', 'Misc'];
const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];
const DEFAULT_CURRENCY = 'USD'; // Default currency

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: null, 
    // 💰 NEW: Structured expense data
    expenses: [{ category: 'Food', amount: 0 }],
    currency: DEFAULT_CURRENCY,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLocationSelect = (newLocation) => {
    setFormData(prevData => ({
      ...prevData,
      location: newLocation,
    }));
    // Optional: Add logic here to try and guess currency based on location name 
    // and update formData.currency, but for simplicity, we rely on the selector below.
  };

  // Handler for dynamic expense fields
  const handleExpenseChange = (index, name, value) => {
    const newExpenses = [...formData.expenses];
    const newValue = name === 'amount' ? parseFloat(value) || 0 : value;
    newExpenses[index][name] = newValue;

    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  const handleAddExpense = () => {
    setFormData({
      ...formData,
      expenses: [...formData.expenses, { category: 'Food', amount: 0 }],
    });
  };

  const handleRemoveExpense = (index) => {
    const newExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      expenses: newExpenses,
    });
  };

  // Calculate the total expense dynamically
  const totalExpense = useMemo(() => {
    return formData.expenses.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2);
  }, [formData.expenses]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        alert("User session expired. Please log in.");
        navigate('/login');
        return;
    }

    try {
      const dataToSend = {
        userEmail: user.email,
        title: formData.title,
        content: formData.content,
        // Include location if selected
        ...(formData.location && { location: formData.location }),
        // Send the structured expense array and currency
        expenses: formData.expenses.filter(e => e.amount > 0), // Only send entries with an amount > 0
        currency: formData.currency
      };
      
      const response = await axios.post('http://localhost:3001/save-travel-entry', dataToSend);

      alert(response.data.message);
      setFormData({ title: '', content: '', location: null, expenses: [{ category: 'Food', amount: 0 }], currency: DEFAULT_CURRENCY });
      navigate('/entries'); 

    } catch (error) {
      console.error('Failed to create entry:', error.response ? error.response.data : error.message);
      alert('Failed to save travel entry. See console for details.');
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
            overflowY: 'auto',
            padding: '20px 0'
        }}
    >
        <div
            className="p-4 shadow-lg rounded-4"
            style={{
                minWidth: '500px',
                backgroundColor: 'rgba(248, 241, 229, 0.92)',
                border: '1px solid #c4ab89',
                backdropFilter: 'blur(6px)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}
        >
            <h2 className="text-center mb-3" style={{ color: '#5a3d2b' }}>
                <i className="bi bi-journal-plus me-2"></i>New Travel Entry
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
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

                {/* 🗺️ MAP LOCATION SELECTOR (Above Story/Content) */}
                <h4 style={{ fontSize: '1.25rem', color: '#5a3d2b', marginBottom: '5px' }}>
                    <i className="bi bi-pin-map me-2"></i>Entry Location
                </h4>
                <div className="mb-4">
                  <MapInput onLocationSelect={handleLocationSelect} />
                </div>
                
                {formData.location && (
                    <p className="text-success mb-3" style={{ fontSize: '0.9em' }}>
                        **Location Tagged:** {formData.location.name} 
                    </p>
                )}
                
                <div className="mb-4">
                    <label htmlFor="content" className="form-label">Story / Details</label>
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

                {/* 💰 EXPENSE TRACKER WITH SUB-CATEGORIES */}
                <h4 style={{ fontSize: '1.25rem', color: '#5a3d2b', borderTop: '1px solid #ccb89d', paddingTop: '15px' }}>
                    <i className="bi bi-currency-dollar me-2"></i>Travel Expenses
                </h4>
                
                {/* Currency Selector */}
                <div className="mb-3">
                    <label htmlFor="currency" className="form-label">Select Primary Currency</label>
                    <select
                        className="form-select"
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                    >
                        {AVAILABLE_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                                onChange={(e) => handleExpenseChange(index, e.target.name, e.target.value)}
                            >
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="form-control flex-grow-1"
                                name="amount"
                                placeholder={`Amount in ${formData.currency}`}
                                value={expense.amount === 0 ? '' : expense.amount}
                                onChange={(e) => handleExpenseChange(index, e.target.name, e.target.value)}
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
                    <span>{formData.currency} {totalExpense}</span>
                </div>
                
                <button type="submit" className="btn w-100 rounded-3" style={{ backgroundColor: '#8b5e3c', color: '#fff', border: 'none' }}>
                    <i className="bi bi-save me-2"></i>Save Entry
                </button>
            </form>
        </div>
    </div>
  );
}

export default Home;