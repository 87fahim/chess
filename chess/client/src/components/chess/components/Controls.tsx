type ControlsProps = {
  onUndo: () => void;
  onReset: () => void;
  onFlip: () => void;
  onClearAll: () => void;
  onNextMove?: () => void;
  freeStyle?: boolean;
  allowUndo?: boolean;
  allowReset?: boolean;
  allowFlip?: boolean;
  allowClearAll?: boolean;
  moveCount?: number;
  onOpenMoves?: () => void;
  onOpenSettings?: () => void;
  nextMoveLoading?: boolean;
  nextMoveDisabled?: boolean;
  nextMoveDisabledReason?: string;
  suggestedMoveText?: string;
  onApplySuggestedMove?: () => void;
  nextMoveError?: string;
};

export default function Controls({ onUndo, onReset, onFlip, onClearAll, onNextMove, freeStyle = true, allowUndo = true, allowReset = true, allowFlip = true, allowClearAll = true, moveCount, onOpenMoves, onOpenSettings, nextMoveLoading = false, nextMoveDisabled = false, nextMoveDisabledReason, suggestedMoveText, onApplySuggestedMove, nextMoveError }: ControlsProps) {
  return (
    <div className="controls">
      {allowUndo && (
        <button
          className="control-btn"
          onClick={onUndo}
          title={freeStyle ? "Undo last move" : "Undo disabled when Free Style is off"}
          disabled={!freeStyle}
        >
          ↶ Undo Move
        </button>
      )}
      {allowReset && (
        <button className="control-btn" onClick={onReset} title={freeStyle ? "Reset game" : "Resign game"}>
          ⟲ {freeStyle ? "Reset Board" : "Resign"}
        </button>
      )}
      {allowFlip && (
        <button className="control-btn" onClick={onFlip} title="Flip board">
          ↑↓ Flip Board
        </button>
      )}
      {allowClearAll && (
        <button className="control-btn clear-all-btn" onClick={onClearAll} title="Clear all pieces except kings">
          🗙 Clear Baord
        </button>
      )}
      {onNextMove !== undefined && (
        <button
          className="control-btn"
          onClick={onNextMove}
          title={nextMoveDisabledReason ?? "Calculate best move from current position"}
          disabled={nextMoveDisabled}
        >
          {nextMoveLoading ? "⌛ Thinking..." : "▶ Next Move"}
        </button>
      )}
      {suggestedMoveText && onApplySuggestedMove && (
        <div className="suggested-move-row">
          <span className="suggested-move-label">Suggestion:</span>
          <button className="suggested-move-link" onClick={onApplySuggestedMove} title="Apply suggested move">
            {suggestedMoveText}
          </button>
        </div>
      )}
      {nextMoveError && <div className="next-move-error">{nextMoveError}</div>}
      {onOpenMoves !== undefined && (
        <button className="control-btn" onClick={onOpenMoves} title="View move history">
          ☰ Moves ({moveCount ?? 0})
        </button>
      )}
      {onOpenSettings !== undefined && (
        <button className="control-btn" onClick={onOpenSettings} title="Open settings">
          ⚙ Settings
        </button>
      )}
    </div>
  );
}

