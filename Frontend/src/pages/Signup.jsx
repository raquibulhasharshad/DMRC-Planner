import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import { API_BASE_URL } from '../config/api.config';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name cannot be empty';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email cannot be empty';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email address';
    }

    // Phone validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      errors.phoneNumber = 'Phone number cannot be empty';
    } else if (!phoneRegex.test(phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    // Password validation: min 8 length
    if (!password) {
      errors.password = 'Password cannot be empty';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm Password
    if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, { name, email, password, confirmPassword, phoneNumber });
      localStorage.setItem('metro_user', res.data.name);
      localStorage.setItem('metro_email', res.data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container auth-bg">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="logo-icon">🚇</div>
          <h2>Create Account</h2>
          <p>Join Delhi Metro Planner</p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSignup} className="auth-form" noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setFormErrors({...formErrors, name: ''}); }}
            />
            {formErrors.name && <span className="field-error-text">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFormErrors({...formErrors, email: ''}); }}
            />
            {formErrors.email && <span className="field-error-text">{formErrors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="1234567890"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setFormErrors({...formErrors, phoneNumber: ''}); }}
            />
            {formErrors.phoneNumber && <span className="field-error-text">{formErrors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFormErrors({...formErrors, password: ''}); }}
            />
            {formErrors.password && <span className="field-error-text">{formErrors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setFormErrors({...formErrors, confirmPassword: ''}); }}
            />
            {formErrors.confirmPassword && <span className="field-error-text">{formErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
