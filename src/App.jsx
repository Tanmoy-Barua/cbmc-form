import React, { useEffect } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import FormPage from "./pages/FormPage";
import SubmissionsPage from "./pages/SubmissionsPage";

export default function App() {
  // Auto theme by local time
//   useEffect(() => {
//     const applyTimeTheme = () => {
//       const hour = new Date().getHours();
//       const theme = hour >= 7 && hour <= 18 ? "light" : "dark";
//       document.documentElement.setAttribute("data-bs-theme", theme);
//     };
//     applyTimeTheme();
//     const t = setInterval(applyTimeTheme, 60 * 1000);
//     return () => clearInterval(t);
//   }, []);

  return (
    <div className="min-vh-100 bg-body text-body d-flex flex-column">
      <nav className="border-bottom">
        <div className="container d-flex align-items-center justify-content-between py-2">
          <Link to="/" className="text-decoration-none fw-semibold nav-logo">
            CBMC Membership
          </Link>
          <div className="d-flex gap-3">
            <NavLink to="/" end className={({isActive}) => isActive ? "link-primary" : "link-secondary"}>
              Home
            </NavLink>
            {/* <NavLink to="/submissions" className={({isActive}) => isActive ? "link-primary" : "link-secondary"}>
              Submissions
            </NavLink> */}
          </div>
        </div>
      </nav>

      <div className="flex-grow-1 d-flex align-items-center">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
        </Routes>
      </div>
    </div>
  );
}
