import { Dispatch, SetStateAction } from "react";
import { Chess } from "chess.js";
import { ChessMovePayload, GameResult } from "../Chess.types";
import { startFENtoBoard } from "../logic/boardMapper";
import {
  boardToFen,
  createGameResult,
  DEFAULT_BLACK_PIECES,
  DEFAULT_WHITE_PIECES,
  getGameFromFen,
  parseUciMove,
  squareToCoords,
} from "./useChessGame.helpers";
import { CastlingRights, EditSnapshot, GameTurn, LastMove } from "./useChessGame.types";

type Setter<T> = Dispatch<SetStateAction<T>>;

type CreateChessGameActionsArgs = {
  fen: string;
  board: string[][];
  freeStyle: boolean;
  turn: GameTurn;
  selectedSquare?: string;
  currentGame: Chess | null;
  editHistory: EditSnapshot[];
  moveHistory: ChessMovePayload[];
  whitePieces: string[];
  blackPieces: string[];
  setSelectedSquare: Setter<string | undefined>;
  setMoveHistory: Setter<ChessMovePayload[]>;
  setFen: Setter<string>;
  setBoard: Setter<string[][]>;
  setEditHistory: Setter<EditSnapshot[]>;
  setLastMove: Setter<LastMove | undefined>;
  setFreeStyle: Setter<boolean>;
  setWhitePieces: Setter<string[]>;
  setBlackPieces: Setter<string[]>;
  onMove?: (move: ChessMovePayload) => void;
  onGameEnd?: (result: GameResult) => void;
};

