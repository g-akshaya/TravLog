import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MapDisplay from './MapDisplay'; // Assumed to be correctly in src/
import Menu from './Menu'; // ✅ Add Menu

// Utility function to get currency symbol (simple implementation)
const getCurrencySymbol = (currencyCode) => {
    const map = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹'
    };
    return map[currencyCode] || currencyCode;
};

// Helper component to calculate total expense for the modal
const TotalExpenseDisplay = ({ expenses, currency }) => {
    const total = useMemo(() => {
        if (!expenses) return 0;
        return expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [expenses]);

    const symbol = getCurrencySymbol(currency);

    return (
        <div className="alert alert-success mt-3 p-2">
            <strong>Total Trip Cost:</strong>
            <span className="float-end">{symbol} {total.toFixed(2)} {currency}</span>
        </div>
    );
};

// ---------------------------------------------------------------------------------

function MyEntries() {
    const [travelEntries, setTravelEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const navigate = useNavigate();

    // ✅ Menu open/close state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🔎 NEW FILTER STATES
    const [filter, setFilter] = useState({
        expenseMin: '',
        expenseMax: '',
        locationFilter: '',
        minPics: 0,
    });
    // ----------------------
    
    // Function to fetch entries (memoized for efficiency)
    const fetchEntries = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3001/entries/${user.email}`);
            setTravelEntries(response.data);
        } catch (error) {
            console.error("Error fetching entries:", error);
            alert("Failed to load travel entries.");
        }
    }, [navigate]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleDeleteEntry = async (id) => {
        if (window.confirm("Are you sure you want to delete this journal entry?")) {
            try {
                await axios.delete(`http://localhost:3001/entries/${id}`);
                alert("Entry deleted successfully!");
                setSelectedEntry(null); 
                fetchEntries(); // Refresh the list
            } catch (error) {
                console.error("Error deleting entry:", error);
                alert("Failed to delete entry.");
            }
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

    // 🔎 NEW: FILTERING LOGIC
    const filteredEntries = useMemo(() => {
        if (travelEntries.length === 0) return [];
        
        const { expenseMin, expenseMax, locationFilter, minPics } = filter;
        
        return travelEntries.filter(entry => {
            
            // 1. Expense Filter (Total expenses)
            const totalExpense = entry.expenses ? entry.expenses.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;
            const min = parseFloat(expenseMin) || 0;
            const max = parseFloat(expenseMax) || Infinity;

            if (totalExpense < min || totalExpense > max) {
                return false;
            }

            // 2. Location/Country Filter (Case-insensitive check against title, content, and country)
            const search = locationFilter.toLowerCase();
            if (search && 
                !(entry.country?.toLowerCase().includes(search) ||
                  entry.title?.toLowerCase().includes(search) ||
                  entry.content?.toLowerCase().includes(search))) {
                return false;
            }

            // 3. Pictures Filter
            const minP = parseInt(minPics) || 0;
            const picCount = entry.images ? entry.images.length : 0;
            if (picCount < minP) {
                return false;
            }

            return true;
        });
    }, [travelEntries, filter]);
    // ------------------------------------------------------------------

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
                padding: '20px 0',
                position: 'relative', // ✅ for absolute menu button
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
                    <i className="bi bi-map me-2"></i>My Travel Journals
                </h2>
                
                {/* 🔎 FILTER CONTROLS */}
                <div className="card mb-4 p-3 border-secondary" style={{ backgroundColor: '#fffaf3' }}>
                    <h6 className="card-title text-center mb-3" style={{ color: '#8b5e3c' }}>
                        <i className="bi bi-filter me-1"></i>Filter Entries
                    </h6>
                    
                    {/* Location Filter */}
                    <div className="mb-3">
                        <label htmlFor="locationFilter" className="form-label small mb-1">Country/Location Search</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g., Italy, Japan, Paris"
                            value={filter.locationFilter}
                            onChange={(e) => setFilter({...filter, locationFilter: e.target.value})}
                        />
                    </div>

                    {/* Expense Range Filter */}
                    <label className="form-label small mb-1">Expense Range</label>
                    <div className="input-group mb-3 input-group-sm">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Min"
                            min="0"
                            step="0.01"
                            value={filter.expenseMin}
                            onChange={(e) => setFilter({...filter, expenseMin: e.target.value})}
                        />
                        <span className="input-group-text">-</span>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Max"
                            min="0"
                            step="0.01"
                            value={filter.expenseMax}
                            onChange={(e) => setFilter({...filter, expenseMax: e.target.value})}
                        />
                    </div>

                    {/* Pictures Count Filter */}
                    <div className="mb-2">
                        <label htmlFor="minPics" className="form-label small mb-1">Minimum Pictures Uploaded</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            id="minPics"
                            placeholder="0"
                            min="0"
                            value={filter.minPics}
                            onChange={(e) => setFilter({...filter, minPics: e.target.value})}
                        />
                    </div>

                    <small className="text-muted text-end">Showing {filteredEntries.length} of {travelEntries.length} entries.</small>
                </div>

                {travelEntries.length === 0 ? (
                    <p className="text-center text-muted">No entries yet. Start your first adventure!</p>
                ) : filteredEntries.length === 0 ? (
                    <p className="text-center text-warning">No entries match the current filters.</p>
                ) : (
                    <div className="list-group mb-4">
                        {filteredEntries.map(entry => (
                            <div
                                key={entry._id}
                                className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm p-3"
                                style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d', cursor: 'pointer' }}
                            >
                                <div className="d-flex w-100 justify-content-between mb-2">
                                    <h5 className="mb-1" style={{ color: '#8b5e3c' }} onClick={() => handleViewEntry(entry)}>
                                        <i className="bi bi-pin-map me-2"></i>**{entry.title}**
                                    </h5>
                                    
                                    {/* 🗑️ DELETE OPTION */}
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-outline-danger ms-3"
                                        onClick={() => handleDeleteEntry(entry._id)}
                                        style={{ height: '30px' }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                                
                                <div onClick={() => handleViewEntry(entry)} style={{cursor: 'pointer'}}>
                                    {/* 🌍 DISPLAY COUNTRY VISITED */}
                                    {entry.country && (
                                        <span className="badge bg-secondary me-2"><i className="bi bi-flag me-1"></i>{entry.country}</span>
                                    )}

                                    {/* 💰 DISPLAY EXPENSE SUMMARY */}
                                    {entry.expenses && entry.expenses.length > 0 && (
                                        <span className="badge bg-info">
                                            {getCurrencySymbol(entry.currency || 'USD')} Total: {entry.expenses.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
                                        </span>
                                    )}
                                    
                                    {/* 📸 DISPLAY PHOTO COUNT */}
                                    {entry.images && entry.images.length > 0 && (
                                        <span className="badge bg-warning text-dark ms-2">
                                            <i className="bi bi-image me-1"></i>{entry.images.length} Photos
                                        </span>
                                    )}

                                    <p className="mb-1 text-truncate mt-2" style={{ maxHeight: '2.5em', overflow: 'hidden', color: '#6b5847' }}>
                                        {entry.content}
                                    </p>
                                    <small className="text-muted">{new Date(entry.createdAt).toLocaleDateString()} - Click to view details.</small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    className="btn w-100 rounded-3"
                    style={{ backgroundColor: '#8b5e3c', color: '#fff', border: 'none' }}
                    onClick={handleAddNewEntry}
                >
                    <i className="bi bi-plus-circle me-2"></i>Add New Entry
                </button>
            </div>

            {/* Modal */}
            {selectedEntry && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedEntry.title} 
                                    {selectedEntry.country && <small className="text-muted ms-2">({selectedEntry.country})</small>}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                
                                {/* 🗺️ MAP DISPLAY */}
                                {selectedEntry.location && (
                                    <>
                                        <h6 className="mt-2 text-muted"><i className="bi bi-pin-map me-1"></i>Location: {selectedEntry.location.name || 'Geo-tagged Location'}</h6>
                                        <MapDisplay location={selectedEntry.location} /> 
                                    </>
                                )}
                                
                                {/* 📸 IMAGES */}
                                {selectedEntry.images && selectedEntry.images.length > 0 && (
                                    <div className="mt-4">
                                        <h6 className="text-muted"><i className="bi bi-images me-1"></i>Trip Photos</h6>
                                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                                            {selectedEntry.images.map((imagePath, index) => (
                                                <img 
                                                    key={index} 
                                                    src={`http://localhost:3001${imagePath}`} 
                                                    alt={`Trip photo ${index + 1}`} 
                                                    className="img-thumbnail"
                                                    style={{ maxHeight: '150px', width: 'auto' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Story */}
                                <h6 className="mt-4 text-muted"><i className="bi bi-journal-text me-1"></i>Story Details</h6>
                                <p className="mb-3">{selectedEntry.content}</p>

                                {/* 💰 EXPENSE BREAKDOWN */}
                                {selectedEntry.expenses && selectedEntry.expenses.length > 0 && (
                                    <>
                                        <h6 className="mt-4 border-top pt-3 text-muted">
                                            <i className="bi bi-cash-stack me-1"></i>
                                            Expense Breakdown ({selectedEntry.currency})
                                        </h6>
                                        <ul className="list-group list-group-flush mb-3">
                                            {selectedEntry.expenses.map((exp, index) => (
                                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <strong>{exp.category}</strong>
                                                    <span>
                                                        {getCurrencySymbol(selectedEntry.currency)} 
                                                        {exp.amount ? exp.amount.toFixed(2) : 0}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <TotalExpenseDisplay expenses={selectedEntry.expenses} currency={selectedEntry.currency} />
                                    </>
                                )}
                                
                            </div>
                            <div className="modal-footer">
                                <small className="me-auto text-muted">
                                    Created: {new Date(selectedEntry.createdAt).toLocaleDateString()}
                                </small>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Close
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={() => handleDeleteEntry(selectedEntry._id)}
                                >
                                    <i className="bi bi-trash me-1"></i>Delete Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyEntries;
