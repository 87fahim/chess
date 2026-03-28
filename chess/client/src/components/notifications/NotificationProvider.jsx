import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./notifications.css";

const NotificationContext = createContext({
  notify: () => {},
  confirm: async () => false,
});

export const useNotification = () => useContext(NotificationContext);

let idCounter = 0;

export default function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]); // [{id, message, type, actions[], duration}]
  const [confirmState, setConfirmState] = useState(null); // {title, message, okText, cancelText, resolve}
  const portalRef = useRef(null);

  // ensure a portal root exists
  useEffect(() => {
    let node = document.getElementById("notifications-root");
    if (!node) {
      node = document.createElement("div");
      node.id = "notifications-root";
      document.body.appendChild(node);
    }
    
    portalRef.current = node;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(({ message, type = "info", duration = 3000, actions = [] }) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type, actions, duration }]);
    if (duration && duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const confirm = useCallback(({ title = "Are you sure?", message = "", okText = "OK", cancelText = "Cancel" } = {}) => {
    return new Promise((resolve) => {
      setConfirmState({ title, message, okText, cancelText, resolve });
    });
  }, []);

  const handleConfirm = useCallback((accepted) => {
    if (confirmState?.resolve) confirmState.resolve(accepted);
    setConfirmState(null);
  }, [confirmState]);

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  const portalUI = portalRef.current && createPortal(
    <>
      {/* Toasts stack (top-right) */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast__content">
              <span className="toast__message">{t.message}</span>
              {t.actions?.length > 0 && (
                <div className="toast__actions">
                  {t.actions.map((a, i) => (
                    <button
                      key={i}
                      className="toast__btn"
                      onClick={() => { a.onClick?.(); removeToast(t.id); }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="toast__close" onClick={() => removeToast(t.id)} aria-label="Close">×</button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="confirm__backdrop" onClick={() => handleConfirm(false)}>
          <div className="confirm__dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm__title">{confirmState.title}</h3>
            {confirmState.message && <p className="confirm__message">{confirmState.message}</p>}
            <div className="confirm__actions">
              <button className="btn btn-secondary" onClick={() => handleConfirm(false)}>{confirmState.cancelText}</button>
              <button className="btn btn-primary" onClick={() => handleConfirm(true)}>{confirmState.okText}</button>
            </div>
          </div>
        </div>
      )}
    </>,
    portalRef.current
  );

  // keyboard: ESC to cancel confirm
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && confirmState) handleConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmState, handleConfirm]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {portalUI}
    </NotificationContext.Provider>
  );
}
