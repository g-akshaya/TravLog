import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MapDisplay from './MapDisplay'; 

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

function MyEntries() {
    const [travelEntries, setTravelEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const navigate = useNavigate();

    // Function to fetch entries
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
                setSelectedEntry(null); // Close modal
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
                    <i className="bi bi-map me-2"></i>My Travel Journals
                </h2>
                <p className="text-center mb-4" style={{ color: '#6b5847', fontStyle: 'italic' }}>
                    A collection of your unforgettable journeys.
                </p>

                {travelEntries.length === 0 ? (
                    <p className="text-center text-muted">No entries yet. Start your first adventure!</p>
                ) : (
                    <div className="list-group mb-4">
                        {travelEntries.map(entry => (
                            <div
                                key={entry._id}
                                className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm p-3"
                                style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d', cursor: 'pointer' }}
                                // Note: We attach the view handler to the text/content wrapper, not the delete button
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

            {/* Modal - Displays map and detailed expenses */}
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
                                
                                {/* 🗺️ RENDER MAP DISPLAY */}
                                {selectedEntry.location && (
                                    <>
                                        <h6 className="mt-2 text-muted"><i className="bi bi-pin-map me-1"></i>Location: {selectedEntry.location.name || 'Geo-tagged Location'}</h6>
                                        <MapDisplay location={selectedEntry.location} /> 
                                    </>
                                )}
                                
                                {/* Story Details */}
                                <h6 className="mt-4 text-muted"><i className="bi bi-journal-text me-1"></i>Story Details</h6>
                                <p className="mb-3">{selectedEntry.content}</p>

                                {/* 💰 DISPLAY EXPENSE BREAKDOWN */}
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
                                {/* 🗑️ DELETE BUTTON IN MODAL */}
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