import { useEffect, useState } from "react";
import type { ChessAppearanceSettings } from "../Chess.types";
import BoardAndPiecesSettings from "./settings/BoardAndPiecesSettings";
import GameplaySettings from "./settings/GameplaySettings";
import ProfileSettings from "./settings/ProfileSettings";
import AccessibilitySettings from "./settings/AccessibilitySettings";
import type { BoardPreset, SettingsTabKey, ThemePreset } from "./settings/Settings.types";
import LeftNavContentLayout, { type LeftNavItem } from "./settings/shared/LeftNavContentLayout";
import MainContentWindow from "./shared/MainContentWindow";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";

type ChessSettingsViewProps = {
  currentTheme: "light" | "dark";
  currentBoardZoom: number;
  currentAppearance: ChessAppearanceSettings;
  onSave: (next: {
    theme: "light" | "dark";
    boardZoom: number;
    appearanceSettings: ChessAppearanceSettings;
  }) => void;
  onPreview: (next: {
    theme: "light" | "dark";
    boardZoom: number;
    appearanceSettings: ChessAppearanceSettings;
  }) => void;
  onCancel: () => void;
};

const PIECE_PRESETS: ChessAppearanceSettings["whitePieceColor"][] = ["classic", "sapphire", "emerald", "ruby", "gold"];

const THEME_PRESETS: ThemePreset[] = [
  { key: "light", name: "Light Theme", light: "#ece8de", dark: "#b7b09f" },
  { key: "dark", name: "Dark Theme", light: "#47443c", dark: "#1f1f1f" },
];

const BOARD_PRESETS: BoardPreset[] = [
  { name: "Classic", light: "#f0e6d2", dark: "#b58863" },
  { name: "Slate", light: "#d9dee8", dark: "#6a7b95" },
  { name: "Forest", light: "#dce9d6", dark: "#6f8b63" },
  { name: "Sand", light: "#ead9bd", dark: "#b58b61" },
  { name: "Ink", light: "#d7d8db", dark: "#5e6168" },
];

const SETTINGS_TABS: Array<{ key: SettingsTabKey; label: string; hint: string }> = [
  { key: "board", label: "Board & Pieces", hint: "Board colors, piece palettes, and app theme." },
  { key: "gameplay", label: "Gameplay", hint: "Board zoom and play comfort." },
  { key: "profile", label: "Profile", hint: "Account-related preferences." },
  { key: "accessibility", label: "Accessibility", hint: "Visibility and readability options." },
];

const SETTINGS_TAB_ITEMS: LeftNavItem[] = SETTINGS_TABS.map((tab) => ({
  key: tab.key,
  label: tab.label,
  description: tab.hint,
  icon:
    tab.key === "board" ? <GridViewOutlinedIcon fontSize="inherit" />
    : tab.key === "gameplay" ? <SportsEsportsOutlinedIcon fontSize="inherit" />
    : tab.key === "profile" ? <PersonOutlineOutlinedIcon fontSize="inherit" />
    : <AccessibilityNewOutlinedIcon fontSize="inherit" />,
}));

export default function ChessSettingsView({
  currentTheme,
  currentBoardZoom,
  currentAppearance,
  onPreview,
  onSave,
  onCancel,
}: ChessSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("board");
  const [themeDraft, setThemeDraft] = useState<"light" | "dark">(currentTheme);
  const [zoomDraft, setZoomDraft] = useState<number>(currentBoardZoom);
  const [appearanceDraft, setAppearanceDraft] = useState<ChessAppearanceSettings>(currentAppearance);

  const activeTabMeta = SETTINGS_TABS.find((item) => item.key === activeTab) ?? SETTINGS_TABS[0];

  useEffect(() => {
    onPreview({
      theme: themeDraft,
      boardZoom: zoomDraft,
      appearanceSettings: appearanceDraft,
    });
  }, [appearanceDraft, onPreview, themeDraft, zoomDraft]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "board":
        return (
          <BoardAndPiecesSettings
            appearance={appearanceDraft}
            theme={themeDraft}
            boardPresets={BOARD_PRESETS}
            piecePresets={PIECE_PRESETS}
            themePresets={THEME_PRESETS}
            onAppearanceChange={setAppearanceDraft}
            onThemeChange={setThemeDraft}
          />
        );
      case "gameplay":
        return <GameplaySettings zoom={zoomDraft} onZoomChange={setZoomDraft} />;
      case "profile":
        return <ProfileSettings />;
      case "accessibility":
      default:
        return <AccessibilitySettings />;
    }
  };

  return (
    <MainContentWindow className="chess-settings-view" ariaLabel="Chess settings">
      <header className="chess-settings-view__header">
        <h2>Settings</h2>
        <p>Choose your board and piece look, then save to apply.</p>
      </header>

      <LeftNavContentLayout
        items={SETTINGS_TAB_ITEMS}
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key as SettingsTabKey)}
        navAriaLabel="Settings categories"
        className="chess-main-layout chess-settings-view__body"
        navClassName="chess-main-layout__nav chess-settings-view__rail"
        wrapContent={false}
        renderContent={() => (
          <div className="chess-settings-view__content" role="tabpanel" aria-label={activeTabMeta.label}>
            <h3 className="chess-settings-view__content-title">{activeTabMeta.label}</h3>
            {renderTabContent()}
          </div>
        )}
      />

      <footer className="chess-settings-view__actions">
        <button type="button" className="chess-settings-btn chess-settings-btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="chess-settings-btn"
          onClick={() =>
            onSave({
              theme: themeDraft,
              boardZoom: zoomDraft,
              appearanceSettings: appearanceDraft,
            })
          }
        >
          Save
        </button>
      </footer>
    </MainContentWindow>
  );
}
