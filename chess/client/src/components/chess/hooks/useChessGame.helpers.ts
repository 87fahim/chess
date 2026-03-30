import { Chess } from "chess.js";
import { GameResult } from "../Chess.types";
import { CastlingRights, FreeStyleValidation, GameTurn } from "./useChessGame.types";
import { getRulesEngine } from "../logic/rulesAdapter";

export const DEFAULT_WHITE_PIECES = ["wp", "wn", "wb", "wr", "wq", "wk"];
export const DEFAULT_BLACK_PIECES = ["bp", "bn", "bb", "br", "bq", "bk"];

export const getGameFromFen = (fenValue: string): Chess | null => {
  try {
    return new Chess(fenValue);
  } catch {
    return null;
  }
};

export const getTurnFromFen = (fen: string): GameTurn =>
  fen.split(" ")[1] === "w" ? "white" : "black";

export const getStatusFromGame = (game: Chess | null, fen: string): "checkmate" | "stalemate" | "check" | "ongoing" => {
  if (!game) {
    return "ongoing";
  }

  const rulesEngine = getRulesEngine();

  if (rulesEngine.isCheckmate(fen)) {
    return "checkmate";
  }

  if (rulesEngine.isStalemate(fen)) {
    return "stalemate";
  }

  if (game.isCheck()) {
    return "check";
  }

  return "ongoing";
};

export const getValidMoves = (game: Chess | null, freeStyle: boolean, selectedSquare?: string): string[] => {
  if (freeStyle || !selectedSquare || !game) {
    return [];
  }

  return getRulesEngine().getValidMoves(game.fen(), selectedSquare);
};

export const squareToCoords = (square: string): [number, number] => {
  const col = square.charCodeAt(0) - 97;
  const row = 8 - parseInt(square[1], 10);
  return [row, col];
};

const getSanitizedCastling = (boardState: string[][], currentFen: string): string => {
  const currentCastling = currentFen.split(" ")[2] || "-";
  let castling = "";

  if (boardState[7][4] === "wk") {
    if (currentCastling.includes("K") && boardState[7][7] === "wr") castling += "K";
    if (currentCastling.includes("Q") && boardState[7][0] === "wr") castling += "Q";
  }

  if (boardState[0][4] === "bk") {
    if (currentCastling.includes("k") && boardState[0][7] === "br") castling += "k";
    if (currentCastling.includes("q") && boardState[0][0] === "br") castling += "q";
  }

  return castling || "-";
};

export const boardToFen = (
  boardState: string[][],
  currentFen: string,
  options?: { castling?: string; sanitizeCastling?: boolean }
): string => {
  let fenString = "";

  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;

    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece === "") {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fenString += emptyCount;
          emptyCount = 0;
        }

        const type = piece[1].toUpperCase();
        fenString += piece[0] === "w" ? type : type.toLowerCase();
      }
    }

    if (emptyCount > 0) {
      fenString += emptyCount;
    }

    if (row < 7) {
      fenString += "/";
    }
  }

  const currentParts = currentFen.split(" ");
  const currentTurn = currentParts[1] || "w";
  const castling = options?.sanitizeCastling
    ? getSanitizedCastling(boardState, currentFen)
    : (options?.castling ?? currentParts[2] ?? "KQkq");
  const enPassant = currentParts[3] || "-";
  const halfmove = currentParts[4] || "0";
  const fullmove = currentParts[5] || "1";

  fenString += ` ${currentTurn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;

  return fenString;
};

export const getCastlingRightsFromFen = (fen: string): CastlingRights => {
  const parts = fen.split(" ");
  const castling = parts[2] || "-";
  return {
    whiteKingSide: castling.includes("K"),
    whiteQueenSide: castling.includes("Q"),
    blackKingSide: castling.includes("k"),
    blackQueenSide: castling.includes("q"),
  };
};

export const validateFreeStylePosition = (
  board: string[][],
  fen: string,
  freeStyle: boolean
): FreeStyleValidation => {
  if (!freeStyle) {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];
  const counts: Record<string, number> = {
    wk: 0,
    wq: 0,
    wr: 0,
    wb: 0,
    wn: 0,
    wp: 0,
    bk: 0,
    bq: 0,
    br: 0,
    bb: 0,
    bn: 0,
    bp: 0,
  };

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) {
        continue;
      }

      if (counts[piece] === undefined) {
        errors.push(`Unsupported piece code at ${String.fromCharCode(97 + col)}${8 - row}.`);
        continue;
      }

      counts[piece] += 1;

      if ((piece === "wp" || piece === "bp") && (row === 0 || row === 7)) {
        errors.push("Pawns cannot be placed on the first or last rank.");
      }
    }
  }

  const whiteTotal = counts.wp + counts.wn + counts.wb + counts.wr + counts.wq + counts.wk;
  const blackTotal = counts.bp + counts.bn + counts.bb + counts.br + counts.bq + counts.bk;

  if (counts.wk !== 1) errors.push("White must have exactly one king.");
  if (counts.bk !== 1) errors.push("Black must have exactly one king.");
  if (counts.wp > 8) errors.push("White cannot have more than 8 pawns.");
  if (counts.bp > 8) errors.push("Black cannot have more than 8 pawns.");
  if (whiteTotal > 16) errors.push("White cannot have more than 16 pieces.");
  if (blackTotal > 16) errors.push("Black cannot have more than 16 pieces.");

  if (!getGameFromFen(fen)) {
    errors.push("The position is not a valid chess FEN.");
  }

  return {
    isValid: errors.length === 0,
    errors: [...new Set(errors)],
  };
};

export const createGameResult = (ruleGame: Chess, activeTurn: GameTurn): GameResult => ({
  result: getRulesEngine().isCheckmate(ruleGame.fen())
    ? activeTurn === "white"
      ? "black"
      : "white"
    : (ruleGame.isDraw() || getRulesEngine().insufficientMaterial(ruleGame.fen()))
      ? "draw"
      : "ongoing",
  check: ruleGame.isCheck(),
  checkmate: getRulesEngine().isCheckmate(ruleGame.fen()),
  stalemate: getRulesEngine().isStalemate(ruleGame.fen()),
});

export const parseUciMove = (uciMove: string): { from: string; to: string; promotion: string } | null => {
  const trimmed = uciMove.trim().toLowerCase();
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(trimmed)) {
    return null;
  }

  return {
    from: trimmed.slice(0, 2),
    to: trimmed.slice(2, 4),
    promotion: trimmed.length === 5 ? trimmed[4] : "q",
  };
};