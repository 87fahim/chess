import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/userAuth";
import appIcon from "../../../assets/icons/app-icon.png";

type PlayOption = "vs-computer" | "vs-player" | "practice" | "online";

type ChessLeftSidebarProps = {
  selectedMode: PlayOption;
  onSelectMode: (mode: PlayOption) => void;
  onOpenSettings: () => void;
};

const NAV_ITEMS = ["Puzzles", "Learn", "Train", "Watch", "Community", "Other"];

export default function ChessLeftSidebar({ selectedMode, onSelectMode, onOpenSettings }: ChessLeftSidebarProps) {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const user = auth?.user ?? null;
  const logout = auth?.logout as (() => Promise<void>) | undefined;

  const userDisplayName = user?.username || user?.name || "Guest";
  const userSubText = user?.email || (isAuthenticated ? "Signed in" : "Not signed in");
  const userAvatarUrl = user?.profilePicture || user?.avatar || user?.photoURL || user?.image || undefined;

  const handleLogout = async () => {
    if (typeof logout === "function") {
      await logout();
    }
    navigate("/login");
  };

  return (
    <aside className="app-left-sidebar" aria-label="Chess navigation sidebar">
      <div className="app-left-sidebar__top">
        <div className="app-left-sidebar__brand">
          <img src={appIcon} alt="Chess icon" className="app-left-sidebar__brand-icon" />
          <span>ChessApp</span>
        </div>

        <nav className="app-left-sidebar__nav" aria-label="Primary">
          <div className="app-left-sidebar__nav-group app-left-sidebar__nav-group--play">
            <button className="app-left-sidebar__nav-item" type="button">
              Play
            </button>
            <div className="app-left-sidebar__play-flyout" role="menu" aria-label="Play menu">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={selectedMode === "vs-computer"}
                className={`app-left-sidebar__play-item ${selectedMode === "vs-computer" ? "is-active" : ""}`}
                onClick={() => onSelectMode("vs-computer")}
              >
                VS Computer
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={selectedMode === "vs-player"}
                className={`app-left-sidebar__play-item ${selectedMode === "vs-player" ? "is-active" : ""}`}
                onClick={() => onSelectMode("vs-player")}
              >
                VS Player
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={selectedMode === "online"}
                className={`app-left-sidebar__play-item ${selectedMode === "online" ? "is-active" : ""}`}
                onClick={() => onSelectMode("online")}
              >
                Online
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={selectedMode === "practice"}
                className={`app-left-sidebar__play-item ${selectedMode === "practice" ? "is-active" : ""}`}
                onClick={() => onSelectMode("practice")}
              >
                Practice
              </button>
            </div>
          </div>

          {NAV_ITEMS.map((item) => (
            <button key={item} className="app-left-sidebar__nav-item" type="button">
              {item}
            </button>
          ))}

          <button className="app-left-sidebar__nav-item" type="button" onClick={onOpenSettings}>
            Settings
          </button>
        </nav>
      </div>

      <div className="app-left-sidebar__bottom">
        <div className="app-left-sidebar__user">
          <div className="app-left-sidebar__avatar" aria-hidden="true">
            {userAvatarUrl ? <img src={userAvatarUrl} alt="" /> : <span>{userDisplayName.charAt(0).toUpperCase()}</span>}
          </div>
          <div className="app-left-sidebar__user-meta">
            <strong>{userDisplayName}</strong>
            <small>{userSubText}</small>
          </div>
        </div>

        {isAuthenticated ? (
          <button type="button" className="app-left-sidebar__auth-btn" onClick={handleLogout}>
            Log Out
          </button>
        ) : (
          <div className="app-left-sidebar__auth-row">
            <button type="button" className="app-left-sidebar__auth-btn" onClick={() => navigate("/register")}>
              Sign Up
            </button>
            <button type="button" className="app-left-sidebar__auth-btn app-left-sidebar__auth-btn--secondary" onClick={() => navigate("/login")}>
              Log In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
