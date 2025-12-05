import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Menu({ isOpen, onClose }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || 'Guest';

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  // ✅ IMPORTANT: if not open, render nothing (no backdrop blocking the page)
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="offcanvas-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />

      {/* Sliding Menu */}
      <div
        className="offcanvas offcanvas-start bg-light shadow-lg show"
        tabIndex={-1}
        style={{
          width: '280px',
          zIndex: 1045,
          transition: 'transform 0.3s ease-in-out',
          transform: 'translateX(0%)'
        }}
      >
        <div
          className="offcanvas-header p-4"
          style={{ backgroundColor: '#8b5e3c', color: '#fff' }}
        >
          <h5 className="offcanvas-title fw-bold">
            <i className="bi bi-compass me-2"></i>TravLog Menu
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
          ></button>
        </div>

        <div className="offcanvas-body p-0">
          <div className="list-group list-group-flush">
            <div className="p-3 bg-white border-bottom text-center">
              <i className="bi bi-person-circle fs-3 text-secondary"></i>
              <p className="mb-0 mt-2 text-dark fw-bold">{userName}</p>
              <small className="text-muted">
                {user?.email || 'Not Signed In'}
              </small>
            </div>

            {/* Main Navigation Sections */}
            <button
              className="list-group-item list-group-item-action py-3"
              onClick={() => handleNavigation('/home')}
            >
              <i className="bi bi-pencil-square me-3"></i>Create New Entry
            </button>

            <button
              className="list-group-item list-group-item-action py-3"
              onClick={() => handleNavigation('/entries')}
            >
              <i className="bi bi-journals me-3"></i>See All Entries
            </button>

            <button
              className="list-group-item list-group-item-action py-3"
              onClick={() => handleNavigation('/gallery')}
            >
              <i className="bi bi-images me-3"></i>See Pictures Only
            </button>

            {/* User Account Section */}
            <div className="p-3 bg-light text-muted small fw-bold text-uppercase">
              Account
            </div>

            <button
              className="list-group-item list-group-item-action py-3"
              onClick={() => handleNavigation('/profile')}
            >
              <i className="bi bi-person me-3"></i>User Profile & Edit
            </button>

            <button
              className="list-group-item list-group-item-action py-3 text-danger"
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('selectedEntry');
                handleNavigation('/login');
              }}
            >
              <i className="bi bi-box-arrow-left me-3"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Menu;
