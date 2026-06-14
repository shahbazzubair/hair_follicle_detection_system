import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import styles from './Signup.module.css';

export default function Signup() {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', specialization: '', degree: null
  });

  const passwordChecks = useMemo(() => ({
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    number: /\d/.test(formData.password)
  }), [formData.password]);

  const isPasswordSecure = Object.values(passwordChecks).every(Boolean);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, degree: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordSecure) return Swal.fire('Weak Password', 'Please meet all security requirements.', 'error');
    if (formData.password !== formData.confirmPassword) return Swal.fire('Error', 'Passwords do not match!', 'warning');

    setLoading(true);
    try {
      if (role === 'patient') {
        await axios.post('http://localhost:8000/api/auth/signup/patient', {
          fullName: formData.fullName, email: formData.email, phone: formData.phone, password: formData.password
        });
      } else {
        const doctorData = new FormData();
        doctorData.append("fullName", formData.fullName);
        doctorData.append("email", formData.email);
        doctorData.append("phone", formData.phone);
        doctorData.append("password", formData.password);
        doctorData.append("specialization", formData.specialization);
        if (formData.degree) doctorData.append("degree", formData.degree);
        
        await axios.post('http://localhost:8000/api/auth/signup/doctor', doctorData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      
      Swal.fire('Success!', role === 'doctor' ? 'Account pending admin verification.' : 'Welcome! You can now log in.', 'success');
      navigate('/login');
    } catch (error) {
      Swal.fire('Failed', error.response?.data?.detail || 'Registration failed.', 'error');
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
        
        <h2>{role === 'patient' ? 'Create Patient Account' : 'Join as a Doctor'}</h2>
        <p>Complete the form below to get started.</p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}><label>Full Name</label><input type="text" name="fullName" onChange={handleChange} required /></div>
          <div className={styles.inputGroup}><label>Email Address</label><input type="email" name="email" onChange={handleChange} required /></div>
          <div className={styles.inputGroup}><label>Contact Number</label><input type="tel" name="phone" onChange={handleChange} required /></div>

          {role === 'doctor' && (
            <>
              <div className={styles.inputGroup}><label>Specialization</label><input type="text" name="specialization" onChange={handleChange} required /></div>
              <div className={styles.inputGroup}><label>Degree Upload</label><input type="file" accept="image/*" onChange={handleFileChange} required className={styles.fileInput}/></div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" name="password" onChange={handleChange} required />
            <div className={styles.passwordRequirements}>
              <div className={passwordChecks.length ? styles.valid : styles.invalid}>{passwordChecks.length ? '✓' : '○'} 8+ Characters</div>
              <div className={passwordChecks.upper ? styles.valid : styles.invalid}>{passwordChecks.upper ? '✓' : '○'} One Uppercase</div>
              <div className={passwordChecks.lower ? styles.valid : styles.invalid}>{passwordChecks.lower ? '✓' : '○'} One Lowercase</div>
              <div className={passwordChecks.number ? styles.valid : styles.invalid}>{passwordChecks.number ? '✓' : '○'} One Number</div>
              <div className={passwordChecks.special ? styles.valid : styles.invalid}>{passwordChecks.special ? '✓' : '○'} One Special Char</div>
            </div>
          </div>
          
          <div className={styles.inputGroup}><label>Confirm Password</label><input type="password" name="confirmPassword" onChange={handleChange} required /></div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading || !isPasswordSecure}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.switchAuth}>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}