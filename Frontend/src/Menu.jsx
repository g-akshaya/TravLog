import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * Menu.jsx (Stable + Pastel-Brown + Smooth Animations)
 *
 * - Robust hide/restore: stores exactly the elements it hides in hiddenMapRef
 * - Uses requestAnimationFrame to trigger CSS transitions cleanly
 * - Staggered entry for menu items
 * - Pastel-brown color palette
 *
 * Tip: Add class="menu-toggle" to your menu toggle button for reliable detection.
 */

function Menu({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Controls whether DOM is rendered and CSS animation state
  const [render, setRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Map<Element, prevStyles>
  const hiddenMapRef = useRef(new Map());
  const rafRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Guest";

  // Pastel brown palette
  const pastel = {
    headerBG: "linear-gradient(135deg, #E5D3C2, #EFE6DD)",
    tileBG: "linear-gradient(135deg, #EFE6DD, #F7F2EC)",
    iconBG: "linear-gradient(180deg, #FAF5F0, #F1E6DA)",
    highlightBG: "rgba(216,195,165,0.28)",
    border: "rgba(90,62,43,0.18)",
    textDark: "#5A3E2B",
    textSoft: "#7A5C48",
    dangerBG: "rgba(180,70,50,0.12)",
    panelBG: "#FBF7F2",
  };

  // Navigation helper
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  // Collect likely toggle elements and hide/restore them.
  // This implementation stores only the elements it modified so it can restore them reliably.
  const setToggleVisibility = (hide) => {
    // selectors to consider - keep small and explicit
    const selectors = [
      ".menu-toggle",      // recommended class on your toggle
      "#menuBtn",
      ".btn-menu",
      ".navbar-toggler",
      "[data-menu-toggle]"
    ];

    // Unique nodes
    const nodes = Array.from(new Set(selectors.flatMap(s => Array.from(document.querySelectorAll(s))).filter(Boolean)));

    if (hide) {
      const map = hiddenMapRef.current;
      nodes.forEach(el => {
        try {
          if (!map.has(el)) {
            map.set(el, {
              display: el.style.display || "",
              opacity: el.style.opacity || "",
              pointerEvents: el.style.pointerEvents || "",
              visibility: el.style.visibility || ""
            });
          }
          // hide immediately to avoid flicker
          el.style.display = "none";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.style.visibility = "hidden";
        } catch (e) {
          // ignore elements we can't modify
        }
      });
    } else {
      // Restore all elements we previously hid
      const map = hiddenMapRef.current;
      for (const [el, prev] of map.entries()) {
        try {
          el.style.display = prev.display;
          el.style.opacity = prev.opacity;
          el.style.pointerEvents = prev.pointerEvents;
          el.style.visibility = prev.visibility;
        } catch (e) {
          // ignore
        }
        map.delete(el);
      }
    }
  };

  // Open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      // Render immediately so DOM exists
      setRender(true);

      // Hide toggles quickly (no timeouts)
      setToggleVisibility(true);

      // Add body helper class
      document.body.classList.add("menu-open");

      // Trigger animation on next frame for smoother CSS transition
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setAnimate(true);
        });
      });
    } else {
      // Start closing animation
      setAnimate(false);

      // After animation completes, restore toggles and unmount DOM
      const tidyTimeout = setTimeout(() => {
        setToggleVisibility(false);
        document.body.classList.remove("menu-open");
        setRender(false);
      }, 420); // matches transition duration + small buffer

      return () => clearTimeout(tidyTimeout);
    }

    // cleanup if component unmounts while open
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setToggleVisibility(false);
      document.body.classList.remove("menu-open");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!render) return null;

  // menu items
  const menuItems = [
    { icon: "bi-pencil-square", label: "Create New Entry", path: "/home" },
    { icon: "bi-journals", label: "See All Entries", path: "/entries" },
    { icon: "bi-images", label: "See Pictures Only", path: "/gallery" },
  ];

  return (
    <>
      {/* Backdrop (lower than panel) */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1080,
          background: "rgba(0,0,0,0.18)",
          backdropFilter: "blur(2px) saturate(1.02)",
          opacity: animate ? 1 : 0,
          transition: "opacity 320ms ease",
        }}
      />

      {/* Sliding panel */}
      <aside
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 320,
          zIndex: 1090, // sits above most UI
          transform: animate ? "translateX(0)" : "translateX(-120%)",
          opacity: animate ? 1 : 0,
          transition: "transform 420ms cubic-bezier(.16,.9,.32,1), opacity 320ms ease",
          willChange: "transform, opacity",
          background: pastel.panelBG,
          borderRight: `1px solid ${pastel.border}`,
          boxShadow: "0 18px 50px rgba(35,30,25,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "0 12px 12px 0",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: pastel.headerBG,
            borderBottom: `1px solid ${pastel.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
                boxShadow: "inset 0 -4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <i className="bi bi-compass" style={{ fontSize: 22, color: pastel.textDark }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: pastel.textDark }}>TravLog</div>
              <div style={{ fontSize: 12, color: pastel.textSoft }}>Your travel diary</div>
            </div>
          </div>

          <button
            aria-label="Close menu"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 22,
              color: pastel.textDark,
              cursor: "pointer",
              opacity: 0.95,
            }}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* User tile */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "16px 18px",
            borderBottom: `1px solid ${pastel.border}`,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: pastel.tileBG,
              boxShadow: "0 10px 30px rgba(90,62,43,0.07)",
              fontSize: 30,
              color: pastel.textDark,
            }}
          >
            <i className="bi bi-person-circle" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: pastel.textDark }}>{userName}</div>
            <div style={{ fontSize: 13, color: pastel.textSoft, marginTop: 6 }}>{user?.email || "Not Signed In"}</div>
          </div>
        </div>

        {/* Nav items (staggered entrance) */}
        <nav style={{ padding: 12, overflowY: "auto", flex: 1 }}>
          {menuItems.map((it, i) => (
            <button
              key={it.path}
              onClick={() => handleNavigation(it.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "12px 14px",
                marginBottom: 10,
                borderRadius: 12,
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                transform: animate ? "translateX(0)" : "translateX(-10px)",
                opacity: animate ? 1 : 0,
                transition: `transform 420ms cubic-bezier(.2,.9,.2,1) ${120 + i * 40}ms, opacity 320ms ease ${120 + i * 40}ms`,
                color: pastel.textDark,
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(6px)";
                e.currentTarget.style.background = pastel.highlightBG;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background: pastel.iconBG,
                boxShadow: "0 8px 20px rgba(20,30,40,0.04)",
                color: pastel.textDark,
              }}>
                <i className={`bi ${it.icon}`} style={{ fontSize: 18 }} />
              </div>
              <div>{it.label}</div>
            </button>
          ))}

          <div style={{ marginTop: 12, marginBottom: 8, padding: "8px 6px", fontSize: 12, color: pastel.textSoft, fontWeight: 800, textTransform: "uppercase" }}>
            Account
          </div>

          <button
            onClick={() => handleNavigation("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 14px",
              marginBottom: 10,
              borderRadius: 12,
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              color: pastel.textDark,
              fontWeight: 700,
              transition: "transform 200ms ease, background 200ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.background = "rgba(235,245,235,0.85)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", background: pastel.iconBG, boxShadow: "0 6px 14px rgba(20,30,40,0.03)" }}>
              <i className="bi bi-person" style={{ fontSize: 18, color: pastel.textDark }} />
            </div>
            <div>User Profile & Edit</div>
          </button>

          <button
            onClick={() => { localStorage.removeItem("user"); localStorage.removeItem("selectedEntry"); handleNavigation("/login"); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 14px",
              marginBottom: 6,
              borderRadius: 12,
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              color: "#b33b3b",
              fontWeight: 800,
              transition: "transform 200ms ease, background 200ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.background = pastel.dangerBG; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center", background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,245,245,0.6))", boxShadow: "0 6px 12px rgba(20,40,80,0.03)" }}>
              <i className="bi bi-box-arrow-left" style={{ fontSize: 18, color: "#9b2c2c" }} />
            </div>
            <div>Logout</div>
          </button>
        </nav>

        {/* footer */}
        <div style={{ padding: 12, borderTop: `1px solid ${pastel.border}`, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
          v1.1 · TravLog
        </div>
      </aside>
    </>
  );
}

export default Menu;
