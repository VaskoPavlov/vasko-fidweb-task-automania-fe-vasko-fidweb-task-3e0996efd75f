import React, { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; 
import { useWindowWidth } from '../../hooks/useWindowWidth';
import * as styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { login, user, loading, error } = useLogin();
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  
  const isMobile = useWindowWidth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Invalid email address');
      return false;
    }
    if (password.length < 4) {
      setValidationError('Password must be at least 4 characters long');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login(email, password);
    if (success) {
      navigate('/listing/list');
    }
  };

  return (
    <div className={isMobile ? styles.mobileOverlay : styles.overlay}>
      <div className={isMobile ? styles.mobileLoginContainer : styles.loginContainer}>
        <div className={styles.logo}>
          <img src="../public/imagesAndSvgs/Group19448.svg" alt="AUTOMANIA Logo" />
        </div>
        <h2 className={styles.h2}>WELCOME BACK</h2>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.labels} htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.labels} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.passwordInput}
              />
              <span
                className={styles.togglePassword}
                onClick={togglePasswordVisibility}
              >
                <img
                  className={styles.eyeIcon}
                  src={passwordVisible ? "../public/view-2.svg" : "../public/view.svg"}
                  alt={passwordVisible ? "Hide Password" : "Show Password"}
                />
              </span>
            </div>
          </div>
          {validationError && <p className={styles.error}>{validationError}</p>}
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'Logging in...' : 'LOG IN'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
