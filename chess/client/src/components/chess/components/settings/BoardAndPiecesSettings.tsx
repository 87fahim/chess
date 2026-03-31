import { type CSSProperties } from "react";
import type { ChessAppearanceSettings } from "../../Chess.types";
import type { BoardPreset, SettingsTheme, ThemePreset } from "./Settings.types";
import "./board-and-pieces-settings.css";

type BoardAndPiecesSettingsProps = {
  appearance: ChessAppearanceSettings;
  theme: SettingsTheme;
  boardPresets: BoardPreset[];
  piecePresets: ChessAppearanceSettings["whitePieceColor"][];
  themePresets: ThemePreset[];
  onAppearanceChange: (next: ChessAppearanceSettings) => void;
  onThemeChange: (next: SettingsTheme) => void;
};

export default function BoardAndPiecesSettings({
  appearance,
  theme,
  boardPresets,
  piecePresets,
  themePresets,
  onAppearanceChange,
  onThemeChange,
}: BoardAndPiecesSettingsProps) {
  const applyBoardPreset = (preset: BoardPreset) => {
    onAppearanceChange({
      ...appearance,
      lightSquareColor: preset.light,
      darkSquareColor: preset.dark,
    });
  };

  return (
    <>
      <section className="chess-settings-view__card">
        <h3>Board Presets</h3>
        <p className="chess-settings-view__hint">Pick a ready-made board style.</p>
        <div className="settings-board-pieces__preset-grid">
          {boardPresets.map((preset) => {
            const isActive =
              appearance.lightSquareColor.toLowerCase() === preset.light.toLowerCase()
              && appearance.darkSquareColor.toLowerCase() === preset.dark.toLowerCase();

            return (
              <button
                key={preset.name}
                type="button"
                className={`settings-board-pieces__preset ${isActive ? "is-active" : ""}`}
                onClick={() => applyBoardPreset(preset)}
              >
                <span
                  className="settings-board-pieces__preset-swatch"
                  style={{ "--preset-light": preset.light, "--preset-dark": preset.dark } as CSSProperties}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="chess-settings-view__card">
        <h3>Custom Board Colors</h3>
        <div className="settings-board-pieces__field-stack">
          <label className="settings-board-pieces__row-control">
            <span>Light Squares</span>
            <input
              type="color"
              value={appearance.lightSquareColor}
              onChange={(event) =>
                onAppearanceChange({
                  ...appearance,
                  lightSquareColor: event.target.value,
                })
              }
            />
          </label>

          <label className="settings-board-pieces__row-control">
            <span>Dark Squares</span>
            <input
              type="color"
              value={appearance.darkSquareColor}
              onChange={(event) =>
                onAppearanceChange({
                  ...appearance,
                  darkSquareColor: event.target.value,
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="chess-settings-view__card">
        <h3>Piece Colors</h3>
        <div className="settings-board-pieces__field-stack">
          <label className="settings-board-pieces__row-control">
            <span>White Pieces</span>
            <select
              value={appearance.whitePieceColor}
              onChange={(event) =>
                onAppearanceChange({
                  ...appearance,
                  whitePieceColor: event.target.value as ChessAppearanceSettings["whitePieceColor"],
                })
              }
            >
              {piecePresets.map((preset) => (
                <option key={`white-${preset}`} value={preset}>
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-board-pieces__row-control">
            <span>Black Pieces</span>
            <select
              value={appearance.blackPieceColor}
              onChange={(event) =>
                onAppearanceChange({
                  ...appearance,
                  blackPieceColor: event.target.value as ChessAppearanceSettings["blackPieceColor"],
                })
              }
            >
              {piecePresets.map((preset) => (
                <option key={`black-${preset}`} value={preset}>
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="chess-settings-view__card">
        <h3>App Theme</h3>
        <div className="settings-board-pieces__field-stack">
          {themePresets.map((themeOption) => (
            <button
              key={themeOption.key}
              type="button"
              className={`settings-board-pieces__theme-preset ${theme === themeOption.key ? "is-active" : ""}`}
              onClick={() => onThemeChange(themeOption.key)}
            >
              <span>{themeOption.name}</span>
              <span
                className="settings-board-pieces__theme-preset-swatch"
                style={{ "--theme-light": themeOption.light, "--theme-dark": themeOption.dark } as CSSProperties}
              />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
