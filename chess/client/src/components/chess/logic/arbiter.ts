import { areSameColorTiles, findPieceCoords } from "./helper";
import {
  getBishopMoves,
  getCastlingMoves,
  getKingMoves,
  getKingPosition,
  getKnightMoves,
  getPawnCaptures,
  getPawnMoves,
  getPieces,
  getQueenMoves,
  getRookMoves,
} from "./getMoves";
import { movePawn, movePiece } from "./move";

type CastleDirection = "both" | "left" | "right" | "none";

const arbiter = {
  getRegularMoves({ position, piece, rank, file }: { position: string[][]; piece: string; rank: number; file: number }) {
    if (piece.endsWith("n")) return getKnightMoves({ position, rank, file });
    if (piece.endsWith("b")) return getBishopMoves({ position, piece, rank, file });
    if (piece.endsWith("r")) return getRookMoves({ position, piece, rank, file });
    if (piece.endsWith("q")) return getQueenMoves({ position, piece, rank, file });
    if (piece.endsWith("k")) return getKingMoves({ position, piece, rank, file });
    if (piece.endsWith("p")) return getPawnMoves({ position, piece, rank, file });
    return [];
  },

  getValidMoves({
    position,
    castleDirection,
    prevPosition,
    piece,
    rank,
    file,
  }: {
    position: string[][];
    castleDirection: { w: CastleDirection; b: CastleDirection };
    prevPosition?: string[][];
    piece: string;
    rank: number;
    file: number;
  }) {
    let moves = this.getRegularMoves({ position, piece, rank, file });
    const notInCheckMoves: number[][] = [];

    if (piece.endsWith("p")) {
      moves = [...moves, ...getPawnCaptures({ position, prevPosition, piece, rank, file })];
    }
    if (piece.endsWith("k")) {
      moves = [...moves, ...getCastlingMoves({ position, castleDirection: castleDirection[piece[0] as "w" | "b"], piece, rank, file })];
    }

    moves.forEach(([x, y]) => {
      const positionAfterMove = this.performMove({ position, piece, rank, file, x, y });
      if (!this.isPlayerInCheck({ positionAfterMove, position, player: piece[0] })) {
        notInCheckMoves.push([x, y]);
      }
    });

    return notInCheckMoves;
  },

  isPlayerInCheck({ positionAfterMove, position, player }: { positionAfterMove: string[][]; position?: string[][]; player: string }) {
    const enemy = player.startsWith("w") ? "b" : "w";
    const kingPos = getKingPosition(positionAfterMove, player);
    const enemyPieces = getPieces(positionAfterMove, enemy);

    const enemyMoves = enemyPieces.reduce<number[][]>(
      (acc, p) => [
        ...acc,
        ...(p.piece.endsWith("p")
          ? getPawnCaptures({ position: positionAfterMove, prevPosition: position, ...p })
          : this.getRegularMoves({ position: positionAfterMove, ...p })),
      ],
      []
    );

    return enemyMoves.some(([x, y]) => kingPos && kingPos[0] === x && kingPos[1] === y);
  },

  performMove({
    position,
    piece,
    rank,
    file,
    x,
    y,
  }: {
    position: string[][];
    piece: string;
    rank: number;
    file: number;
    x: number;
    y: number;
  }) {
    if (piece.endsWith("p")) return movePawn({ position, piece, rank, file, x, y });
    return movePiece({ position, piece, rank, file, x, y });
  },

  isStalemate(position: string[][], player: "w" | "b", castleDirection: CastleDirection) {
    const isInCheck = this.isPlayerInCheck({ positionAfterMove: position, player });
    if (isInCheck) return false;

    const pieces = getPieces(position, player);
    const moves = pieces.reduce<number[][]>(
      (acc, p) => [...acc, ...this.getValidMoves({ position, castleDirection: { w: castleDirection, b: castleDirection }, ...p })],
      []
    );

    return !isInCheck && moves.length === 0;
  },

  insufficientMaterial(position: string[][]) {
    const pieces = position.reduce<string[]>((acc, rank) => [...acc, ...rank.filter((spot) => spot)], []);

    if (pieces.length === 2) return true;
    if (pieces.length === 3 && pieces.some((p) => p.endsWith("b") || p.endsWith("n"))) return true;

    if (
      pieces.length === 4 &&
      pieces.every((p) => p.endsWith("b") || p.endsWith("k")) &&
      new Set(pieces).size === 4 &&
      areSameColorTiles(findPieceCoords(position, "wb")[0], findPieceCoords(position, "bb")[0])
    ) {
      return true;
    }

    return false;
  },

  isCheckMate(position: string[][], player: "w" | "b", castleDirection: CastleDirection) {
    const isInCheck = this.isPlayerInCheck({ positionAfterMove: position, player });
    if (!isInCheck) return false;

    const pieces = getPieces(position, player);
    const moves = pieces.reduce<number[][]>(
      (acc, p) => [...acc, ...this.getValidMoves({ position, castleDirection: { w: castleDirection, b: castleDirection }, ...p })],
      []
    );

    return isInCheck && moves.length === 0;
  },
};

export default arbiter;
