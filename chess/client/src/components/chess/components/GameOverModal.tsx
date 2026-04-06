import { RefObject } from "react";
import ChessOverlayModal from "./shared/ChessOverlayModal";
import ChessButton from "./shared/ChessButton";

type GameOverModalProps = {
  open: boolean;
  winner: "white" | "black";
  reason: "checkmate" | "resign";
  winnerName: string;
  loserName: string;
  modalRef: RefObject<HTMLDivElement>;
  modalPos?: { x: number; y: number } | null;
  onDragStart: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onRematch: () => void;
  onSwitchSide: () => void;
};

export default function GameOverModal({
  open,
  winner,
  reason,
  winnerName,
  loserName,
  modalRef,
  modalPos,
  onDragStart,
  onClose,
  onRematch,
  onSwitchSide,
}: GameOverModalProps) {
  return (
    <ChessOverlayModal
      open={open}
      ariaLabel="Game over"
      surfaceRef={modalRef}
      surfaceStyle={modalPos ? { position: "fixed", left: modalPos.x, top: modalPos.y } : undefined}
      onBackdropClick={(e) => e.stopPropagation()}
    >
      <div className="game-over-drag-handle" onMouseDown={onDragStart} title="Drag popup" />
      <button className="game-over-close" onClick={onClose} aria-label="Close game over popup">x</button>
      <h3 className="game-over-title">{winner === "white" ? "White Won" : "Black Won"}</h3>
      <p className="game-over-subtitle">{reason === "checkmate" ? "by checkmate" : "by resign"}</p>

      <div className="game-over-result-list">
        <div className="game-over-result-row win">
          <span className="name">{winnerName}</span>
          <span className="tag">WIN</span>
        </div>
        <div className="game-over-result-row lose">
          <span className="name">{loserName}</span>
          <span className="tag">LOSE</span>
        </div>
      </div>

      <div className="game-over-actions">
        <ChessButton variant="panel" onClick={onRematch}>Rematch</ChessButton>
        <ChessButton variant="panel" onClick={onSwitchSide}>Switch Side</ChessButton>
      </div>
    </ChessOverlayModal>
  );
}
