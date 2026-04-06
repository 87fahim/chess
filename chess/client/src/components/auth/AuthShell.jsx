import React from 'react';
import PageTitle from '../pagetitle/PageTitle';
import './auth.css';

export default function AuthShell({ title, description, children, footer }) {
  return (
    <section className="auth-shell">
      <div className="auth-card">
        <PageTitle title={title} style="simple" />
        {description ? <p className="auth-description">{description}</p> : null}
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </section>
  );
}