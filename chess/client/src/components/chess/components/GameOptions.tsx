import React from "react";
import "../styles/game-options.css";

export type PieceColorPreset = "classic" | "sapphire" | "emerald" | "ruby" | "gold";
export type GameMode = "vs-computer" | "vs-player" | "practice" | "online";

type GameOptionsProps = {
  gameMode: GameMode;
  computerLevel: number;
  computerLevelLocked: boolean;
  computerGameConfigured?: boolean;
  computerSetupRequired?: boolean;
  turn: "white" | "black";
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  onGameModeChange: (mode: GameMode) => void;
  onStartComputerGame: (color: "white" | "black") => void;
  onComputerLevelChange: (level: number) => void;
  onTurnChange: (turn: "white" | "black") => void;
  onCastlingChange: (rights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  }) => void;
};

export default function GameOptions({
  gameMode,
  computerLevel,
  computerLevelLocked,
  computerGameConfigured = false,
  computerSetupRequired = false,
  turn,
  castlingRights,
  onGameModeChange,
  onStartComputerGame,
  onComputerLevelChange,
  onTurnChange,
  onCastlingChange,
}: GameOptionsProps) {
  const isPractice = gameMode === "practice";
  const ratingOptions = Array.from({ length: 33 }, (_, i) => 300 + i * 100);

  const handleCastlingChange = (key: keyof typeof castlingRights, checked: boolean) => {
    onCastlingChange({
      ...castlingRights,
      [key]: checked,
    });
  };

  return (
    <div className="game-options">
      <div className="option-section">
        <h4>Play</h4>
        <div className="mode-radios">
          <label>
            <input
              type="radio"
              name="play-mode"
              value="vs-computer"
              checked={gameMode === "vs-computer"}
              onChange={() => onGameModeChange("vs-computer")}
            />
            Play Against Computer
          </label>
          <label>
            <input
              type="radio"
              name="play-mode"
              value="vs-player"
              checked={gameMode === "vs-player"}
              onChange={() => onGameModeChange("vs-player")}
            />
            Player vs Other Player
          </label>
          <label>
            <input
              type="radio"
              name="play-mode"
              value="practice"
              checked={gameMode === "practice"}
              onChange={() => onGameModeChange("practice")}
            />
            Practice
          </label>
          <label>
            <input
              type="radio"
              name="play-mode"
              value="online"
              checked={gameMode === "online"}
              onChange={() => onGameModeChange("online")}
            />
            Play Online
          </label>
        </div>
      </div>

      {gameMode === "vs-computer" && !computerGameConfigured && (
        <div className="option-section computer-options">
          <h4>Computer Game</h4>
          <div className="option-hint-box" role="status" aria-live="polite">
            Choose your level and color.
            {computerSetupRequired ? " Select Black or White to start." : ""}
          </div>
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
            <button type="button" className="mode-action-btn" onClick={() => onStartComputerGame("black")}>Black</button>
            <button type="button" className="mode-action-btn" onClick={() => onStartComputerGame("white")}>White</button>
          </div>
        </div>
      )}

      {gameMode === "online" && (
        <div className="option-section option-hint-box" role="status" aria-live="polite">
          Play Online is coming soon.
        </div>
      )}

      {isPractice && (
        <>
          <div className="option-section">
            <h4>Turn</h4>
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
          </div>

          <div className="option-section">
            <h4>Castling Rights</h4>
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
          </div>
        </>
      )}
    </div>
  );
}
