import "./gameplay-settings.css";

type GameplaySettingsProps = {
  zoom: number;
  onZoomChange: (next: number) => void;
};

export default function GameplaySettings({ zoom, onZoomChange }: GameplaySettingsProps) {
  const decreaseZoom = () => onZoomChange(Math.max(0.7, Number((zoom - 0.1).toFixed(2))));
  const increaseZoom = () => onZoomChange(Math.min(1.6, Number((zoom + 0.1).toFixed(2))));
  const resetZoom = () => onZoomChange(1);

  return (
    <section className="chess-settings-view__card">
      <h3>Board Zoom</h3>
      <p className="chess-settings-view__hint">Increase or reduce board size without affecting layout.</p>

      <div className="settings-gameplay__zoom-row">
        <button type="button" className="chess-settings-chip" onClick={decreaseZoom}>
          -
        </button>
        <span className="settings-gameplay__zoom-value">{Math.round(zoom * 100)}%</span>
        <button type="button" className="chess-settings-chip" onClick={increaseZoom}>
          +
        </button>
        <button type="button" className="chess-settings-chip" onClick={resetZoom}>
          Reset
        </button>
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
    </section>
  );
}
