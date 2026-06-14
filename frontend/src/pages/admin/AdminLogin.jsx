import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './AdminLogin.module.css'; 

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', { 
        email, 
        password 
      });

      const { role, fullName } = response.data;

      if (role === 'admin') {
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', fullName);
        
        Swal.fire({
          icon: 'success',
          title: 'System Access Granted',
          text: `Welcome, ${fullName}`,
          timer: 1500,
          showConfirmButton: false
        });

        navigate('/admin-dashboard', { replace: true });
      } else {
        throw new Error("Unauthorized: Administrative privileges required.");
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: error.response?.data?.detail || error.message,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.lockIcon}>🔐</div>
        <h2>HFD AI Control Center</h2>
        <p>Please enter administrative credentials to proceed.</p>
        
        <form onSubmit={handleAdminLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <input 
              type="password" 
              placeholder="Secret Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}