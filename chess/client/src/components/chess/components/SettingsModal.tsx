import { PieceColorPreset } from "./GameOptions";
import {
  SquarePatternPreset,
  useChessDisplayActions,
  useChessDisplayState,
} from "../context/ChessDisplayContext";

export default function SettingsModal() {
  const {
    showSettingsPopup,
    lightSquareColor,
    darkSquareColor,
    whitePieceColor,
    blackPieceColor,
    squarePattern,
    squarePatternOpacity,
  } = useChessDisplayState();
  const {
    closeSettingsPopup,
    setLightSquareColor,
    setDarkSquareColor,
    setWhitePieceColor,
    setBlackPieceColor,
    setSquarePattern,
    setSquarePatternOpacity,
  } = useChessDisplayActions();

  if (!showSettingsPopup) {
    return null;
  }

  return (
    <div className="move-popup-backdrop" onClick={closeSettingsPopup}>
      <div className="move-popup settings-popup" onClick={(e) => e.stopPropagation()}>
        <div className="move-popup-header">
          <strong>Settings</strong>
        </div>
        <div className="settings-popup-body">
          <div className="option-section">
            <h4>Board Colors</h4>
            <div className="color-grid">
              <label className="color-control">
                <span>Light</span>
                <input
                  type="color"
                  value={lightSquareColor}
                  onChange={(e) => setLightSquareColor(e.target.value)}
                  aria-label="Light square color"
                />
              </label>
              <label className="color-control">
                <span>Dark</span>
                <input
                  type="color"
                  value={darkSquareColor}
                  onChange={(e) => setDarkSquareColor(e.target.value)}
                  aria-label="Dark square color"
                />
              </label>
            </div>
          </div>

          <div className="option-section">
            <h4>Piece Colors</h4>
            <div className="piece-color-selectors">
              <label className="piece-color-control">
                <span>White</span>
                <select value={whitePieceColor} onChange={(e) => setWhitePieceColor(e.target.value as PieceColorPreset)}>
                  <option value="classic">Classic</option>
                  <option value="sapphire">Sapphire</option>
                  <option value="emerald">Emerald</option>
                  <option value="ruby">Ruby</option>
                  <option value="gold">Gold</option>
                </select>
              </label>
              <label className="piece-color-control">
                <span>Black</span>
                <select value={blackPieceColor} onChange={(e) => setBlackPieceColor(e.target.value as PieceColorPreset)}>
                  <option value="classic">Classic</option>
                  <option value="sapphire">Sapphire</option>
                  <option value="emerald">Emerald</option>
                  <option value="ruby">Ruby</option>
                  <option value="gold">Gold</option>
                </select>
              </label>
            </div>
          </div>

          <div className="option-section">
            <h4>Square Pattern</h4>
            <div className="piece-color-selectors">
              <label className="piece-color-control">
                <span>Preset</span>
                <select
                  value={squarePattern}
                  onChange={(e) => setSquarePattern(e.target.value as SquarePatternPreset)}
                >
                  <option value="none">None</option>
                  <option value="classic">Classic Chess Board</option>
                  <option value="soft">Soft Grid</option>
                  <option value="premium">Premium Gold</option>
                  <option value="three-d">3D Tiles</option>
                  <option value="strip">Title Strip</option>
                </select>
              </label>
              <label className="pattern-opacity-control">
                <span>Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={squarePatternOpacity}
                  onChange={(e) => setSquarePatternOpacity(Number(e.target.value))}
                  aria-label="Square pattern opacity"
                />
                <output>{Math.round(squarePatternOpacity * 100)}%</output>
              </label>
              <div className="square-pattern-preview-wrap">
                <div className="square-pattern-preview light" />
                <div className="square-pattern-preview dark" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
