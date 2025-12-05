import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Menu from "./Menu"; // updated menu

/**
 * Gallery.jsx
 * - Uses Menu with class "menu-toggle" for reliable hide
 * - Polished cards, pastel-brown accents
 * - Hover zoom on images
 * - Animated image lightbox/modal
 */

function Gallery() {
  const [entriesWithPics, setEntriesWithPics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // lightbox state
  const [lightbox, setLightbox] = useState({ open: false, src: "", title: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:3001/entries/${user.email}`)
      .then((response) => {
        const filtered = response.data.filter((entry) => entry.images && entry.images.length > 0);
        setEntriesWithPics(filtered);
      })
      .catch((error) => {
        console.error("Error fetching gallery images:", error);
        alert("Failed to load pictures.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const pastelText = { color: "#5A3E2B" };
  const cardBG = "rgba(248, 241, 229, 0.96)";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.0)), url(https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Merriweather', serif",
        color: "#4a3b2c",
        padding: 28,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 18,
      }}
    >
      {/* MENU BUTTON (give class 'menu-toggle' for Menu to detect/hide) */}
      <button
        className="menu-toggle btn shadow-lg"
        onClick={() => setIsMenuOpen(true)}
        style={{
          position: "fixed",
          top: 18,
          left: 18,
          zIndex: 1200,
          background: "#5a3d2b",
          color: "#fff",
          border: "none",
          padding: "10px 14px",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(60,40,30,0.18)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
        }}
      >
        <i className="bi bi-list" style={{ fontSize: 18 }} />
        <span style={{ fontSize: 14 }}>Menu</span>
      </button>

      {/* Sliding Menu */}
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Content container */}
      <div
        style={{
          width: "min(1100px, 95%)",
          maxWidth: 1100,
          background: cardBG,
          border: "1px solid #c4ab89",
          borderRadius: 18,
          boxShadow: "0 18px 50px rgba(30,25,20,0.08)",
          padding: 26,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <h2 style={{ margin: 0, color: pastelText.color, fontWeight: 900, letterSpacing: 0.2 }}>
            <i className="bi bi-camera me-2" /> Travel Photo Gallery
          </h2>
          <div style={{ color: "#7A5C48", fontSize: 13 }}>Memories from your journeys</div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#7b6a59" }}>Loading photos...</p>
        ) : entriesWithPics.length === 0 ? (
          <p style={{ textAlign: "center", color: "#a57f63" }}>No entries with pictures found.</p>
        ) : (
          entriesWithPics.map((entry) => (
            <section key={entry._id} style={{ marginBottom: 28, paddingBottom: 12, borderBottom: "1px dashed rgba(90,62,43,0.06)" }}>
              <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 12, height: 12, background: "#E5D3C2", borderRadius: 4 }} />
                <h4 style={{ margin: 0, color: "#7A5C48", fontWeight: 800 }}>{entry.title}</h4>
              </header>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {entry.images.map((imgPath, idx) => {
                  const src = `http://localhost:3001${imgPath}`;
                  return (
                    <div
                      key={idx}
                      role="button"
                      onClick={() => setLightbox({ open: true, src, title: entry.title })}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setLightbox({ open: true, src, title: entry.title })}
                      style={{
                        height: 160,
                        borderRadius: 12,
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "0 8px 30px rgba(40,30,20,0.06)",
                        cursor: "pointer",
                        background: "#f7efe3",
                        transform: "translateZ(0)",
                      }}
                    >
                      <img
                        src={src}
                        alt={`${entry.title} - ${idx}`}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 420ms cubic-bezier(.2,.9,.2,1), filter 420ms ease",
                          display: "block",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.filter = "brightness(0.98)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "none"; }}
                      />
                      <div style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        background: "rgba(255,255,255,0.8)",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#6b4f39",
                        fontWeight: 700,
                        boxShadow: "0 6px 12px rgba(20,20,20,0.05)",
                      }}>
                        {entry.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          onClick={() => setLightbox({ open: false, src: "", title: "" })}
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 1300,
            background: "linear-gradient(rgba(6,6,6,0.45), rgba(6,6,6,0.65))",
            animation: "lightboxFade 240ms ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92%",
              maxHeight: "86%",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              background: "#fff",
              transform: "translateY(0)",
              animation: "lightboxPop 320ms cubic-bezier(.2,.9,.2,1)",
            }}
          >
            <img src={lightbox.src} alt={lightbox.title} style={{ width: "100%", height: "auto", display: "block", maxHeight: "80vh", objectFit: "contain", background: "#000" }} />
            <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 800, color: "#5A3E2B" }}>{lightbox.title}</div>
              <button onClick={() => setLightbox({ open: false, src: "", title: "" })} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>
          <style>{`
            @keyframes lightboxFade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes lightboxPop { from { transform: translateY(10px) scale(.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default Gallery;
