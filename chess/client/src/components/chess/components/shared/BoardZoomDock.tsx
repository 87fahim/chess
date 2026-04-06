import ChessButton from "./ChessButton";
import ChessSurface from "./ChessSurface";

type BoardZoomDockProps = {
  zoom: number;
  canZoomOut: boolean;
  canZoomIn: boolean;
  disabled?: boolean;
  onZoomStep: (delta: number) => void;
};

export default function BoardZoomDock({
  zoom,
  canZoomOut,
  canZoomIn,
  disabled = false,
  onZoomStep,
}: BoardZoomDockProps) {
  return (
    <ChessSurface className="board-zoom-surface" aria-label="Board zoom controls">
      <ChessButton
        variant="chip"
        align="center"
        className="board-zoom-btn"
        onClick={() => onZoomStep(-0.1)}
        disabled={disabled || !canZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        -
      </ChessButton>
      <span className="board-zoom-value">{Math.round(zoom * 100)}%</span>
      <ChessButton
        variant="chip"
        align="center"
        className="board-zoom-btn"
        onClick={() => onZoomStep(0.1)}
        disabled={disabled || !canZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </ChessButton>
    </ChessSurface>
  );
}