import { ChessMovePayload, GameResult } from "../Chess.types";

export type GameTurn = "white" | "black";

export type LastMove = {
  from: string;
  to: string;
};

export type UseChessGameOptions = {
  initialFen?: string;
  orientation?: GameTurn;
  onMove?: (move: ChessMovePayload) => void;
  onGameEnd?: (result: GameResult) => void;
};

export type EditSnapshot = {
  board: string[][];
  fen: string;
  whitePieces: string[];
  blackPieces: string[];
  moveHistory: ChessMovePayload[];
};

export type FreeStyleValidation = {
  isValid: boolean;
  errors: string[];
};

export type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};