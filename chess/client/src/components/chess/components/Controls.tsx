import { useChessPanelActions, useChessPanelState } from "../context/ChessPanelContext";
import ChessButton from "./shared/ChessButton";

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
  } = useChessPanelActions();

  return (
    <div className="controls">
      {allowUndo && (
        <ChessButton
          variant="text"
          onClick={onUndo}
          title={freeStyle ? "Undo last move" : "Undo disabled when Free Style is off"}
          disabled={!freeStyle}
        >
          ↶ Undo Move
        </ChessButton>
      )}
      {allowReset && (
        <ChessButton variant="text" onClick={onReset} title={freeStyle ? "Reset game" : "Resign game"}>
          ⟲ {freeStyle ? "Reset Board" : "Resign"}
        </ChessButton>
      )}
      {allowFlip && (
        <ChessButton variant="text" onClick={onFlip} title="Flip board">
          ↑↓ Flip Board
        </ChessButton>
      )}
      {allowClearAll && (
        <ChessButton variant="text" onClick={onClearAll} title="Clear all pieces except kings">
          🗙 Clear Board
        </ChessButton>
      )}
      {canRequestNextMove && (
        <ChessButton
          variant="text"
          onClick={onNextMove}
          title={nextMoveDisabledReason ?? "Calculate best move from current position"}
          disabled={nextMoveDisabled}
        >
          {nextMoveLoading ? "⌛ Thinking..." : "▶ Next Move"}
        </ChessButton>
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
        <ChessButton variant="text" onClick={onOpenMoves} title="View move history">
          ☰ Moves ({moveCount})
        </ChessButton>
      )}
    </div>
  );
}

