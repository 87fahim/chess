import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Chess from "./Chess";
import ChessSettingsView from "./components/ChessSettingsView";
import AuthActionGroup from "./components/shared/AuthActionGroup";
import useAuth from "../../hooks/userAuth";
import { useTheme } from "../context/ThemeProvider";
import type { ChessAppearanceSettings } from "./Chess.types";
import NavContentWindow, { type LeftNavItem } from "./components/shared/NavContentWindow";
import appIcon from "../../assets/icons/app-icon.png";
import { useNavigate } from "react-router-dom";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import "./styles/chess-page.css";
import "./styles/shared-ui.css";

const DEFAULT_APPEARANCE: ChessAppearanceSettings = {
  lightSquareColor: "#f0e6d2",
  darkSquareColor: "#b58863",
  whitePieceColor: "classic",
  blackPieceColor: "classic",
};

export default function ChessPage() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const { theme, setTheme } = useTheme() as { theme: "light" | "dark"; setTheme: (value: "light" | "dark") => void };
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const user = auth?.user ?? null;
  const logout = auth?.logout as (() => Promise<void>) | undefined;

  const [activeSection, setActiveSection] = useState<"play" | "puzzles" | "learn" | "train" | "watch" | "community" | "other" | "settings">("play");
  const [boardZoom, setBoardZoom] = useState(1);
  const [appearanceSettings, setAppearanceSettings] = useState<ChessAppearanceSettings>(DEFAULT_APPEARANCE);
  const settingsSnapshotRef = useRef<{
    theme: "light" | "dark";
    boardZoom: number;
    appearanceSettings: ChessAppearanceSettings;
  } | null>(null);

  const settingsStorageMeta = useMemo(() => {
    const userIdentity = user?.id || user?.username || user?.email || "unknown";
    if (isAuthenticated) {
      return {
        storage: window.localStorage,
        key: `chessapp:settings:user:${userIdentity}`,
      };
    }

    return {
      storage: window.sessionStorage,
      key: "chessapp:settings:guest",
    };
  }, [isAuthenticated, user?.email, user?.id, user?.username]);

  useEffect(() => {
    try {
      const raw = settingsStorageMeta.storage.getItem(settingsStorageMeta.key);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        boardZoom?: number;
        theme?: "light" | "dark";
        lightSquareColor?: string;
        darkSquareColor?: string;
        whitePieceColor?: ChessAppearanceSettings["whitePieceColor"];
        blackPieceColor?: ChessAppearanceSettings["blackPieceColor"];
      };
      if (typeof parsed.boardZoom === "number") {
        const clampedZoom = Math.max(0.7, Math.min(1.6, parsed.boardZoom));
        setBoardZoom(clampedZoom);
      }
      if (parsed.theme === "light" || parsed.theme === "dark") {
        setTheme(parsed.theme);
      }

      setAppearanceSettings({
        lightSquareColor: typeof parsed.lightSquareColor === "string" ? parsed.lightSquareColor : DEFAULT_APPEARANCE.lightSquareColor,
        darkSquareColor: typeof parsed.darkSquareColor === "string" ? parsed.darkSquareColor : DEFAULT_APPEARANCE.darkSquareColor,
        whitePieceColor: parsed.whitePieceColor ?? DEFAULT_APPEARANCE.whitePieceColor,
        blackPieceColor: parsed.blackPieceColor ?? DEFAULT_APPEARANCE.blackPieceColor,
      });
    } catch {
      // ignore storage parsing issues
    }
  }, [settingsStorageMeta, setTheme]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        window.localStorage.removeItem("theme");
      } catch {
        // ignore storage errors
      }
    }
  }, [isAuthenticated, theme]);

  const userDisplayName = user?.username || user?.name || "Guest";
  const userSubText = user?.email || (isAuthenticated ? "Signed in" : "Not signed in");
  const userAvatarUrl = user?.profilePicture || user?.avatar || user?.photoURL || user?.image || undefined;

  const mainNavItems: LeftNavItem[] = [
    { key: "play", label: "Play", description: "Start and configure games", icon: <PlayArrowOutlinedIcon fontSize="inherit" /> },
    { key: "puzzles", label: "Puzzles", description: "Tactics and training", icon: <ExtensionOutlinedIcon fontSize="inherit" /> },
    { key: "learn", label: "Learn", description: "Lessons and guides", icon: <MenuBookOutlinedIcon fontSize="inherit" /> },
    { key: "train", label: "Train", description: "Practice modes", icon: <PsychologyOutlinedIcon fontSize="inherit" /> },
    { key: "watch", label: "Watch", description: "Streams and games", icon: <LiveTvOutlinedIcon fontSize="inherit" /> },
    { key: "community", label: "Community", description: "Players and clubs", icon: <GroupsOutlinedIcon fontSize="inherit" /> },
    { key: "other", label: "Other", description: "More features", icon: <AppsOutlinedIcon fontSize="inherit" /> },
    { key: "settings", label: "Settings", description: "App and board preferences", icon: <SettingsOutlinedIcon fontSize="inherit" /> },
  ];

  const handleLogout = async () => {
    if (typeof logout === "function") {
      await logout();
    }
    navigate("/login");
  };

  const handlePreviewSettings = useCallback((next: {
    theme: "light" | "dark";
    boardZoom: number;
    appearanceSettings: ChessAppearanceSettings;
  }) => {
    const clampedZoom = Math.max(0.7, Math.min(1.6, next.boardZoom));
    setBoardZoom(clampedZoom);
    setTheme(next.theme);
    setAppearanceSettings(next.appearanceSettings);
  }, [setTheme]);

  const handleOpenSettings = () => {
    settingsSnapshotRef.current = {
      theme,
      boardZoom,
      appearanceSettings,
    };
    setActiveSection("settings");
  };

  const handleCancelSettings = () => {
    const snapshot = settingsSnapshotRef.current;
    if (snapshot) {
      setBoardZoom(snapshot.boardZoom);
      setTheme(snapshot.theme);
      setAppearanceSettings(snapshot.appearanceSettings);
    }
    settingsSnapshotRef.current = null;
    setActiveSection("play");
  };

  const handleSaveSettings = (next: {
    theme: "light" | "dark";
    boardZoom: number;
    appearanceSettings: ChessAppearanceSettings;
  }) => {
    const clampedZoom = Math.max(0.7, Math.min(1.6, next.boardZoom));
    handlePreviewSettings(next);

    try {
      settingsStorageMeta.storage.setItem(
        settingsStorageMeta.key,
        JSON.stringify({
          theme: next.theme,
          boardZoom: clampedZoom,
          lightSquareColor: next.appearanceSettings.lightSquareColor,
          darkSquareColor: next.appearanceSettings.darkSquareColor,
          whitePieceColor: next.appearanceSettings.whitePieceColor,
          blackPieceColor: next.appearanceSettings.blackPieceColor,
        })
      );

      if (!isAuthenticated) {
        window.localStorage.removeItem("theme");
      }
    } catch {
      // ignore storage write issues
    }

    settingsSnapshotRef.current = null;
    setActiveSection("play");
  };

  const handleSectionSelect = (key: string) => {
    const next = key as typeof activeSection;

    if (next === "settings") {
      if (activeSection !== "settings") {
        handleOpenSettings();
      }
      return;
    }

    if (activeSection === "settings") {
      handleCancelSettings();
      return;
    }

    setActiveSection(next);
  };

  const renderMainContent = (activeKey: string) => {
    if (activeKey === "settings") {
      return (
        <ChessSettingsView
          currentTheme={theme}
          currentBoardZoom={boardZoom}
          currentAppearance={appearanceSettings}
          onPreview={handlePreviewSettings}
          onSave={handleSaveSettings}
          onCancel={handleCancelSettings}
        />
      );
    }

    if (activeKey !== "play") {
      return (
        <section className="chess-main-placeholder" aria-label={`${activeKey} section`}>
          <h2>{activeKey.charAt(0).toUpperCase() + activeKey.slice(1)}</h2>
          <p>This section is ready for categorized content using the reusable left-nav/content layout.</p>
        </section>
      );
    }

    return (
      <Chess
        showMoveList
        orientation="white"
        allowUndo
        allowReset
        showGameOptions
        boardZoom={boardZoom}
        onBoardZoomChange={setBoardZoom}
        appearanceSettings={appearanceSettings}
      />
    );
  };

  return (
    <div className="chess-page-shell chess-page-shell--layout">
      <NavContentWindow
        items={mainNavItems}
        activeKey={activeSection}
        onSelect={handleSectionSelect}
        renderContent={renderMainContent}
        ariaLabel="Chess sections"
        windowClassName="chess-main-layout-window"
        layoutClassName="chess-main-layout"
        navClassName="chess-main-layout__nav"
        wrapContent={false}
        navHeader={
          <div className="chess-main-layout__brand">
            <img src={appIcon} alt="Chess icon" className="chess-main-layout__brand-icon" />
            <span>ChessApp</span>
          </div>
        }
        navFooter={
          <div className="chess-main-layout__footer">
            <div className="chess-main-layout__user">
              <div className="chess-main-layout__avatar" aria-hidden="true">
                {userAvatarUrl ? <img src={userAvatarUrl} alt="" /> : <span>{userDisplayName.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="chess-main-layout__user-meta">
                <strong>{userDisplayName}</strong>
                <small>{userSubText}</small>
              </div>
            </div>

            <AuthActionGroup
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              onRegister={() => navigate("/register")}
              onLogin={() => navigate("/login")}
              primaryButtonClassName="chess-main-layout__auth-btn"
              secondaryButtonClassName="chess-main-layout__auth-btn chess-main-layout__auth-btn--secondary"
              rowClassName="chess-main-layout__auth-row"
            />
          </div>
        }
      />
    </div>
  );
}
