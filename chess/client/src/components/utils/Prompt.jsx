import React from 'react';

export default function Prompt({ open, title, message, okText = 'OK', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="prompt__backdrop" onClick={onCancel}>
      <div className="prompt__dialog" onClick={e => e.stopPropagation()}>
        <h3 className="prompt__title">{title}</h3>
        {message && <p className="prompt__message">{message}</p>}
        <div className="prompt__actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{okText}</button>
        </div>
      </div>
    </div>
  );
}
