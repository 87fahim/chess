import React from 'react';

export default function AuthFeedback({ message, tone = 'error' }) {
  if (!message) {
    return null;
  }

  return <p className={`auth-feedback auth-feedback--${tone}`}>{message}</p>;
}