export const createChessGameActions = ({
  fen,
  board,
  freeStyle,
  turn,
  selectedSquare,
  currentGame,
  editHistory,
  moveHistory,
  whitePieces,
  blackPieces,
  setSelectedSquare,
  setMoveHistory,
  setFen,
  setBoard,
  setEditHistory,
  setLastMove,
  setFreeStyle,
  setWhitePieces,
  setBlackPieces,
  onMove,
  onGameEnd,
}: CreateChessGameActionsArgs) => {
  const createSnapshot = (): EditSnapshot => ({
    board: board.map((row) => [...row]),
    fen,
    whitePieces: [...whitePieces],
    blackPieces: [...blackPieces],
    moveHistory: [...moveHistory],
  });

  const pushSnapshot = () => {
    setEditHistory((prev) => [...prev, createSnapshot()]);
  };

  const applyCommittedMove = (ruleGame: Chess, payload: ChessMovePayload) => {
    pushSnapshot();
    setMoveHistory((prev) => [...prev, payload]);
    setSelectedSquare(undefined);
    setLastMove({ from: payload.from, to: payload.to });
    setFen(ruleGame.fen());
    setBoard(startFENtoBoard(ruleGame.fen()));
    onMove?.(payload);
    onGameEnd?.(createGameResult(ruleGame, turn));
  };

  const resetToDefaultGame = () => {
    const resetGame = new Chess();
    setSelectedSquare(undefined);
    setMoveHistory([]);
    setEditHistory([]);
    setLastMove(undefined);
    setFen(resetGame.fen());
    setBoard(startFENtoBoard(resetGame.fen()));
    setWhitePieces(DEFAULT_WHITE_PIECES);
    setBlackPieces(DEFAULT_BLACK_PIECES);
  };

  const applyLegalMove = (from: string, to: string) => {
    const ruleGame = getGameFromFen(fen);
    if (!ruleGame) {
      return false;
    }

    let move;
    try {
      move = ruleGame.move({ from, to, promotion: "q" });
    } catch {
      return false;
    }

    if (!move) {
      return false;
    }

    applyCommittedMove(ruleGame, {
      from,
      to,
      promotion: move.promotion,
      san: move.san,
    });

    return true;
  };

  const onSquareClick = (square: string) => {
    if (freeStyle) {
      setSelectedSquare((prev) => (prev === square ? undefined : square));
      return;
    }

    const turnColor = turn === "white" ? "w" : "b";
    const clickedPiece = currentGame?.get(square as any);

    if (selectedSquare === square) {
      setSelectedSquare(undefined);
      return;
    }

    if (clickedPiece && clickedPiece.color === turnColor) {
      setSelectedSquare(square);
      return;
    }

    if (selectedSquare && selectedSquare !== square) {
      if (!applyLegalMove(selectedSquare, square)) {
        setSelectedSquare(undefined);
      }
      return;
    }

    setSelectedSquare(undefined);
  };

  const onDragStart = (piece: string, fromSquare?: string, fromOutside?: boolean) => {
    if (freeStyle || fromOutside || !fromSquare) {
      return;
    }

    const pieceColor = piece[0];
    const turnColor = turn === "white" ? "w" : "b";

    if (pieceColor === turnColor) {
      setSelectedSquare(fromSquare);
    }
  };

  const onDrop = (
    toSquare: string,
    draggedPiece: string,
    fromSquare?: string,
    fromOutside?: boolean
  ) => {
    if (!freeStyle) {
      if (fromOutside || !fromSquare) {
        return;
      }

      applyLegalMove(fromSquare, toSquare);
      return;
    }

    const [toRow, toCol] = squareToCoords(toSquare);
    const newBoard = board.map((row) => [...row]);
    const targetPiece = newBoard[toRow][toCol];

    if (targetPiece && targetPiece[0] === draggedPiece[0]) {
      return;
    }

    if (fromOutside) {
      pushSnapshot();
      newBoard[toRow][toCol] = draggedPiece;
      setSelectedSquare(undefined);
      setLastMove({ from: "outside", to: toSquare });
      setBoard(newBoard);
      setFen(boardToFen(newBoard, fen));
      setMoveHistory((prev) => [
        ...prev,
        { from: "outside", to: toSquare, san: `${draggedPiece}@${toSquare}` },
      ]);
      return;
    }

    if (!fromSquare || fromSquare === toSquare) {
      return;
    }

    const [fromRow, fromCol] = squareToCoords(fromSquare);

    pushSnapshot();
    newBoard[toRow][toCol] = draggedPiece;
    newBoard[fromRow][fromCol] = "";
    setSelectedSquare(undefined);
    setLastMove({ from: fromSquare, to: toSquare });
    setBoard(newBoard);
    setFen(boardToFen(newBoard, fen));
    setMoveHistory((prev) => [
      ...prev,
      { from: fromSquare, to: toSquare, san: `${fromSquare}-${toSquare}` },
    ]);
  };

  const onDropOutside = (_draggedPiece: string, fromSquare?: string, fromOutside?: boolean) => {
    if (!freeStyle || !fromSquare || fromOutside) {
      return;
    }

    const [fromRow, fromCol] = squareToCoords(fromSquare);
    pushSnapshot();
    const newBoard = board.map((row) => [...row]);
    newBoard[fromRow][fromCol] = "";
    setBoard(newBoard);
    setFen(boardToFen(newBoard, fen));
    setMoveHistory((prev) => [
      ...prev,
      { from: fromSquare, to: "outside", san: `${fromSquare}->outside` },
    ]);
  };

  const undo = () => {
    if (editHistory.length === 0) {
      return;
    }

    const last = editHistory[editHistory.length - 1];
    setEditHistory((prev) => prev.slice(0, -1));
    setSelectedSquare(undefined);
    setBoard(last.board);
    setFen(last.fen);
    setWhitePieces(last.whitePieces);
    setBlackPieces(last.blackPieces);
    setMoveHistory(last.moveHistory);
    setLastMove(
      last.moveHistory.length > 0
        ? {
            from: last.moveHistory[last.moveHistory.length - 1].from,
            to: last.moveHistory[last.moveHistory.length - 1].to,
          }
        : undefined
    );
  };

  const flip = () => {
    setSelectedSquare(undefined);
  };

  const setTurn = (newTurn: GameTurn) => {
    if (!freeStyle) {
      return;
    }

    pushSnapshot();
    const parts = fen.split(" ");
    parts[1] = newTurn === "white" ? "w" : "b";
    const newFen = parts.join(" ");
    setFen(newFen);
    setBoard(startFENtoBoard(newFen));
  };

  const setCastlingRights = (rights: CastlingRights) => {
    if (!freeStyle) {
      return;
    }

    pushSnapshot();
    const parts = fen.split(" ");
    let castling = "";
    if (rights.whiteKingSide) castling += "K";
    if (rights.whiteQueenSide) castling += "Q";
    if (rights.blackKingSide) castling += "k";
    if (rights.blackQueenSide) castling += "q";
    parts[2] = castling || "-";
    setFen(parts.join(" "));
  };

  const clearAllPieces = () => {
    if (!freeStyle) {
      return;
    }

    pushSnapshot();
    const newBoard = board.map((row) =>
      row.map((piece) => {
        if (piece === "wk" || piece === "bk") {
          return piece;
        }
        return "";
      })
    );
    setBoard(newBoard);
    setFen(boardToFen(newBoard, fen));
    setSelectedSquare(undefined);
    setMoveHistory((prev) => [...prev, { from: "setup", to: "setup", san: "clear-all" }]);
  };

  const setFreeStyleMode = (enabled: boolean) => {
    if (enabled) {
      setFreeStyle(true);
      setSelectedSquare(undefined);
      return;
    }

    setFreeStyle(false);
    resetToDefaultGame();
  };

  const reset = () => {
    resetToDefaultGame();
  };

  const applySuggestedMove = (uciMove: string): boolean => {
    const parsed = parseUciMove(uciMove);
    if (!parsed) {
      return false;
    }

    const ruleGame = getGameFromFen(fen);
    if (!ruleGame) {
      return false;
    }

    const { from, to, promotion } = parsed;

    let move;
    try {
      move = ruleGame.move({ from, to, promotion });
    } catch {
      return false;
    }

    if (!move) {
      return false;
    }

    applyCommittedMove(ruleGame, {
      from,
      to,
      promotion: move.promotion,
      san: move.san,
    });

    return true;
  };

  return {
    applyLegalMove,
    onSquareClick,
    onDragStart,
    onDrop,
    onDropOutside,
    reset,
    undo,
    flip,
    setTurn,
    setCastlingRights,
    clearAllPieces,
    setFreeStyleMode,
    applySuggestedMove,
  };
};