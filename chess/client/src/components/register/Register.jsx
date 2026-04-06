import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import AuthShell from '../auth/AuthShell';
import AuthField from '../auth/AuthField';
import AuthFeedback from '../auth/AuthFeedback';
import { getPasswordStrength, validateRegistrationForm } from '../auth/authValidators';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    setStatus(null);
  };

  const validateForm = () => {
    const nextErrors = validateRegistrationForm(formData);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (response.ok) {
        navigate('/login', { state: { message: 'Account was created successfully!' } });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus({ tone: 'error', message: errorData.message || 'An error occurred.' });
      }
    } catch {
      setStatus({ tone: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      description="Set up a reusable ChessApp account profile with secure credentials and personalized game settings."
      footer={
        <>
          <p className="auth-footer__text">Already have an account?</p>
          <Link to="/login" className="auth-link-button auth-link-button--secondary">
            Log In
          </Link>
        </>
      }
    >
      <AuthFeedback message={status?.message} tone={status?.tone} />
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <AuthField
          id="username"
          name="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          autoComplete="username"
          required
          error={errors.username}
          disabled={isSubmitting}
        />
        <AuthField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          required
          error={errors.email}
          disabled={isSubmitting}
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="new-password"
          required
          error={errors.password}
          disabled={isSubmitting}
        />
        <p className="auth-strength">
          Password Strength:{' '}
          <span className={`auth-strength__value auth-strength__value--${passwordStrength.tone}`}>
            {passwordStrength.label}
          </span>
        </p>
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
          disabled={isSubmitting}
        />
        <button type="submit" className="auth-submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </AuthShell>
  );
};

export default CreateAccount;
