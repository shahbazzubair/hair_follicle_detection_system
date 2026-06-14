import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import styles from './Login.module.css';

export default function Login() {
  const [role, setRole] = useState('patient'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });

      const { role: userRole, fullName } = response.data;

      if (userRole !== role && userRole !== 'admin') {
        setLoading(false);
        return Swal.fire({
          icon: 'error',
          title: 'Role Mismatch',
          text: `This account is registered as a ${userRole}. Please use the ${userRole} tab.`,
          confirmButtonColor: '#ef4444'
        });
      }

      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userName', fullName);

      if (userRole === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (userRole === 'doctor') navigate('/doctor-dashboard', { replace: true });
      else navigate('/patient-dashboard', { replace: true });

    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || "Login failed.";

      Swal.fire({
        icon: status === 403 ? 'info' : 'error',
        title: status === 403 ? 'Account Pending' : 'Login Failed',
        text: detail,
        confirmButtonColor: status === 403 ? '#2563eb' : '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.roleToggle}>
          <button type="button" className={role === 'patient' ? styles.activeTab : styles.tab} onClick={() => setRole('patient')}>Patient</button>
          <button type="button" className={role === 'doctor' ? styles.activeTab : styles.tab} onClick={() => setRole('doctor')}>Doctor</button>
        </div>

        <h2>{role === 'patient' ? 'Patient Login' : 'Doctor Login'}</h2>
        <p>Please enter your credentials to continue.</p>
        
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label>Password</label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot?</Link>
            </div>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Verifying...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}