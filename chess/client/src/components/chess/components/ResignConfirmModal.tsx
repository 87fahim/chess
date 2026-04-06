import ChessOverlayModal from "./shared/ChessOverlayModal";
import ChessButton from "./shared/ChessButton";

type ResignConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ResignConfirmModal({ open, onConfirm, onCancel }: ResignConfirmModalProps) {
  return (
    <ChessOverlayModal
      open={open}
      ariaLabel="Confirm resign"
      surfaceClassName="game-over-modal resign-confirm-modal"
      onBackdropClick={(e) => e.stopPropagation()}
    >
      <h3 className="game-over-title">Confirm Resign</h3>
      <p className="game-over-subtitle">Are you sure you want to resign this game?</p>
      <div className="game-over-actions">
        <ChessButton variant="panel" onClick={onConfirm}>Yes, Resign</ChessButton>
        <ChessButton variant="panel" onClick={onCancel}>No, Continue</ChessButton>
      </div>
    </ChessOverlayModal>
  );
}
