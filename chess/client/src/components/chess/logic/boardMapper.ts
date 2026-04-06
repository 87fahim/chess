import type { Board } from "../types/board";

export const startFENtoBoard = (fen: string): Board => {
  const rows = fen.split(" ")[0].split("/");
  const board = rows.map((rank) => {
    const row: string[] = [];

    for (const char of rank) {
      const emptyCount = Number(char);
      if (!Number.isNaN(emptyCount) && emptyCount > 0) {
        row.push(...Array(emptyCount).fill(""));
      } else {
        const color = char === char.toUpperCase() ? "w" : "b";
        const piece = char.toLowerCase();
        row.push(`${color}${piece}`);
      }
    }

    if (row.length !== 8) {
      throw new Error(`Invalid FEN rank '${rank}': ${row.length} columns`) ;
    }

    return row;
  });

  if (board.length !== 8) {
    throw new Error(`Invalid FEN board: ${board.length} ranks`);
  }

  return board;
};


