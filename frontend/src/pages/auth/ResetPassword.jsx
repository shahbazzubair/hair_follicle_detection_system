import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }), [password]);

  const isPasswordSecure = Object.values(passwordChecks).every(Boolean);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isPasswordSecure) return Swal.fire('Weak Password', 'Please follow the checklist.', 'error');
    if (password !== confirmPassword) return Swal.fire('Error', 'Passwords do not match!', 'warning');

    setLoading(true);
    try {
      await axios.post(`http://localhost:8000/api/auth/reset-password/${token}`, { password });
      Swal.fire('Success', 'Password updated successfully!', 'success');
      navigate('/login');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || "Link expired", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Set New Password</h2>
        <p>Create a secure password for your account.</p>
        <form onSubmit={handleReset}>
          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className={styles.passwordRequirements}>
              <div className={passwordChecks.length ? styles.valid : styles.invalid}>{passwordChecks.length ? '✓' : '○'} 8+ Chars</div>
              <div className={passwordChecks.upper ? styles.valid : styles.invalid}>{passwordChecks.upper ? '✓' : '○'} Uppercase</div>
              <div className={passwordChecks.lower ? styles.valid : styles.invalid}>{passwordChecks.lower ? '✓' : '○'} Lowercase</div>
              <div className={passwordChecks.number ? styles.valid : styles.invalid}>{passwordChecks.number ? '✓' : '○'} Number</div>
              <div className={passwordChecks.special ? styles.valid : styles.invalid}>{passwordChecks.special ? '✓' : '○'} Special</div>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading || !isPasswordSecure}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}