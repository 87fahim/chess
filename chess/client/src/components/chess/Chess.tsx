import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import { Chess as ChessJs } from "chess.js";
import { apiFetch } from "../../utils/api";
import { ChessProps, BoardOrientation } from "./Chess.types";
import ChessBoard from "./components/ChessBoard";
import Controls from "./components/Controls";
import MoveList from "./components/MoveList";
import GameStatus from "./components/GameStatus";
import GameOptions, { GameMode, PieceColorPreset } from "./components/GameOptions";
import ResignConfirmModal from "./components/ResignConfirmModal";
import GameOverModal from "./components/GameOverModal";
import BoardZoomDock from "./components/shared/BoardZoomDock";
import FenDock from "./components/shared/FenDock";
import { PieceCode } from "./components/Piece";
import useChessGame from "./hooks/useChessGame";
import { ChessBoardProvider } from "./context/ChessContext";
import { ChessPanelProvider } from "./context/ChessPanelContext";
import {
  ChessDisplayProvider,
  chessDisplayReducer,
  initialChessDisplayState,
} from "./context/ChessDisplayContext";
import { chessUiReducer, initialChessUiState } from "./context/chessUiReducer";
import useAuth from "../../hooks/userAuth";
import "./styles/chess.css";
import "./styles/board.css";
import "./styles/piece.css";
import "./styles/controls.css";
import "./styles/status.css";
import "./styles/fen.css";
import "./styles/game-options.css";
import "./styles/shared-ui.css";

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

type SuggestedMove = {
  uci: string;
  text: string;
};

type AnimatedEngineMove = {
  from: string;
  to: string;
  piece: PieceCode;
  token: number;
};

type ChessLocalState = {
  showMovePopup: boolean;
  nextMoveLoading: boolean;
  nextMoveError: string | null;
  showResignConfirm: boolean;
  gameOverState: GameOverState | null;
  gameOverModalPos: { x: number; y: number } | null;
  suggestedMove: SuggestedMove | null;
  animatedEngineMove: AnimatedEngineMove | null;
};

type ChessLocalAction =
  | { type: "set-show-move-popup"; payload: boolean }
  | { type: "set-next-move-loading"; payload: boolean }
  | { type: "set-next-move-error"; payload: string | null }
  | { type: "set-show-resign-confirm"; payload: boolean }
  | { type: "set-game-over-state"; payload: GameOverState | null }
  | { type: "set-game-over-state-if-unlocked"; payload: Omit<GameOverState, "open" | "locked"> }
  | { type: "close-game-over-popup" }
  | { type: "set-game-over-modal-pos"; payload: { x: number; y: number } | null }
  | { type: "set-suggested-move"; payload: SuggestedMove | null }
  | { type: "set-animated-engine-move"; payload: AnimatedEngineMove | null };

const initialChessLocalState: ChessLocalState = {
  showMovePopup: false,
  nextMoveLoading: false,
  nextMoveError: null,
  showResignConfirm: false,
  gameOverState: null,
  gameOverModalPos: null,
  suggestedMove: null,
  animatedEngineMove: null,
};

const chessLocalReducer = (state: ChessLocalState, action: ChessLocalAction): ChessLocalState => {
  switch (action.type) {
    case "set-show-move-popup":
      return { ...state, showMovePopup: action.payload };
    case "set-next-move-loading":
      return { ...state, nextMoveLoading: action.payload };
    case "set-next-move-error":
      return { ...state, nextMoveError: action.payload };
    case "set-show-resign-confirm":
      return { ...state, showResignConfirm: action.payload };
    case "set-game-over-state":
      return { ...state, gameOverState: action.payload };
    case "set-game-over-state-if-unlocked":
      if (state.gameOverState?.locked) {
        return state;
      }
      return {
        ...state,
        gameOverState: {
          ...action.payload,
          open: true,
          locked: true,
        },
      };
    case "close-game-over-popup":
      return {
        ...state,
        gameOverState: state.gameOverState ? { ...state.gameOverState, open: false } : state.gameOverState,
      };
    case "set-game-over-modal-pos":
      return { ...state, gameOverModalPos: action.payload };
    case "set-suggested-move":
      return { ...state, suggestedMove: action.payload };
    case "set-animated-engine-move":
      return { ...state, animatedEngineMove: action.payload };
    default:
      return state;
  }
};

