import { Chess } from "chess.js";
import thirdPartyArbiter from "./arbiter";

export type RulesEngineName = "current" | "third-party";

export type RulesEngine = {
  getValidMoves: (fen: string, selectedSquare?: string) => string[];
  isCheckmate: (fen: string) => boolean;
  isStalemate: (fen: string) => boolean;
  insufficientMaterial: (fen: string) => boolean;
};

type CastleDirection = "both" | "left" | "right" | "none";

const squareToCoordsThirdParty = (square: string): [number, number] => {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10);
  return [rank - 1, file];
};

const coordsToSquareThirdParty = (row: number, col: number): string => {
  return `${String.fromCharCode(97 + col)}${row + 1}`;
};

const getCastleDirection = (castlingPart: string, side: "w" | "b"): CastleDirection => {
  const kingSide = side === "w" ? "K" : "k";
  const queenSide = side === "w" ? "Q" : "q";
  const hasKingSide = castlingPart.includes(kingSide);
  const hasQueenSide = castlingPart.includes(queenSide);

  if (hasKingSide && hasQueenSide) return "both";
  if (hasQueenSide) return "left";
  if (hasKingSide) return "right";
  return "none";
};

const fenToThirdPartyPosition = (fen: string): string[][] | null => {
  try {
    const game = new Chess(fen);
    return game
      .board()
      .map((rank) => rank.map((square) => (square ? `${square.color}${square.type}` : "")))
      .reverse();
  } catch {
    return null;
  }
};

const currentEngine: RulesEngine = {
  getValidMoves: (fen, selectedSquare) => {
    if (!selectedSquare) {
      return [];
    }

    try {
      const game = new Chess(fen);
      return (game.moves({ square: selectedSquare as any, verbose: true }) as any[]).map(
        (move) => move.to ?? move.san ?? ""
      );
    } catch {
      return [];
    }
  },
  isCheckmate: (fen) => {
    try {
      return new Chess(fen).isCheckmate();
    } catch {
      return false;
    }
  },
  isStalemate: (fen) => {
    try {
      return new Chess(fen).isStalemate();
    } catch {
      return false;
    }
  },
  insufficientMaterial: (fen) => {
    try {
      return new Chess(fen).isInsufficientMaterial();
    } catch {
      return false;
    }
  },
};

const thirdPartyEngine: RulesEngine = {
  getValidMoves: (fen, selectedSquare) => {
    if (!selectedSquare) {
      return [];
    }

    const position = fenToThirdPartyPosition(fen);
    if (!position) {
      return [];
    }

    const [row, col] = squareToCoordsThirdParty(selectedSquare);
    const piece = position[row]?.[col];
    if (!piece) {
      return [];
    }

    const castlingPart = fen.split(" ")[2] ?? "-";
    const castleDirection = {
      w: getCastleDirection(castlingPart, "w"),
      b: getCastleDirection(castlingPart, "b"),
    };

    const moves = thirdPartyArbiter.getValidMoves({
      position,
      castleDirection,
      prevPosition: undefined,
      piece,
      rank: row,
      file: col,
    });

    return moves.map(([x, y]) => coordsToSquareThirdParty(x, y));
  },
  isCheckmate: (fen) => {
    const position = fenToThirdPartyPosition(fen);
    if (!position) {
      return false;
    }

    const turn = (fen.split(" ")[1] ?? "w") as "w" | "b";
    const castlingPart = fen.split(" ")[2] ?? "-";
    const castleDirection = {
      w: getCastleDirection(castlingPart, "w"),
      b: getCastleDirection(castlingPart, "b"),
    };

    return thirdPartyArbiter.isCheckMate(position, turn, castleDirection[turn]);
  },
  isStalemate: (fen) => {
    const position = fenToThirdPartyPosition(fen);
    if (!position) {
      return false;
    }

    const turn = (fen.split(" ")[1] ?? "w") as "w" | "b";
    const castlingPart = fen.split(" ")[2] ?? "-";
    const castleDirection = {
      w: getCastleDirection(castlingPart, "w"),
      b: getCastleDirection(castlingPart, "b"),
    };

    return thirdPartyArbiter.isStalemate(position, turn, castleDirection[turn]);
  },
  insufficientMaterial: (fen) => {
    const position = fenToThirdPartyPosition(fen);
    if (!position) {
      return false;
    }

    return thirdPartyArbiter.insufficientMaterial(position);
  },
};

const resolveEngineName = (): RulesEngineName => {
  const processFlag =
    typeof process !== "undefined" && process.env
      ? process.env.VITE_CHESS_RULES_ENGINE
      : undefined;
  const runtimeFlag = (globalThis as any).__CHESS_RULES_ENGINE__ as string | undefined;
  const raw = String(processFlag || runtimeFlag || "current").toLowerCase();
  return raw === "third-party" ? "third-party" : "current";
};

export const getRulesEngineName = (): RulesEngineName => resolveEngineName();

export const getRulesEngine = (engineName: RulesEngineName = resolveEngineName()): RulesEngine => {
  return engineName === "third-party" ? thirdPartyEngine : currentEngine;
};
