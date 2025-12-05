import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Menu from './Menu'; // ✅ Add Menu

function Gallery() {
    const [entriesWithPics, setEntriesWithPics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        axios.get(`http://localhost:3001/entries/${user.email}`)
            .then(response => {
                const filtered = response.data.filter(entry => 
                    entry.images && entry.images.length > 0
                );
                setEntriesWithPics(filtered);
            })
            .catch(error => {
                console.error("Error fetching gallery images:", error);
                alert("Failed to load pictures.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    return (
        <div 
            className="d-flex justify-content-center"
            style={{
                backgroundImage: 'url(https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: `'Merriweather', serif`,
                color: '#4a3b2c',
                minHeight: '100vh',
                padding: '20px 0',
                position: 'relative', // ✅ for absolute button
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
                    maxWidth: '900px',
                    minWidth: '500px',
                    backgroundColor: 'rgba(248, 241, 229, 0.92)',
                    border: '1px solid #c4ab89',
                    backdropFilter: 'blur(6px)',
                    width: '90%',
                    zIndex: 1,
                }}
            >
                <h2 className="text-center mb-4" style={{ color: '#5a3d2b' }}>
                    <i className="bi bi-camera me-2"></i>Travel Photo Gallery
                </h2>

                {loading ? (
                    <p className="text-center text-muted">Loading photos...</p>
                ) : entriesWithPics.length === 0 ? (
                    <p className="text-center text-warning">No entries with pictures found.</p>
                ) : (
                    entriesWithPics.map(entry => (
                        <div key={entry._id} className="mb-5 border-bottom pb-3">
                            <h4 className="mb-3" style={{ color: '#8b5e3c' }}>
                                <i className="bi bi-dot me-1"></i>{entry.title}
                            </h4>
                            <div className="d-flex flex-wrap gap-3 justify-content-center">
                                {entry.images.map((imagePath, index) => (
                                    <img 
                                        key={index}
                                        src={`http://localhost:3001${imagePath}`} 
                                        alt={`Photo for ${entry.title}`} 
                                        className="img-thumbnail shadow-sm"
                                        style={{ 
                                            width: '200px', 
                                            height: '150px', 
                                            objectFit: 'cover',
                                            cursor: 'pointer' 
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Gallery;
