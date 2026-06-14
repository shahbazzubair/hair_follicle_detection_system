import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/auth/forgot-password', { email });
      Swal.fire('Email Sent!', 'Please check your inbox for the reset link.', 'success');
      setEmail('');
    } catch (err) {
      if (err.response?.status === 404) {
        Swal.fire({ title: "Not Registered", text: err.response.data.detail, icon: "warning", showCancelButton: true, confirmButtonText: 'Go to Signup' }).then((r) => { if (r.isConfirmed) navigate('/signup'); });
      } else {
        Swal.fire('Error', 'Could not connect to the server.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button onClick={() => navigate('/login')} className={styles.backBtn}>← Back to Login</button>
        <h2>Forgot Password?</h2>
        <p>Enter your email below to receive a reset link.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" placeholder="registered@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? "Checking..." : "Send Reset Link"}</button>
        </form>
      </div>
    </div>
  );
}