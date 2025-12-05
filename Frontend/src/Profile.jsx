import React, { useState, useEffect } from 'react';
import axios from 'axios'; // (kept, even if not used much now)
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Menu from './Menu'; // ✅ Add Menu

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({
        name: user?.name || '',
        password: '',
        newPassword: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updateData = {
            email: user.email,
            name: formData.name,
            password: formData.newPassword || formData.password
        };

        try {
            const updatedUser = { ...user, name: formData.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert("Profile updated successfully (local state only).");
            setIsEditing(false);
        } catch (error) {
            console.error("Profile update failed:", error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div 
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                backgroundImage: 'url(https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: `'Merriweather', serif`,
                color: '#4a3b2c',
                position: 'relative', // ✅ for menu button
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
                className="p-5 shadow-lg rounded-4"
                style={{
                    minWidth: '500px',
                    backgroundColor: 'rgba(248, 241, 229, 0.92)',
                    border: '1px solid #c4ab89',
                    backdropFilter: 'blur(6px)',
                    zIndex: 1,
                }}
            >
                <h2 className="text-center mb-4" style={{ color: '#5a3d2b' }}>
                    <i className="bi bi-person-badge me-2"></i>User Profile
                </h2>

                <div className="mb-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Name:</strong> {user.name}</p>
                </div>

                {!isEditing && (
                    <button 
                        type="button" 
                        className="btn btn-primary w-100"
                        onClick={() => setIsEditing(true)}
                        style={{ backgroundColor: '#8b5e3c', color: '#fff', border: 'none' }}
                    >
                        <i className="bi bi-pencil me-2"></i>Edit Profile
                    </button>
                )}

                {isEditing && (
                    <form onSubmit={handleUpdate} className="mt-4 p-3 border rounded">
                        <h5 className="mb-3 text-muted">Edit Details</h5>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">New Password (optional)</label>
                            <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current password"
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-success" 
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile;
