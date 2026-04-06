import React from 'react';

export default function AuthField({
  label,
  error,
  inputRef,
  className = '',
  id,
  ...inputProps
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`auth-field ${className}`.trim()}>
      <label className="auth-field__label" htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        ref={inputRef}
        className="auth-field__input"
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error ? <p id={errorId} className="auth-field__error">{error}</p> : null}
    </div>
  );
}