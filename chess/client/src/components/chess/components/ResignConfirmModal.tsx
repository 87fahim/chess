type ResignConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ResignConfirmModal({ open, onConfirm, onCancel }: ResignConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="game-over-backdrop" onClick={(e) => e.stopPropagation()}>
      <div className="game-over-modal resign-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm resign">
        <h3 className="game-over-title">Confirm Resign</h3>
        <p className="game-over-subtitle">Are you sure you want to resign this game?</p>
        <div className="game-over-actions">
          <button className="control-btn" onClick={onConfirm}>Yes, Resign</button>
          <button className="control-btn" onClick={onCancel}>No, Continue</button>
        </div>
      </div>
    </div>
  );
}
