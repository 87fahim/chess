import { useChessPanelActions, useChessPanelState } from "../context/ChessPanelContext";

export default function Controls() {
  const {
    freeStyle,
    allowUndo,
    allowReset,
    allowFlip,
    allowClearAll,
    moveCount,
    showMoveList,
    nextMoveLoading,
    nextMoveDisabled,
    nextMoveDisabledReason,
    suggestedMoveText,
    nextMoveError,
    canRequestNextMove,
    canApplySuggestedMove,
  } = useChessPanelState();
  const {
    onUndo,
    onReset,
    onFlip,
    onClearAll,
    onNextMove,
    onApplySuggestedMove,
    onOpenMoves,
    onOpenSettings,
  } = useChessPanelActions();

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
      {canRequestNextMove && (
        <button
          className="control-btn"
          onClick={onNextMove}
          title={nextMoveDisabledReason ?? "Calculate best move from current position"}
          disabled={nextMoveDisabled}
        >
          {nextMoveLoading ? "⌛ Thinking..." : "▶ Next Move"}
        </button>
      )}
      {suggestedMoveText && canApplySuggestedMove && (
        <div className="suggested-move-row">
          <span className="suggested-move-label">Suggestion:</span>
          <button className="suggested-move-link" onClick={onApplySuggestedMove} title="Apply suggested move">
            {suggestedMoveText}
          </button>
        </div>
      )}
      {nextMoveError && <div className="next-move-error">{nextMoveError}</div>}
      {showMoveList && (
        <button className="control-btn" onClick={onOpenMoves} title="View move history">
          ☰ Moves ({moveCount})
        </button>
      )}
      <button className="control-btn" onClick={onOpenSettings} title="Open settings">
        ⚙ Settings
      </button>
    </div>
  );
}

