import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Chess as ChessJs } from "chess.js";
import { ChessProps, BoardOrientation } from "./Chess.types";
import ChessBoard from "./components/ChessBoard";
import Controls from "./components/Controls";
import MoveList from "./components/MoveList";
import GameStatus from "./components/GameStatus";
import GameOptions, { GameMode, PieceColorPreset } from "./components/GameOptions";
import { PieceCode } from "./components/Piece";
import useChessGame from "./hooks/useChessGame";
import useAuth from "../../hooks/userAuth";
import "./styles/chess.css";
import "./styles/board.css";
import "./styles/piece.css";
import "./styles/controls.css";
import "./styles/status.css";
import "./styles/fen.css";
import "./styles/game-options.css";

type SquarePatternPreset = "none" | "classic" | "soft" | "premium" | "three-d" | "strip";
type PlayerBadge = {
  name: string;
  avatarUrl?: string;
  isComputer?: boolean;
  color: "white" | "black";
};

type CapturedSummary = {
  byWhite: string[];
  byBlack: string[];
  whiteAdvantage: number;
  blackAdvantage: number;
};

type GameOverState = {
  winner: "white" | "black";
  reason: "checkmate" | "resign";
  open: boolean;
  locked: boolean;
};

export default function Chess({ initialFen = "start", orientation = "white", showCoordinates = true, showMoveList = true, allowUndo = true, allowReset = true, allowFlip = true, showGameOptions = true, interactive = true, onMove, onGameEnd, className = "", }: ChessProps) {
  const auth = useAuth() as any;
  const loggedInUser = auth?.user ?? null;
  const [currentOrientation, setCurrentOrientation] = useState<BoardOrientation>(orientation);
  const [lightSquareColor, setLightSquareColor] = useState("#f0e6d2");
  const [darkSquareColor, setDarkSquareColor] = useState("#b58863");
  const [whitePieceColor, setWhitePieceColor] = useState<PieceColorPreset>("classic");
  const [blackPieceColor, setBlackPieceColor] = useState<PieceColorPreset>("classic");
  const [squarePattern, setSquarePattern] = useState<SquarePatternPreset>("none");
  const [squarePatternOpacity, setSquarePatternOpacity] = useState(0.3);
  const [showMovePopup, setShowMovePopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("practice");
  const [computerGameConfigured, setComputerGameConfigured] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [computerLevel, setComputerLevel] = useState(1000);
  const [nextMoveLoading, setNextMoveLoading] = useState(false);
  const [nextMoveError, setNextMoveError] = useState<string | null>(null);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [gameOverState, setGameOverState] = useState<GameOverState | null>(null);
  const [gameOverModalPos, setGameOverModalPos] = useState<{ x: number; y: number } | null>(null);
  const [suggestedMove, setSuggestedMove] = useState<{ uci: string; text: string } | null>(null);
  const [animatedEngineMove, setAnimatedEngineMove] = useState<{
    from: string;
    to: string;
    piece: PieceCode;
    token: number;
  } | null>(null);
  const game = useChessGame({ initialFen, orientation: currentOrientation, onMove, onGameEnd });
  const gameOverModalRef = useRef<HTMLDivElement | null>(null);
  const computerMoveInFlightRef = useRef(false);
  const dragStateRef = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  const flip = () => {
    setCurrentOrientation(prev => prev === "white" ? "black" : "white");
  };

  const boardStyle = {
    "--square-light": lightSquareColor,
    "--square-dark": darkSquareColor,
    "--square-pattern-opacity": String(squarePatternOpacity),
  } as CSSProperties;

  const isPracticeMode = gameMode === "practice";
  const isComputerMode = gameMode === "vs-computer";
  const isOnlineMode = gameMode === "online";
  const isComputerSetupRequired = isComputerMode && !computerGameConfigured;
  const canUserMove = !isComputerMode || game.turn === playerColor;
  const computerLevelLocked = isComputerMode && game.moveHistory.length > 0;
  const isGameActionLocked = gameOverState?.locked === true;
  const isUiLocked = isGameActionLocked || showResignConfirm;

  const userDisplayName =
    loggedInUser?.username
      || loggedInUser?.name
      || loggedInUser?.email
      || "Player";

  const userAvatarUrl =
    loggedInUser?.profilePicture
      || loggedInUser?.avatar
      || loggedInUser?.photoURL
      || loggedInUser?.image
      || undefined;

  const whitePlayer: PlayerBadge = isComputerMode
    ? (playerColor === "white"
      ? { name: userDisplayName, avatarUrl: userAvatarUrl, color: "white" }
      : { name: `Computer (Level ${computerLevel})`, isComputer: true, color: "white" })
    : { name: userDisplayName, avatarUrl: userAvatarUrl, color: "white" };

  const blackPlayer: PlayerBadge = isComputerMode
    ? (playerColor === "black"
      ? { name: userDisplayName, avatarUrl: userAvatarUrl, color: "black" }
      : { name: `Computer (Level ${computerLevel})`, isComputer: true, color: "black" })
    : { name: userDisplayName, avatarUrl: userAvatarUrl, color: "black" };

  const topPlayer = currentOrientation === "white" ? blackPlayer : whitePlayer;
  const bottomPlayer = currentOrientation === "white" ? whitePlayer : blackPlayer;

  const winnerPlayer = gameOverState?.winner === "white" ? whitePlayer : blackPlayer;
  const loserPlayer = gameOverState?.winner === "white" ? blackPlayer : whitePlayer;

  const capturedSummary = useMemo<CapturedSummary>(() => {
    const pieceCounts: Record<string, number> = {
      wp: 0,
      wn: 0,
      wb: 0,
      wr: 0,
      wq: 0,
      bp: 0,
      bn: 0,
      bb: 0,
      br: 0,
      bq: 0,
    };

    for (const row of game.board) {
      for (const piece of row) {
        if (piece && pieceCounts[piece] !== undefined) {
          pieceCounts[piece] += 1;
        }
      }
    }

    const startCounts: Record<string, number> = {
      wp: 8,
      wn: 2,
      wb: 2,
      wr: 2,
      wq: 1,
      bp: 8,
      bn: 2,
      bb: 2,
      br: 2,
      bq: 1,
    };

    const pieceValues: Record<string, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
    };

    const order = ["q", "r", "b", "n", "p"];
    const byWhite: string[] = [];
    const byBlack: string[] = [];
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const type of order) {
      const blackCode = `b${type}`;
      const whiteCode = `w${type}`;
      const blackMissing = Math.max(0, startCounts[blackCode] - pieceCounts[blackCode]);
      const whiteMissing = Math.max(0, startCounts[whiteCode] - pieceCounts[whiteCode]);

      for (let i = 0; i < blackMissing; i++) {
        byWhite.push(blackCode);
      }
      for (let i = 0; i < whiteMissing; i++) {
        byBlack.push(whiteCode);
      }

      whiteMaterial += blackMissing * pieceValues[type];
      blackMaterial += whiteMissing * pieceValues[type];
    }

    const whiteAdvantage = Math.max(0, whiteMaterial - blackMaterial);
    const blackAdvantage = Math.max(0, blackMaterial - whiteMaterial);

    return { byWhite, byBlack, whiteAdvantage, blackAdvantage };
  }, [game.board]);

  const checkedKingSquare = useMemo(() => {
    try {
      const checkGame = new ChessJs(game.fen);
      if (!checkGame.isCheck()) {
        return undefined;
      }

      const sideInCheck = checkGame.turn();
      const boardState = checkGame.board();
      for (let row = 0; row < boardState.length; row++) {
        for (let col = 0; col < boardState[row].length; col++) {
          const piece = boardState[row][col];
          if (piece && piece.type === "k" && piece.color === sideInCheck) {
            return `${String.fromCharCode(97 + col)}${8 - row}`;
          }
        }
      }
    } catch {
      return undefined;
    }

    return undefined;
  }, [game.fen]);

  const getEngineParamsByLevel = (level: number) => {
    const clampedLevel = Math.max(300, Math.min(3500, level));
    const stepIndex = Math.floor((clampedLevel - 300) / 100);

    return {
      movetime: 400 + stepIndex * 180,
      depth: 3 + Math.floor(stepIndex * 0.8),
    };
  };

  const getRandomLegalMove = (fen: string) => {
    const gameFromFen = new ChessJs(fen);
    const legalMoves = gameFromFen.moves({ verbose: true });
    if (!legalMoves.length) {
      return null;
    }
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      uci: `${randomMove.from}${randomMove.to}${randomMove.promotion ?? ""}`,
      text: `${randomMove.from}-${randomMove.to}`,
    };
  };

  const getFallbackLegalMove = (fen: string) => {
    const gameFromFen = new ChessJs(fen);
    const legalMoves = gameFromFen.moves({ verbose: true });
    if (!legalMoves.length) {
      return null;
    }

    if (gameFromFen.isCheck()) {
      const kingMoves = legalMoves.filter((move) => move.piece === "k");
      if (kingMoves.length > 0) {
        const move = kingMoves[Math.floor(Math.random() * kingMoves.length)];
        return {
          uci: `${move.from}${move.to}${move.promotion ?? ""}`,
          text: `${move.from}-${move.to}`,
        };
      }
    }

    const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      text: `${move.from}-${move.to}`,
    };
  };

  const getBestMove = async (level?: number) => {
    if (typeof level === "number" && level <= 300) {
      const randomMove = getFallbackLegalMove(game.fen) ?? getRandomLegalMove(game.fen);
      if (!randomMove) {
        throw new Error("No legal move found for this position.");
      }
      return randomMove;
    }

    const engineParams = getEngineParamsByLevel(level ?? 10);
    const response = await fetch("/api/chess/next-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fen: game.fen,
        movetime: engineParams.movetime,
        depth: engineParams.depth,
      }),
    });

    const rawText = await response.text();
    let data: any = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Backend returned an invalid response while calculating the move.");
      }
    }

    if (!response.ok) {
      throw new Error(data?.error || "Failed to calculate next move.");
    }

    const uci = String(data.bestMoveUci || "").trim();
    if (!uci) {
      throw new Error("Engine returned an empty move.");
    }

    const normalizedUci = uci.toLowerCase();
    const from = normalizedUci.slice(0, 2);
    const to = normalizedUci.slice(2, 4);
    const promotion = normalizedUci.length === 5 ? normalizedUci[4] : "q";

    try {
      const verifyGame = new ChessJs(game.fen);
      const verifiedMove = verifyGame.move({ from, to, promotion });
      if (!verifiedMove) {
        const fallbackMove = getFallbackLegalMove(game.fen);
        if (fallbackMove) {
          return fallbackMove;
        }
        throw new Error("No legal move found for this position.");
      }
    } catch {
      const fallbackMove = getFallbackLegalMove(game.fen);
      if (fallbackMove) {
        return fallbackMove;
      }
      throw new Error("No legal move found for this position.");
    }

    const text = typeof data.bestMoveText === "string" && data.bestMoveText
      ? data.bestMoveText
      : `${uci.slice(0, 2)}-${uci.slice(2, 4)}`;

    return { uci, text };
  };

  useEffect(() => {
    setSuggestedMove(null);
    setNextMoveError(null);
  }, [game.fen]);

  useEffect(() => {
    if (game.status !== "checkmate") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isComputerMode) {
        setComputerGameConfigured(false);
      }
      setGameOverState((prev) => {
        if (prev?.locked) {
          return prev;
        }

        const winner = game.turn === "white" ? "black" : "white";
        return {
          winner,
          reason: "checkmate",
          open: true,
          locked: true,
        };
      });
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [game.status, game.turn, isComputerMode]);

  useEffect(() => {
    if (!gameOverState?.open) {
      return;
    }
    setGameOverModalPos(null);
  }, [gameOverState?.open]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current.dragging || !gameOverModalRef.current) {
        return;
      }

      const modalRect = gameOverModalRef.current.getBoundingClientRect();
      const maxX = Math.max(0, window.innerWidth - modalRect.width);
      const maxY = Math.max(0, window.innerHeight - modalRect.height);
      const nextX = Math.min(Math.max(0, event.clientX - dragStateRef.current.offsetX), maxX);
      const nextY = Math.min(Math.max(0, event.clientY - dragStateRef.current.offsetY), maxY);

      setGameOverModalPos({ x: nextX, y: nextY });
    };

    const onMouseUp = () => {
      dragStateRef.current.dragging = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (
      !isComputerMode
      || isComputerSetupRequired
      || (game.status !== "ongoing" && game.status !== "check")
      || canUserMove
      || nextMoveLoading
      || isUiLocked
      || computerMoveInFlightRef.current
    ) {
      return;
    }

    const playComputerMove = async () => {
      if (computerMoveInFlightRef.current) {
        return;
      }

      computerMoveInFlightRef.current = true;
      setNextMoveLoading(true);
      setNextMoveError(null);

      try {
        const bestMove = await getBestMove(computerLevel);

        const uci = bestMove.uci.trim().toLowerCase();
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const fromCol = from.charCodeAt(0) - 97;
        const fromRow = 8 - Number(from[1]);
        const movingPiece = game.board[fromRow]?.[fromCol] as PieceCode | undefined;

        if (movingPiece) {
          setAnimatedEngineMove({ from, to, piece: movingPiece, token: Date.now() });
        }

        const ok = game.applySuggestedMove(bestMove.uci);
        if (!ok) {
          setAnimatedEngineMove(null);
          return;
        }
      } catch (err) {
        setNextMoveError(err instanceof Error ? err.message : "Failed to calculate next move.");
      } finally {
        computerMoveInFlightRef.current = false;
        setNextMoveLoading(false);
      }
    };

    const timer = window.setTimeout(playComputerMove, 250);
    return () => {
      window.clearTimeout(timer);
    };
  }, [canUserMove, computerLevel, game.board, game.fen, game.status, isComputerMode, isComputerSetupRequired, isUiLocked]);

  const unlockGameActions = () => {
    setGameOverState(null);
  };

  const handleGameModeChange = (mode: GameMode) => {
    setShowResignConfirm(false);
    unlockGameActions();
    setGameMode(mode);
    if (mode !== "vs-computer") {
      setComputerGameConfigured(false);
    }
    game.setFreeStyleMode(mode === "practice");
    if (mode === "vs-computer") {
      setComputerGameConfigured(false);
      game.reset();
      setCurrentOrientation(playerColor);
    }
    setSuggestedMove(null);
    setNextMoveError(null);
  };

  const handleStartComputerGame = (color: "white" | "black") => {
    setShowResignConfirm(false);
    unlockGameActions();
    setGameMode("vs-computer");
    setComputerGameConfigured(true);
    setPlayerColor(color);
    setCurrentOrientation(color);
    game.setFreeStyleMode(false);
    game.reset();
    setSuggestedMove(null);
    setNextMoveError(null);
  };

  const handleComputerLevelChange = (level: number) => {
    if (computerLevelLocked) {
      return;
    }
    const normalizedLevel = Math.max(300, Math.min(3500, Math.round(level / 100) * 100));
    setComputerLevel(normalizedLevel);
  };

  const nextMoveDisabledReason = useMemo(() => {
    if (!isPracticeMode) {
      return "Next Move is available in Practice mode.";
    }
    if (!game.freeStyleValidation.isValid) {
      return game.freeStyleValidation.errors[0] ?? "Invalid board setup.";
    }
    return undefined;
  }, [game.freeStyleValidation.errors, game.freeStyleValidation.isValid, isPracticeMode]);

  const requestNextMove = async () => {
    if (!isPracticeMode || !game.freeStyleValidation.isValid || nextMoveLoading || isUiLocked) {
      return;
    }

    setNextMoveLoading(true);
    setNextMoveError(null);

    try {
      const bestMove = await getBestMove();
      setSuggestedMove(bestMove);
    } catch (err) {
      setSuggestedMove(null);
      setNextMoveError(err instanceof Error ? err.message : "Failed to calculate next move.");
    } finally {
      setNextMoveLoading(false);
    }
  };

  const applySuggestedMove = () => {
    if (!suggestedMove || isUiLocked) {
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
      return;
    }

    setSuggestedMove(null);
    setNextMoveError(null);
  };

  const handleResign = () => {
    if (isUiLocked) {
      return;
    }

    if (isPracticeMode) {
      game.reset();
      return;
    }

    setShowResignConfirm(true);
  };

  const confirmResign = () => {
    setShowResignConfirm(false);

    if (isComputerMode) {
      setComputerGameConfigured(false);
    }

    const winner = game.turn === "white" ? "black" : "white";
    setGameOverState({
      winner,
      reason: "resign",
      open: true,
      locked: true,
    });
  };

  const cancelResign = () => {
    setShowResignConfirm(false);
  };

  const handleRematch = () => {
    unlockGameActions();
    game.setFreeStyleMode(false);
    game.reset();
    if (isComputerMode) {
      setComputerGameConfigured(true);
      setCurrentOrientation(playerColor);
    }
  };

  const handleSwitchSide = () => {
    if (isGameActionLocked === false) {
      return;
    }

    if (isComputerMode) {
      const nextColor: "white" | "black" = playerColor === "white" ? "black" : "white";
      handleStartComputerGame(nextColor);
      return;
    }

    unlockGameActions();
    const nextOrientation: BoardOrientation = currentOrientation === "white" ? "black" : "white";
    setCurrentOrientation(nextOrientation);
    game.setFreeStyleMode(false);
    game.reset();
  };

  const closeGameOverPopup = () => {
    setGameOverState((prev) => (prev ? { ...prev, open: false } : prev));
  };

  const handleGameOverDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gameOverModalRef.current) {
      return;
    }

    const rect = gameOverModalRef.current.getBoundingClientRect();
    dragStateRef.current.dragging = true;
    dragStateRef.current.offsetX = event.clientX - rect.left;
    dragStateRef.current.offsetY = event.clientY - rect.top;

    if (!gameOverModalPos) {
      setGameOverModalPos({ x: rect.left, y: rect.top });
    }
  };

  const handleFlip = () => {
    if (isUiLocked) {
      return;
    }
    flip();
  };

  const handleSquareClick = (square: string) => {
    if ((isComputerMode && (!canUserMove || isComputerSetupRequired)) || isOnlineMode || isUiLocked) {
      return;
    }
    game.onSquareClick(square);
  };

  const handleDragStart = (piece: string, fromSquare?: string, fromOutside?: boolean) => {
    if ((isComputerMode && (!canUserMove || isComputerSetupRequired)) || isOnlineMode || isUiLocked) {
      return;
    }
    game.onDragStart(piece, fromSquare, fromOutside);
  };

  const handleDrop = (
    toSquare: string,
    draggedPiece: string,
    fromSquare?: string,
    fromOutside?: boolean
  ) => {
    if ((isComputerMode && (!canUserMove || isComputerSetupRequired)) || isOnlineMode || isUiLocked) {
      return;
    }
    game.onDrop(toSquare, draggedPiece, fromSquare, fromOutside);
  };

  const handleDropOutside = (draggedPiece: string, fromSquare?: string, fromOutside?: boolean) => {
    if ((isComputerMode && (!canUserMove || isComputerSetupRequired)) || isOnlineMode || isUiLocked) {
      return;
    }
    game.onDropOutside(draggedPiece, fromSquare, fromOutside);
  };

  return (
    <div className={["chess-wrapper", `white-piece-${whitePieceColor}`, `black-piece-${blackPieceColor}`, `board-pattern-${squarePattern}`, className].join(" ")} style={boardStyle}>
      <GameStatus status={game.status} turn={game.turn} />
      <div className="chess-main-content">
        <ChessBoard
          board={game.board}
          orientation={currentOrientation}
          freeStyle={game.freeStyle}
          showPlayerBadges={!isPracticeMode}
          topPlayer={topPlayer}
          bottomPlayer={bottomPlayer}
          topCapturedPieces={topPlayer.color === "white" ? capturedSummary.byWhite : capturedSummary.byBlack}
          bottomCapturedPieces={bottomPlayer.color === "white" ? capturedSummary.byWhite : capturedSummary.byBlack}
          topAdvantage={topPlayer.color === "white" ? capturedSummary.whiteAdvantage : capturedSummary.blackAdvantage}
          bottomAdvantage={bottomPlayer.color === "white" ? capturedSummary.whiteAdvantage : capturedSummary.blackAdvantage}
          checkedKingSquare={checkedKingSquare}
          selectedSquare={game.selectedSquare}
          validMoves={game.validMoves}
          lastMove={game.lastMove}
          onSquareClick={handleSquareClick}
          showCoordinates={showCoordinates}
          interactive={interactive && !isOnlineMode}
          whitePieces={game.whitePieces}
          blackPieces={game.blackPieces}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDropOutside={handleDropOutside}
          animatedMove={animatedEngineMove ?? undefined}
          onAnimatedMoveEnd={() => setAnimatedEngineMove(null)}
        />
        <div className="chess-side-panel">
          {showGameOptions && (
            <GameOptions
              gameMode={gameMode}
              computerLevel={computerLevel}
              computerLevelLocked={computerLevelLocked}
              computerGameConfigured={computerGameConfigured}
              computerSetupRequired={isComputerSetupRequired}
              turn={game.turn}
              castlingRights={game.castlingRights}
              onGameModeChange={handleGameModeChange}
              onStartComputerGame={handleStartComputerGame}
              onComputerLevelChange={handleComputerLevelChange}
              onTurnChange={game.setTurn}
              onCastlingChange={game.setCastlingRights}
            />
          )}
          <Controls
            onUndo={game.undo}
            onReset={handleResign}
            onFlip={handleFlip}
            onClearAll={game.clearAllPieces}
            onNextMove={isPracticeMode ? requestNextMove : undefined}
            freeStyle={game.freeStyle}
            allowUndo={allowUndo}
            allowReset={allowReset}
            allowFlip={allowFlip}
            allowClearAll={showGameOptions && isPracticeMode}
            nextMoveLoading={nextMoveLoading && isPracticeMode}
            nextMoveDisabled={!isPracticeMode || !game.freeStyleValidation.isValid || nextMoveLoading}
            nextMoveDisabledReason={nextMoveDisabledReason}
            suggestedMoveText={suggestedMove?.text}
            onApplySuggestedMove={isPracticeMode && suggestedMove ? applySuggestedMove : undefined}
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
              <div className="option-section">
                <h4>Square Pattern</h4>
                <div className="piece-color-selectors">
                  <label className="piece-color-control">
                    <span>Preset</span>
                    <select
                      value={squarePattern}
                      onChange={(e) => setSquarePattern(e.target.value as SquarePatternPreset)}
                    >
                      <option value="none">None</option>
                      <option value="classic">Classic Chess Board</option>
                      <option value="soft">Soft Grid</option>
                      <option value="premium">Premium Gold</option>
                      <option value="three-d">3D Tiles</option>
                      <option value="strip">Title Strip</option>
                    </select>
                  </label>
                  <label className="pattern-opacity-control">
                    <span>Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.05"
                      value={squarePatternOpacity}
                      onChange={(e) => setSquarePatternOpacity(Number(e.target.value))}
                      aria-label="Square pattern opacity"
                    />
                    <output>{Math.round(squarePatternOpacity * 100)}%</output>
                  </label>
                  <div className="square-pattern-preview-wrap">
                    <div className="square-pattern-preview light" />
                    <div className="square-pattern-preview dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResignConfirm && (
        <div className="game-over-backdrop" onClick={(e) => e.stopPropagation()}>
          <div className="game-over-modal resign-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm resign">
            <h3 className="game-over-title">Confirm Resign</h3>
            <p className="game-over-subtitle">Are you sure you want to resign this game?</p>
            <div className="game-over-actions">
              <button className="control-btn" onClick={confirmResign}>Yes, Resign</button>
              <button className="control-btn" onClick={cancelResign}>No, Continue</button>
            </div>
          </div>
        </div>
      )}

      {gameOverState?.open && (
        <div className="game-over-backdrop" onClick={(e) => e.stopPropagation()}>
          <div
            ref={gameOverModalRef}
            className="game-over-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Game over"
            style={gameOverModalPos ? { position: "fixed", left: gameOverModalPos.x, top: gameOverModalPos.y } : undefined}
          >
            <div className="game-over-drag-handle" onMouseDown={handleGameOverDragStart} title="Drag popup" />
            <button className="game-over-close" onClick={closeGameOverPopup} aria-label="Close game over popup">x</button>
            <h3 className="game-over-title">{gameOverState.winner === "white" ? "White Won" : "Black Won"}</h3>
            <p className="game-over-subtitle">{gameOverState.reason === "checkmate" ? "by checkmate" : "by resign"}</p>

            <div className="game-over-result-list">
              <div className="game-over-result-row win">
                <span className="name">{winnerPlayer.name}</span>
                <span className="tag">WIN</span>
              </div>
              <div className="game-over-result-row lose">
                <span className="name">{loserPlayer.name}</span>
                <span className="tag">LOSE</span>
              </div>
            </div>

            <div className="game-over-actions">
              <button className="control-btn" onClick={handleRematch}>Rematch</button>
              <button className="control-btn" onClick={handleSwitchSide}>Switch Side</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
