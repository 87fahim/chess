import React, { useState } from 'react';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../pagetitle/PageTitle';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('Weak');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

    if (name === 'password') updatePasswordStrength(value);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // requires 8+ chars, 1 uppercase, 1 number; special chars optional
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    // if (!formData.username.trim()) newErrors.username = 'Username is required.';
    // if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    // if (!passwordRegex.test(formData.password)) {
    //   newErrors.password =
    //     'Password must be at least 8 characters long, contain one uppercase letter and one number.';
    // }
    // if (formData.password !== formData.confirmPassword)
    //   newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[@$!%*?&]/.test(password);
    const isLongEnough = password.length >= 8;

    if (isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars) {
      setPasswordStrength('Strong');
    } else if (isLongEnough && (hasUpperCase || hasLowerCase) && (hasNumbers || hasSpecialChars)) {
      setPasswordStrength('Moderate');
    } else {
      setPasswordStrength('Weak');
    }
  };

  const getStrengthClass = () => {
    const v = (passwordStrength || '').toLowerCase();
    if (v === 'strong') return 'strong';
    if (v === 'moderate') return 'moderate';
    return 'weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiResponse(null);

    try {
      const response = await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // sending as-is; server should hash/store securely
      });

      if (response.ok) {
        const data = await response.json();
        setApiResponse({ success: true, message: data.message || 'Account created!' });
        navigate('/login', { state: { message: 'Account was created successfully!' } });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setApiResponse({ success: false, message: errorData.message || 'An error occurred.' });
      }
    } catch (error) {
      setApiResponse({ success: false, message: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="create-account">
        <PageTitle title="✍️ Register" style="simple" />
        <p>Welcome to the registration page. Please fill out your details below.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
            required
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {errors.username && (
            <p id="username-error" className="error-message">
              {errors.username}
            </p>
          )}

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="error-message">
              {errors.email}
            </p>
          )}

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="new-password"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="error-message">
              {errors.password}
            </p>
          )}

          <div className="password-strength">
            Password Strength: <span className={getStrengthClass()}>{passwordStrength}</span>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="error-message">
              {errors.confirmPassword}
            </p>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        {apiResponse && (
          <div className={`api-response ${apiResponse.success ? 'success' : 'error'}`}>
            {apiResponse.message}
          </div>
        )}

        <p className="have-account-text">Already have an account?</p>
        <Link to="/login" className="have-account">
          <button className="login-button-register-page" type="button">Login</button>
        </Link>
      </div>
    </div>
  );
};

export default CreateAccount;
