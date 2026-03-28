import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChessProps, BoardOrientation } from "./Chess.types";
import ChessBoard from "./components/ChessBoard";
import Controls from "./components/Controls";
import MoveList from "./components/MoveList";
import GameStatus from "./components/GameStatus";
import GameOptions, { PieceColorPreset } from "./components/GameOptions";
import { PieceCode } from "./components/Piece";
import useChessGame from "./hooks/useChessGame";
import "./styles/chess.css";
import "./styles/board.css";
import "./styles/piece.css";
import "./styles/controls.css";
import "./styles/status.css";
import "./styles/fen.css";
import "./styles/game-options.css";

export default function Chess({ initialFen = "start", orientation = "white", showCoordinates = true, showMoveList = true, allowUndo = true, allowReset = true, allowFlip = true, showGameOptions = true, interactive = true, onMove, onGameEnd, className = "", }: ChessProps) {
  const [currentOrientation, setCurrentOrientation] = useState<BoardOrientation>(orientation);
  const [lightSquareColor, setLightSquareColor] = useState("#f0e6d2");
  const [darkSquareColor, setDarkSquareColor] = useState("#b58863");
  const [whitePieceColor, setWhitePieceColor] = useState<PieceColorPreset>("classic");
  const [blackPieceColor, setBlackPieceColor] = useState<PieceColorPreset>("classic");
  const [showMovePopup, setShowMovePopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [nextMoveLoading, setNextMoveLoading] = useState(false);
  const [nextMoveError, setNextMoveError] = useState<string | null>(null);
  const [suggestedMove, setSuggestedMove] = useState<{ uci: string; text: string } | null>(null);
  const [animatedEngineMove, setAnimatedEngineMove] = useState<{
    from: string;
    to: string;
    piece: PieceCode;
    token: number;
  } | null>(null);
  const game = useChessGame({ initialFen, orientation: currentOrientation, onMove, onGameEnd });

  const flip = () => {
    setCurrentOrientation(prev => prev === "white" ? "black" : "white");
  };

  const boardStyle = {
    "--square-light": lightSquareColor,
    "--square-dark": darkSquareColor,
  } as CSSProperties;

  useEffect(() => {
    setSuggestedMove(null);
    setNextMoveError(null);
  }, [game.fen]);

  const nextMoveDisabledReason = useMemo(() => {
    if (!game.freeStyle) {
      return "Enable Free Style to use Next Move.";
    }
    if (!game.freeStyleValidation.isValid) {
      return game.freeStyleValidation.errors[0] ?? "Invalid board setup.";
    }
    return undefined;
  }, [game.freeStyle, game.freeStyleValidation.errors, game.freeStyleValidation.isValid]);

  const requestNextMove = async () => {
    if (!game.freeStyle || !game.freeStyleValidation.isValid || nextMoveLoading) {
      return;
    }

    setNextMoveLoading(true);
    setNextMoveError(null);

    try {
      const response = await fetch("/api/chess/next-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fen: game.fen, movetime: 2500, depth: 22 }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to calculate next move.");
      }

      const uci = String(data.bestMoveUci || "").trim();
      if (!uci) {
        throw new Error("Engine returned an empty move.");
      }

      const text = typeof data.bestMoveText === "string" && data.bestMoveText
        ? data.bestMoveText
        : `${uci.slice(0, 2)}-${uci.slice(2, 4)}`;

      setSuggestedMove({ uci, text });
    } catch (err) {
      setSuggestedMove(null);
      setNextMoveError(err instanceof Error ? err.message : "Failed to calculate next move.");
    } finally {
      setNextMoveLoading(false);
    }
  };

  const applySuggestedMove = () => {
    if (!suggestedMove) {
      return;
    }

    const uci = suggestedMove.uci.trim().toLowerCase();
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) {
      setNextMoveError("Suggested move format is invalid.");
      return;
    }

    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const fromCol = from.charCodeAt(0) - 97;
    const fromRow = 8 - Number(from[1]);
    const movingPiece = game.board[fromRow]?.[fromCol] as PieceCode | undefined;

    if (movingPiece) {
      setAnimatedEngineMove({ from, to, piece: movingPiece, token: Date.now() });
    }

    const ok = game.applySuggestedMove(suggestedMove.uci);
    if (!ok) {
      setAnimatedEngineMove(null);
      setNextMoveError("Could not apply suggested move to the current position.");
      return;
    }

    setSuggestedMove(null);
    setNextMoveError(null);
  };

  return (
    <div className={["chess-wrapper", `white-piece-${whitePieceColor}`, `black-piece-${blackPieceColor}`, className].join(" ")} style={boardStyle}>
      <GameStatus status={game.status} turn={game.turn} />
      <div className="chess-main-content">
        <ChessBoard
          board={game.board}
          orientation={currentOrientation}
          freeStyle={game.freeStyle}
          selectedSquare={game.selectedSquare}
          validMoves={game.validMoves}
          lastMove={game.lastMove}
          onSquareClick={game.onSquareClick}
          showCoordinates={showCoordinates}
          interactive={interactive}
          whitePieces={game.whitePieces}
          blackPieces={game.blackPieces}
          onDragStart={game.onDragStart}
          onDrop={game.onDrop}
          onDropOutside={game.onDropOutside}
          animatedMove={animatedEngineMove ?? undefined}
          onAnimatedMoveEnd={() => setAnimatedEngineMove(null)}
        />
        <div className="chess-side-panel">
          {showGameOptions && (
            <GameOptions
              freeStyle={game.freeStyle}
              turn={game.turn}
              castlingRights={game.castlingRights}
              onFreeStyleChange={game.setFreeStyleMode}
              onTurnChange={game.setTurn}
              onCastlingChange={game.setCastlingRights}
            />
          )}
          <Controls
            onUndo={game.undo}
            onReset={game.reset}
            onFlip={flip}
            onClearAll={game.clearAllPieces}
            onNextMove={requestNextMove}
            freeStyle={game.freeStyle}
            allowUndo={allowUndo}
            allowReset={allowReset}
            allowFlip={allowFlip}
            allowClearAll={showGameOptions && game.freeStyle}
            nextMoveLoading={nextMoveLoading}
            nextMoveDisabled={!game.freeStyle || !game.freeStyleValidation.isValid || nextMoveLoading}
            nextMoveDisabledReason={nextMoveDisabledReason}
            suggestedMoveText={suggestedMove?.text}
            onApplySuggestedMove={suggestedMove ? applySuggestedMove : undefined}
            nextMoveError={nextMoveError ?? undefined}
            moveCount={game.moveHistory.length}
            onOpenMoves={showMoveList ? () => setShowMovePopup(true) : undefined}
            onOpenSettings={() => setShowSettingsPopup(true)}
          />
        </div>
      </div>
      <div className="fen-display-container">
        <div className="fen-content">
          <input type="text" value={game.fen} readOnly className="fen-input" />
          <button 
            className="copy-btn" 
            onClick={() => navigator.clipboard.writeText(game.fen)}
            title="Copy FEN to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      {showMoveList && (
        <MoveList
          moves={game.moveHistory}
          isOpen={showMovePopup}
          onClose={() => setShowMovePopup(false)}
        />
      )}

      {showSettingsPopup && (
        <div className="move-popup-backdrop" onClick={() => setShowSettingsPopup(false)}>
          <div className="move-popup settings-popup" onClick={(e) => e.stopPropagation()}>
            <div className="move-popup-header">
              <strong>Settings</strong>
            </div>
            <div className="settings-popup-body">
              <div className="option-section">
                <h4>Board Colors</h4>
                <div className="color-grid">
                  <label className="color-control">
                    <span>Light</span>
                    <input
                      type="color"
                      value={lightSquareColor}
                      onChange={(e) => setLightSquareColor(e.target.value)}
                      aria-label="Light square color"
                    />
                  </label>
                  <label className="color-control">
                    <span>Dark</span>
                    <input
                      type="color"
                      value={darkSquareColor}
                      onChange={(e) => setDarkSquareColor(e.target.value)}
                      aria-label="Dark square color"
                    />
                  </label>
                </div>
              </div>
              <div className="option-section">
                <h4>Piece Colors</h4>
                <div className="piece-color-selectors">
                  <label className="piece-color-control">
                    <span>White</span>
                    <select value={whitePieceColor} onChange={(e) => setWhitePieceColor(e.target.value as PieceColorPreset)}>
                      <option value="classic">Classic</option>
                      <option value="sapphire">Sapphire</option>
                      <option value="emerald">Emerald</option>
                      <option value="ruby">Ruby</option>
                      <option value="gold">Gold</option>
                    </select>
                  </label>
                  <label className="piece-color-control">
                    <span>Black</span>
                    <select value={blackPieceColor} onChange={(e) => setBlackPieceColor(e.target.value as PieceColorPreset)}>
                      <option value="classic">Classic</option>
                      <option value="sapphire">Sapphire</option>
                      <option value="emerald">Emerald</option>
                      <option value="ruby">Ruby</option>
                      <option value="gold">Gold</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
