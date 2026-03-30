import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { ChessMovePayload } from "../Chess.types";
import { startFENtoBoard } from "../logic/boardMapper";
import {
  DEFAULT_BLACK_PIECES,
  DEFAULT_WHITE_PIECES,
  getCastlingRightsFromFen,
  getGameFromFen,
  getStatusFromGame,
  getTurnFromFen,
  getValidMoves,
  validateFreeStylePosition,
} from "./useChessGame.helpers";
import { createChessGameActions } from "./useChessGame.actions";
import { EditSnapshot, FreeStyleValidation, LastMove, UseChessGameOptions } from "./useChessGame.types";

export default function useChessGame({
  initialFen = "start",
  orientation = "white",
  onMove,
  onGameEnd,
}: UseChessGameOptions) {
  const [selectedSquare, setSelectedSquare] = useState<string | undefined>();
  const [moveHistory, setMoveHistory] = useState<ChessMovePayload[]>([]);
  const [fen, setFen] = useState<string>(
    () => new Chess(initialFen === "start" ? undefined : initialFen).fen()
  );
  const [board, setBoard] = useState<string[][]>(() => {
    const startFen = new Chess(initialFen === "start" ? undefined : initialFen).fen();
    return startFENtoBoard(startFen);
  });
  const [editHistory, setEditHistory] = useState<EditSnapshot[]>([]);
  const [lastMove, setLastMove] = useState<LastMove | undefined>();
  const [freeStyle, setFreeStyle] = useState(true);
  const [whitePieces, setWhitePieces] = useState<string[]>(DEFAULT_WHITE_PIECES);
  const [blackPieces, setBlackPieces] = useState<string[]>(DEFAULT_BLACK_PIECES);

  const currentGame = getGameFromFen(fen);

  const freeStyleValidation: FreeStyleValidation = useMemo(
    () => validateFreeStylePosition(board, fen, freeStyle),
    [board, fen, freeStyle]
  );

  const turn = getTurnFromFen(fen);
  const status = getStatusFromGame(currentGame, fen);
  const validMoves: string[] = getValidMoves(currentGame, freeStyle, selectedSquare);

  const {
    onSquareClick,
    undo,
    reset,
    flip,
    onDragStart,
    onDrop,
    onDropOutside,
    setFreeStyleMode,
    setTurn,
    setCastlingRights,
    clearAllPieces,
    applySuggestedMove,
  } = createChessGameActions({
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
  });

  return {
    board,
    fen,
    freeStyle,
    turn,
    status,
    selectedSquare,
    validMoves,
    moveHistory,
    lastMove,
    onSquareClick,
    undo,
    reset,
    flip,
    whitePieces,
    blackPieces,
    onDragStart,
    onDrop,
    onDropOutside,
    castlingRights: getCastlingRightsFromFen(fen),
    setFreeStyleMode,
    setTurn,
    setCastlingRights,
    clearAllPieces,
    freeStyleValidation,
    applySuggestedMove,
  };
}