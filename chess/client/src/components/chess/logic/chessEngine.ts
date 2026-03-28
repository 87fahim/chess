import { Chess as ChessJS } from "chess.js";

export type Board = string[][];
export type SquarePosition = { row: number; col: number };

export const engine = new ChessJS();

export const getBoard = (): Board => {
  const boardState = engine.board();
  return boardState.map((rank) => rank.map((square) => (square ? `${square.color}${square.type}` : "")));
};

export const makeMove = (from: string, to: string, promotion = "q") => {
  return engine.move({ from, to, promotion });
};


