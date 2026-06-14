import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";

// --- Layout Components ---
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// --- Landing Page ---
import Hero from "./pages/landing_page/Hero";
import Testimonials from "./pages/landing_page/Testimonials";
import Methodology from "./pages/landing_page/Methodology";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

// --- Authentication ---
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// --- Admin Portal ---
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// --- Dashboards ---
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// --- NEW: Internal Scroll Helper ---
// We define it right here in App.jsx to avoid needing a separate file!
const ScrollToTopHelper = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- ENHANCED: Main Layout Wrapper ---
// Keeps the Navbar and Footer logic completely separate from the routing tree
const MainLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {/* Outlet acts as a placeholder for whatever child route is currently active */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      {/* AUTO SCROLL TO TOP */}
      <ScrollToTopHelper />

      <Routes>
        {/* === PORTALS & DASHBOARDS (No Navbar/Footer) === */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        {/* === MAIN WEBSITE (Wrapped with Navbar/Footer) === */}
        <Route element={<MainLayout />}>
          
          {/* Landing & Info */}
          <Route 
            path="/" 
            element={
              <>
                <Hero />
                <Testimonials />
              </>
            } 
          />
          <Route path="/methodology" element={<Methodology />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Legal */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          
        </Route>
      </Routes>
    </Router>
  );
}