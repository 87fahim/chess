type AuthActionGroupProps = {
  isAuthenticated: boolean;
  onLogout: () => void;
  onRegister: () => void;
  onLogin: () => void;
  primaryButtonClassName: string;
  secondaryButtonClassName?: string;
  rowClassName?: string;
};

export default function AuthActionGroup({
  isAuthenticated,
  onLogout,
  onRegister,
  onLogin,
  primaryButtonClassName,
  secondaryButtonClassName,
  rowClassName,
}: AuthActionGroupProps) {
  if (isAuthenticated) {
    return (
      <button type="button" className={primaryButtonClassName} onClick={onLogout}>
        Log Out
      </button>
    );
  }

  return (
    <div className={rowClassName}>
      <button type="button" className={primaryButtonClassName} onClick={onRegister}>
        Sign Up
      </button>
      <button type="button" className={secondaryButtonClassName ?? primaryButtonClassName} onClick={onLogin}>
        Log In
      </button>
    </div>
  );
}