export default function Chess({ initialFen = "start", orientation = "white", showCoordinates = true, showMoveList = true, allowUndo = true, allowReset = true, allowFlip = true, showGameOptions = true, externalGameMode, boardZoom = 1, onBoardZoomChange, appearanceSettings, interactive = true, onMove, onGameEnd, className = "", }: ChessProps) {
  const auth = useAuth() as any;
  const loggedInUser = auth?.user ?? null;
  const [currentOrientation, setCurrentOrientation] = useState<BoardOrientation>(orientation);
  const [boardStartAnimationToken, setBoardStartAnimationToken] = useState(0);
  const [displayState, dispatchDisplay] = useReducer(chessDisplayReducer, initialChessDisplayState);
  const [uiState, dispatchUi] = useReducer(chessUiReducer, initialChessUiState);
  const [localState, dispatchLocal] = useReducer(chessLocalReducer, initialChessLocalState);
  const {
    showMovePopup,
    nextMoveLoading,
    nextMoveError,
    showResignConfirm,
    gameOverState,
    gameOverModalPos,
    suggestedMove,
    animatedEngineMove,
  } = localState;
  const game = useChessGame({ initialFen, orientation: currentOrientation, onMove, onGameEnd });
    const { gameMode, computerGameConfigured, playerColor, computerLevel } = uiState;
    const {
      lightSquareColor,
      darkSquareColor,
      whitePieceColor,
      blackPieceColor,
      squarePattern,
      squarePatternOpacity,
    } = displayState;

  const gameOverModalRef = useRef<HTMLDivElement>(null);
  const computerMoveInFlightRef = useRef(false);
  const dragStateRef = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  const flip = () => {
    setCurrentOrientation(prev => prev === "white" ? "black" : "white");
  };

  const triggerBoardStartAnimation = () => {
    setBoardStartAnimationToken((prev) => prev + 1);
  };

  const boardStyle = {
    "--square-light": appearanceSettings?.lightSquareColor ?? lightSquareColor,
    "--square-dark": appearanceSettings?.darkSquareColor ?? darkSquareColor,
    "--square-pattern-opacity": String(squarePatternOpacity),
    "--tile-size": `${Math.round(50 * Math.max(0.6, Math.min(1.8, boardZoom)))}px`,
  } as CSSProperties;

  const clampedBoardZoom = Math.max(0.7, Math.min(1.6, boardZoom));
  const canZoomOut = clampedBoardZoom > 0.7;
  const canZoomIn = clampedBoardZoom < 1.6;

  const updateBoardZoom = (delta: number) => {
    if (!onBoardZoomChange) {
      return;
    }
    const nextZoom = Number((clampedBoardZoom + delta).toFixed(2));
    onBoardZoomChange(Math.max(0.7, Math.min(1.6, nextZoom)));
  };

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

  const getApproximateSkillLevelFromElo = (elo: number) => {
    const normalized = (elo - 1350) / (2850 - 1350);
    return Math.max(0, Math.min(20, Math.round(normalized * 20)));
  };

  const getEngineParamsByLevel = (level: number) => {
    const clampedLevel = Math.max(300, Math.min(3500, level));

    if (clampedLevel < 1350) {
      const normalized = (clampedLevel - 300) / (1350 - 300);
      return {
        movetime: Math.round(50 + normalized * 120),
        depth: Math.max(1, Math.round(1 + normalized * 3)),
        nodes: Math.round(300 + normalized * 2200),
        skillLevel: 0,
        useLimitStrength: true,
        uciElo: 1350,
      };
    }

    if (clampedLevel <= 2850) {
      const normalized = (clampedLevel - 1350) / (2850 - 1350);
      return {
        movetime: Math.round(350 + normalized * 650),
        skillLevel: getApproximateSkillLevelFromElo(clampedLevel),
        useLimitStrength: true,
        uciElo: clampedLevel,
      };
    }

    const fullStrengthNormalized = (clampedLevel - 2850) / (3500 - 2850);
    return {
      movetime: Math.round(900 + fullStrengthNormalized * 500),
      depth: 16 + Math.round(fullStrengthNormalized * 4),
      useLimitStrength: false,
    };
  };

  const shouldUseWeakFallback = (level: number) => {
    if (level >= 1350) {
      return false;
    }

    const normalizedWeakness = (1350 - Math.max(300, level)) / (1350 - 300);
    const fallbackChance = 0.2 + normalizedWeakness * 0.55;
    return Math.random() < fallbackChance;
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
    if (typeof level === "number" && shouldUseWeakFallback(level)) {
      const randomMove = getFallbackLegalMove(game.fen) ?? getRandomLegalMove(game.fen);
      if (!randomMove) {
        throw new Error("No legal move found for this position.");
      }
      return randomMove;
    }

    const engineParams = getEngineParamsByLevel(level ?? 10);
    const response = await apiFetch("/api/chess/next-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fen: game.fen,
        movetime: engineParams.movetime,
        depth: engineParams.depth,
        nodes: engineParams.nodes,
        skillLevel: engineParams.skillLevel,
        useLimitStrength: engineParams.useLimitStrength,
        uciElo: engineParams.uciElo,
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
    dispatchLocal({ type: "set-suggested-move", payload: null });
    dispatchLocal({ type: "set-next-move-error", payload: null });
  }, [game.fen]);

  useEffect(() => {
    if (game.status !== "checkmate") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isComputerMode) {
        dispatchUi({ type: "set-computer-configured", payload: false });
      }
      const winner = game.turn === "white" ? "black" : "white";
      dispatchLocal({
        type: "set-game-over-state-if-unlocked",
        payload: {
          winner,
          reason: "checkmate",
        },
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
    dispatchLocal({ type: "set-game-over-modal-pos", payload: null });
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

      dispatchLocal({ type: "set-game-over-modal-pos", payload: { x: nextX, y: nextY } });
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
      dispatchLocal({ type: "set-next-move-loading", payload: true });
      dispatchLocal({ type: "set-next-move-error", payload: null });

      try {
        const bestMove = await getBestMove(computerLevel);

        const uci = bestMove.uci.trim().toLowerCase();
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const fromCol = from.charCodeAt(0) - 97;
        const fromRow = 8 - Number(from[1]);
        const movingPiece = game.board[fromRow]?.[fromCol] as PieceCode | undefined;

        if (movingPiece) {
          dispatchLocal({
            type: "set-animated-engine-move",
            payload: { from, to, piece: movingPiece, token: Date.now() },
          });
        }

        const ok = game.applySuggestedMove(bestMove.uci);
        if (!ok) {
          dispatchLocal({ type: "set-animated-engine-move", payload: null });
          return;
        }
      } catch (err) {
        dispatchLocal({
          type: "set-next-move-error",
          payload: err instanceof Error ? err.message : "Failed to calculate next move.",
        });
      } finally {
        computerMoveInFlightRef.current = false;
        dispatchLocal({ type: "set-next-move-loading", payload: false });
      }
    };

    const timer = window.setTimeout(playComputerMove, 250);
    return () => {
      window.clearTimeout(timer);
    };
  }, [canUserMove, computerLevel, game.board, game.fen, game.status, isComputerMode, isComputerSetupRequired, isUiLocked]);

  const unlockGameActions = () => {
    dispatchLocal({ type: "set-game-over-state", payload: null });
  };

  const handleGameModeChange = (mode: GameMode) => {
    dispatchLocal({ type: "set-show-resign-confirm", payload: false });
    unlockGameActions();
    dispatchUi({ type: "set-game-mode", payload: mode });
    if (mode !== "vs-computer") {
      dispatchUi({ type: "set-computer-configured", payload: false });
    }
    game.setFreeStyleMode(mode === "practice");
    if (mode === "vs-computer") {
      dispatchUi({ type: "set-computer-configured", payload: false });
      game.reset();
      setCurrentOrientation(playerColor);
    }
    dispatchLocal({ type: "set-suggested-move", payload: null });
    dispatchLocal({ type: "set-next-move-error", payload: null });
    triggerBoardStartAnimation();
  };

  const handleStartComputerGame = (color: "white" | "black") => {
    dispatchLocal({ type: "set-show-resign-confirm", payload: false });
    unlockGameActions();
    dispatchUi({ type: "set-game-mode", payload: "vs-computer" });
    dispatchUi({ type: "set-computer-configured", payload: true });
    dispatchUi({ type: "set-player-color", payload: color });
    setCurrentOrientation(color);
    game.setFreeStyleMode(false);
    game.reset();
    dispatchLocal({ type: "set-suggested-move", payload: null });
    dispatchLocal({ type: "set-next-move-error", payload: null });
    triggerBoardStartAnimation();
  };

  const handleComputerLevelChange = (level: number) => {
    if (computerLevelLocked) {
      return;
    }
    const normalizedLevel = Math.max(300, Math.min(3500, Math.round(level / 100) * 100));
    dispatchUi({ type: "set-computer-level", payload: normalizedLevel });
  };

  useEffect(() => {
    if (!externalGameMode) {
      return;
    }

    if (externalGameMode === "vs-computer") {
      handleStartComputerGame("white");
      return;
    }

    handleGameModeChange(externalGameMode);
  }, [externalGameMode]);

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

    dispatchLocal({ type: "set-next-move-loading", payload: true });
    dispatchLocal({ type: "set-next-move-error", payload: null });

    try {
      const bestMove = await getBestMove();
      dispatchLocal({ type: "set-suggested-move", payload: bestMove });
    } catch (err) {
      dispatchLocal({ type: "set-suggested-move", payload: null });
      dispatchLocal({
        type: "set-next-move-error",
        payload: err instanceof Error ? err.message : "Failed to calculate next move.",
      });
    } finally {
      dispatchLocal({ type: "set-next-move-loading", payload: false });
    }
  };

  const applySuggestedMove = () => {
    if (!suggestedMove || isUiLocked) {
      return;
    }

    const uci = suggestedMove.uci.trim().toLowerCase();
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) {
      dispatchLocal({ type: "set-next-move-error", payload: "Suggested move format is invalid." });
      return;
    }

    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const fromCol = from.charCodeAt(0) - 97;
    const fromRow = 8 - Number(from[1]);
    const movingPiece = game.board[fromRow]?.[fromCol] as PieceCode | undefined;

    if (movingPiece) {
      dispatchLocal({
        type: "set-animated-engine-move",
        payload: { from, to, piece: movingPiece, token: Date.now() },
      });
    }

    const ok = game.applySuggestedMove(suggestedMove.uci);
    if (!ok) {
      dispatchLocal({ type: "set-animated-engine-move", payload: null });
      return;
    }

    dispatchLocal({ type: "set-suggested-move", payload: null });
    dispatchLocal({ type: "set-next-move-error", payload: null });
  };

  const handleResign = () => {
    if (isUiLocked) {
      return;
    }

    if (isPracticeMode) {
      game.reset();
      return;
    }

    dispatchLocal({ type: "set-show-resign-confirm", payload: true });
  };

  const confirmResign = () => {
    dispatchLocal({ type: "set-show-resign-confirm", payload: false });

    if (isComputerMode) {
      dispatchUi({ type: "set-computer-configured", payload: false });
    }

    const winner = game.turn === "white" ? "black" : "white";
    dispatchLocal({
      type: "set-game-over-state",
      payload: {
        winner,
        reason: "resign",
        open: true,
        locked: true,
      },
    });
  };

  const cancelResign = () => {
    dispatchLocal({ type: "set-show-resign-confirm", payload: false });
  };

  const handleRematch = () => {
    unlockGameActions();
    game.setFreeStyleMode(false);
    game.reset();
    if (isComputerMode) {
      dispatchUi({ type: "set-computer-configured", payload: true });
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
    dispatchLocal({ type: "close-game-over-popup" });
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
      dispatchLocal({ type: "set-game-over-modal-pos", payload: { x: rect.left, y: rect.top } });
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
    <>
      <div className="chess-main-stack">
        <GameStatus status={game.status} turn={game.turn} />
        <ChessDisplayProvider
          state={displayState}
          actions={{
            setLightSquareColor: (value) => dispatchDisplay({ type: "set-light-square-color", payload: value }),
            setDarkSquareColor: (value) => dispatchDisplay({ type: "set-dark-square-color", payload: value }),
            setWhitePieceColor: (value) => dispatchDisplay({ type: "set-white-piece-color", payload: value }),
            setBlackPieceColor: (value) => dispatchDisplay({ type: "set-black-piece-color", payload: value }),
            setSquarePattern: (value) => dispatchDisplay({ type: "set-square-pattern", payload: value }),
            setSquarePatternOpacity: (value) => dispatchDisplay({ type: "set-square-pattern-opacity", payload: value }),
          }}
        >
        <div className={["chess-main-content", className].join(" ")} style={boardStyle}>
        <ChessBoardProvider
          state={{
            board: game.board,
            selectedSquare: game.selectedSquare,
            validMoves: game.validMoves,
            lastMove: game.lastMove,
            checkedKingSquare,
            orientation: currentOrientation,
            freeStyle: game.freeStyle,
            showCoordinates,
            interactive: interactive && !isOnlineMode,
            whitePieces: game.whitePieces,
            blackPieces: game.blackPieces,
          }}
          actions={{
            onSquareClick: handleSquareClick,
            onDragStart: handleDragStart,
            onDrop: handleDrop,
            onDropOutside: handleDropOutside,
          }}
        >
          <ChessBoard
            players={{
              showPlayerBadges: !isPracticeMode,
              topPlayer,
              bottomPlayer,
              topCapturedPieces: topPlayer.color === "white" ? capturedSummary.byWhite : capturedSummary.byBlack,
              bottomCapturedPieces: bottomPlayer.color === "white" ? capturedSummary.byWhite : capturedSummary.byBlack,
              topAdvantage: topPlayer.color === "white" ? capturedSummary.whiteAdvantage : capturedSummary.blackAdvantage,
              bottomAdvantage: bottomPlayer.color === "white" ? capturedSummary.whiteAdvantage : capturedSummary.blackAdvantage,
            }}
            animation={{
              animatedMove: animatedEngineMove ?? undefined,
              startTransitionToken: boardStartAnimationToken,
              onAnimatedMoveEnd: () => dispatchLocal({ type: "set-animated-engine-move", payload: null }),
            }}
          />
        </ChessBoardProvider>
        <ChessPanelProvider
          state={{
            gameMode,
            computerLevel,
            computerLevelLocked,
            computerGameConfigured,
            computerSetupRequired: isComputerSetupRequired,
            turn: game.turn,
            castlingRights: game.castlingRights,
            freeStyle: game.freeStyle,
            allowUndo,
            allowReset,
            allowFlip,
            allowClearAll: showGameOptions && isPracticeMode,
            nextMoveLoading: nextMoveLoading && isPracticeMode,
            nextMoveDisabled: !isPracticeMode || !game.freeStyleValidation.isValid || nextMoveLoading,
            nextMoveDisabledReason,
            suggestedMoveText: suggestedMove?.text,
            nextMoveError: nextMoveError ?? undefined,
            moveCount: game.moveHistory.length,
            showMoveList,
            canRequestNextMove: isPracticeMode,
            canApplySuggestedMove: isPracticeMode && Boolean(suggestedMove),
          }}
          actions={{
            onGameModeChange: handleGameModeChange,
            onStartComputerGame: handleStartComputerGame,
            onComputerLevelChange: handleComputerLevelChange,
            onTurnChange: game.setTurn,
            onCastlingChange: game.setCastlingRights,
            onUndo: game.undo,
            onReset: handleResign,
            onFlip: handleFlip,
            onClearAll: game.clearAllPieces,
            onNextMove: requestNextMove,
            onApplySuggestedMove: applySuggestedMove,
            onOpenMoves: () => dispatchLocal({ type: "set-show-move-popup", payload: true }),
          }}
        >
          <div className="chess-side-panel">
            {showGameOptions && <GameOptions />}
            <Controls />
          </div>
        </ChessPanelProvider>
        </div>
        <div className="chess-bottom-dock">
          <BoardZoomDock
            zoom={clampedBoardZoom}
            canZoomOut={canZoomOut}
            canZoomIn={canZoomIn}
            disabled={!onBoardZoomChange}
            onZoomStep={updateBoardZoom}
          />
          <FenDock fen={game.fen} />
        </div>

        {showMoveList && (
          <MoveList
            moves={game.moveHistory}
            isOpen={showMovePopup}
            onClose={() => dispatchLocal({ type: "set-show-move-popup", payload: false })}
          />
        )}

        <ResignConfirmModal
          open={showResignConfirm}
          onConfirm={confirmResign}
          onCancel={cancelResign}
        />

        <GameOverModal
          open={Boolean(gameOverState?.open)}
          winner={gameOverState?.winner ?? "white"}
          reason={gameOverState?.reason ?? "checkmate"}
          winnerName={winnerPlayer?.name ?? "Winner"}
          loserName={loserPlayer?.name ?? "Loser"}
          modalRef={gameOverModalRef}
          modalPos={gameOverModalPos}
          onDragStart={handleGameOverDragStart}
          onClose={closeGameOverPopup}
          onRematch={handleRematch}
          onSwitchSide={handleSwitchSide}
        />
        </ChessDisplayProvider>
      </div>
    </>
  );
}
