import "./gameplay-settings.css";
import ChessButton from "../shared/ChessButton";
import ChessSection from "../shared/ChessSection";

type GameplaySettingsProps = {
  zoom: number;
  onZoomChange: (next: number) => void;
};

export default function GameplaySettings({ zoom, onZoomChange }: GameplaySettingsProps) {
  const decreaseZoom = () => onZoomChange(Math.max(0.7, Number((zoom - 0.1).toFixed(2))));
  const increaseZoom = () => onZoomChange(Math.min(1.6, Number((zoom + 0.1).toFixed(2))));
  const resetZoom = () => onZoomChange(1);

  return (
    <ChessSection
      className="chess-settings-view__card"
      title="Board Zoom"
      hint="Increase or reduce board size without affecting layout."
      hintClassName="chess-settings-view__hint chess-section__hint"
    >

      <div className="settings-gameplay__zoom-row">
        <ChessButton variant="chip" onClick={decreaseZoom}>
          -
        </ChessButton>
        <span className="settings-gameplay__zoom-value">{Math.round(zoom * 100)}%</span>
        <ChessButton variant="chip" onClick={increaseZoom}>
          +
        </ChessButton>
        <ChessButton variant="chip" onClick={resetZoom}>
          Reset
        </ChessButton>
      </div>

      <input
        className="settings-gameplay__zoom-slider"
        type="range"
        min="0.7"
        max="1.6"
        step="0.05"
        value={zoom}
        onChange={(event) => onZoomChange(Number(event.target.value))}
        aria-label="Board zoom"
      />
    </ChessSection>
  );
}
