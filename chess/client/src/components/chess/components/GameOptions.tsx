import React from "react";
import "../styles/game-options.css";

export type PieceColorPreset = "classic" | "sapphire" | "emerald" | "ruby" | "gold";

type GameOptionsProps = {
  freeStyle: boolean;
  turn: "white" | "black";
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  onFreeStyleChange: (enabled: boolean) => void;
  onTurnChange: (turn: "white" | "black") => void;
  onCastlingChange: (rights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  }) => void;
};

export default function GameOptions({
  freeStyle,
  turn,
  castlingRights,
  onFreeStyleChange,
  onTurnChange,
  onCastlingChange,
}: GameOptionsProps) {
  const handleCastlingChange = (key: keyof typeof castlingRights, checked: boolean) => {
    onCastlingChange({
      ...castlingRights,
      [key]: checked,
    });
  };

  return (
    <div className="game-options">
      <div className="mode-turn-row">
        <div className="option-section">
          <h4>Mode</h4>
          <div className="mode-radios">
            <label>
              <input
                type="radio"
                name="mode"
                value="freestyle"
                checked={freeStyle}
                onChange={() => onFreeStyleChange(true)}
              />
              Free Style
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="normal"
                checked={!freeStyle}
                onChange={() => onFreeStyleChange(false)}
              />
              Normal
            </label>
          </div>
        </div>

        <div className="option-section">
          <h4>Turn</h4>
          <div className={`turn-radios${!freeStyle ? " option-group-disabled" : ""}`}>
          <label>
            <input
              type="radio"
              name="turn"
              value="white"
              checked={turn === "white"}
              disabled={!freeStyle}
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
              disabled={!freeStyle}
              onChange={() => onTurnChange("black")}
            />
            Black
          </label>
          </div>
        </div>
      </div>

      <div className="option-section">
        <h4>Castling Rights</h4>
        <div className={`castling-checkboxes${!freeStyle ? " option-group-disabled" : ""}`}>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.whiteKingSide}
              disabled={!freeStyle}
              onChange={(e) => handleCastlingChange("whiteKingSide", e.target.checked)}
            />
            White O-O
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.whiteQueenSide}
              disabled={!freeStyle}
              onChange={(e) => handleCastlingChange("whiteQueenSide", e.target.checked)}
            />
            White O-O-O
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.blackKingSide}
              disabled={!freeStyle}
              onChange={(e) => handleCastlingChange("blackKingSide", e.target.checked)}
            />
            Black O-O
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.blackQueenSide}
              disabled={!freeStyle}
              onChange={(e) => handleCastlingChange("blackQueenSide", e.target.checked)}
            />
            Black O-O-O
          </label>
        </div>
      </div>
    </div>
  );
}
