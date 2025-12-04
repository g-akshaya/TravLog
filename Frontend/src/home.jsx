
import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Home() {
    const [entryTitle, setEntryTitle] = useState('');
    const [entryContent, setEntryContent] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log("Home: Loaded user ->", user);
  if (!user) {
    navigate('/login');
  }
}, []);

    const handleSubmit = (e) => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert("User not logged in.");
    navigate('/login');
    return;
  }

  axios.post('http://localhost:3001/save-travel-entry', {
    userEmail: user.email,
    title: entryTitle,
    content: entryContent
  })
  .then(response => {
    console.log("Entry saved:", response.data);
    alert("Travel entry saved successfully!");
    setEntryTitle('');
    setEntryContent('');
  })
  .catch(error => {
    console.error("Error saving entry:", error);
    alert("Failed to save travel entry.");
  });
};


    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                position: 'relative'
            }}
        >
           
            <button
                type="button"
                className="btn rounded-pill shadow"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(248, 241, 229, 0.92)',
                    color: '#d9534f',
                    border: '2px solid #c4ab89',
                    fontWeight: '600',
                    zIndex: 1000,
                    padding: '8px 20px',
                    transition: 'all 0.3s ease',
                }}
                onClick={handleLogout}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#c4ab89';
                    e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#d9534f';
                }}
            >
                <i className="bi bi-box-arrow-left me-2"></i>Logout
            </button>

            <div
                className="p-4 shadow-lg rounded-4"
                style={{
                    minWidth: '450px',
                    backgroundColor: 'rgba(248, 241, 229, 0.92)',
                    border: '1px solid #c4ab89',
                    backdropFilter: 'blur(6px)',
                }}
            >
                <h2 className="text-center mb-3" style={{ color: '#5a3d2b' }}>
                    <i className="bi bi-pencil-square me-2"></i>New Travel Entry
                </h2>
                <p className="text-center mb-4" style={{ color: '#6b5847', fontStyle: 'italic' }}>
                    Capture your adventures, memories, and reflections.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="entryTitle" className="form-label fw-semibold">
                            <i className="bi bi-book me-2 text-brown"></i>Entry Title
                        </label>
                        <input
                            type="text"
                            id="entryTitle"
                            placeholder="e.g., A Day in Paris, Trekking the Himalayas"
                            name="entryTitle"
                            autoComplete="off"
                            className="form-control rounded-3"
                            style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d' }}
                            onChange={(e) => setEntryTitle(e.target.value)}
                            value={entryTitle}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="entryContent" className="form-label fw-semibold">
                            <i className="bi bi-file-earmark-text me-2 text-brown"></i>Your Travel Story
                        </label>
                        <textarea
                            id="entryContent"
                            placeholder="Share the details of your journey here..."
                            name="entryContent"
                            className="form-control rounded-3"
                            style={{ backgroundColor: '#fffaf3', borderColor: '#ccb89d', minHeight: '150px' }}
                            onChange={(e) => setEntryContent(e.target.value)}
                            value={entryContent}
                            rows="7"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 rounded-3 mb-3"
                        style={{ backgroundColor: '#8b5e3c', color: '#fff', border: 'none' }}
                    >
                        <i className="bi bi-send me-2"></i>Save Entry
                    </button>

                    <p className="text-center text-muted">Want to see your past entries?</p>

                    <button
                    type="button"
                    className="btn btn-outline-secondary w-100 rounded-3"
                    style={{ borderColor: '#a18769', color: '#6b5847' }}
                    onClick={() => navigate('/entries')}
                    >
                    <i className="bi bi-map me-2"></i>View My Journals
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Home;