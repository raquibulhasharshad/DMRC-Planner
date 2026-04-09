import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import { API_BASE_URL } from '../config/api.config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email cannot be empty';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email address';
    }

    // Password validation: min 8 length
    if (!password) {
      errors.password = 'Password cannot be empty';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem('metro_user', res.data.name);
      localStorage.setItem('metro_email', res.data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container auth-bg">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="logo-icon">🚇</div>
          <h2>Welcome Back</h2>
          <p>Login to calculate your metro route</p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form" noValidate>
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

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
