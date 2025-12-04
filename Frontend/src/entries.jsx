import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// 🗺️ Import the new MapDisplay component
import MapDisplay from './MapDisplay'; 

function MyEntries() {
    const [travelEntries, setTravelEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        axios.get(`http://localhost:3001/entries/${user.email}`)
            .then(response => {
                setTravelEntries(response.data);
            })
            .catch(error => {
                console.error("Error fetching entries:", error);
                alert("Failed to load travel entries.");
            });
    }, [navigate]);

    const handleViewEntry = (entry) => {
        setSelectedEntry(entry);
        localStorage.setItem("selectedEntry", JSON.stringify(entry));
    };

    const handleAddNewEntry = () => {
        navigate('/home'); // Assuming /home is where your new entry form is located
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
                color: '#4a3b2c'
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
                                className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm"
                                style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d', cursor: 'pointer' }}
                                onClick={() => handleViewEntry(entry)}
                            >
                                <div className="d-flex w-100 justify-content-between">
                                    <h5 className="mb-1" style={{ color: '#8b5e3c' }}>
                                        <i className="bi bi-pin-map me-2"></i>{entry.title}
                                    </h5>
                                    <small className="text-muted">
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                {/* 🗺️ Display map icon if location exists */}
                                {entry.location && entry.location.coordinates && (
                                    <span className="badge bg-success float-end"><i className="bi bi-globe me-1"></i>Geo-tagged</span>
                                )}
                                <p className="mb-1 text-truncate" style={{ maxHeight: '2.5em', overflow: 'hidden', color: '#6b5847' }}>
                                    {entry.content}
                                </p>
                                <small style={{ color: '#a18769' }}>Click to read more...</small>
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
                                <h5 className="modal-title">{selectedEntry.title}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                
                                {/* 🗺️ RENDER MAP DISPLAY IN MODAL */}
                                {selectedEntry.location && (
                                    <>
                                        <h6 className="mt-2 text-muted">Location: {selectedEntry.location.name || 'Coordinates Listed Below'}</h6>
                                        <MapDisplay location={selectedEntry.location} />
                                    </>
                                )}
                                
                                <p className="mt-3">{selectedEntry.content}</p>
                                
                            </div>
                            <div className="modal-footer">
                                <small className="me-auto text-muted">
                                    Created: {new Date(selectedEntry.createdAt).toLocaleDateString()}
                                </small>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Close
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