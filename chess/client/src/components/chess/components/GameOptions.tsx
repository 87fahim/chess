import "../styles/game-options.css";
import { useChessPanelActions, useChessPanelState } from "../context/ChessPanelContext";
import { GameMode } from "../context/chessPanel.types";
import ChessButton from "./shared/ChessButton";
import ChessSection from "./shared/ChessSection";

export type PieceColorPreset = "classic" | "sapphire" | "emerald" | "ruby" | "gold";
export type { GameMode };

export default function GameOptions() {
  const {
    gameMode,
    computerLevel,
    computerLevelLocked,
    computerGameConfigured,
    computerSetupRequired,
    turn,
    castlingRights,
  } = useChessPanelState();
  const {
    onGameModeChange,
    onStartComputerGame,
    onComputerLevelChange,
    onTurnChange,
    onCastlingChange,
  } = useChessPanelActions();

  const isPractice = gameMode === "practice";
  const ratingOptions = Array.from({ length: 33 }, (_, i) => 300 + i * 100);

  const handleQuickStartComputer = () => {
    const randomColor: "white" | "black" = Math.random() < 0.5 ? "white" : "black";
    onStartComputerGame(randomColor);
  };

  const handleCastlingChange = (key: keyof typeof castlingRights, checked: boolean) => {
    onCastlingChange({
      ...castlingRights,
      [key]: checked,
    });
  };

  return (
    <div className="game-options">
      <ChessSection className="option-section" title="Play" titleAs="h4" titleClassName="option-section__title">
        <div className="play-mode-buttons" role="group" aria-label="Play mode">
          <ChessButton variant="panel" active={gameMode === "vs-computer"} fullWidth onClick={handleQuickStartComputer}>
            VS Computer
          </ChessButton>
          <ChessButton variant="panel" active={gameMode === "vs-player"} fullWidth onClick={() => onGameModeChange("vs-player")}>
            VS Player
          </ChessButton>
          <ChessButton variant="panel" active={gameMode === "practice"} fullWidth onClick={() => onGameModeChange("practice")}>
            Practice
          </ChessButton>
          <ChessButton variant="panel" active={gameMode === "online"} fullWidth onClick={() => onGameModeChange("online")}>
            Online
          </ChessButton>
        </div>
      </ChessSection>

      {gameMode === "vs-computer" && !computerGameConfigured && (
        <ChessSection
          className="option-section computer-options"
          title="Computer Game"
          titleAs="h4"
          titleClassName="option-section__title"
          hint={
            <span className="option-hint-box" role="status" aria-live="polite">
            Choose your level and color.
            {computerSetupRequired ? " Select Black or White to start." : ""}
            </span>
          }
        >
          <div className={`level-slider-wrap${computerLevelLocked ? " option-group-disabled" : ""}`}>
            <select
              id="computer-level"
              value={computerLevel}
              disabled={computerLevelLocked}
              onChange={(e) => onComputerLevelChange(Number(e.target.value))}
            >
              {ratingOptions.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
            <div className="level-slider-meta">
              <span>300 Random</span>
              <span>3500 Unbeatable</span>
            </div>
            {computerLevelLocked && <small className="level-lock-hint">Level is locked after game start.</small>}
          </div>
          <div className="new-game-row">
            <ChessButton variant="panel" align="center" onClick={() => onStartComputerGame("black")}>Black</ChessButton>
            <ChessButton variant="panel" align="center" onClick={() => onStartComputerGame("white")}>White</ChessButton>
          </div>
        </ChessSection>
      )}

      {gameMode === "online" && (
        <div className="option-section option-hint-box" role="status" aria-live="polite">
          Play Online is coming soon.
        </div>
      )}

      {isPractice && (
        <>
          <ChessSection className="option-section" title="Turn" titleAs="h4" titleClassName="option-section__title">
            <div className="turn-radios">
              <label>
                <input
                  type="radio"
                  name="turn"
                  value="white"
                  checked={turn === "white"}
                  onChange={() => onTurnChange("white")}
                />
                White
              </label>
              <label>
                <input
                  type="radio"
                  name="turn"
                  value="black"
                  checked={turn === "black"}
                  onChange={() => onTurnChange("black")}
                />
                Black
              </label>
            </div>
          </ChessSection>

          <ChessSection className="option-section" title="Castling Rights" titleAs="h4" titleClassName="option-section__title">
            <div className="castling-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={castlingRights.whiteKingSide}
                  onChange={(e) => handleCastlingChange("whiteKingSide", e.target.checked)}
                />
                White O-O
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={castlingRights.whiteQueenSide}
                  onChange={(e) => handleCastlingChange("whiteQueenSide", e.target.checked)}
                />
                White O-O-O
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={castlingRights.blackKingSide}
                  onChange={(e) => handleCastlingChange("blackKingSide", e.target.checked)}
                />
                Black O-O
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={castlingRights.blackQueenSide}
                  onChange={(e) => handleCastlingChange("blackQueenSide", e.target.checked)}
                />
                Black O-O-O
              </label>
            </div>
          </ChessSection>
        </>
      )}
    </div>
  );
}
