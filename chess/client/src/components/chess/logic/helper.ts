export const areSameColorTiles = (coords1: { x: number; y: number }, coords2: { x: number; y: number }) =>
  (coords1.x + coords1.y) % 2 === (coords2.x + coords2.y) % 2;

export const findPieceCoords = (position: string[][], type: string) => {
  const results: Array<{ x: number; y: number }> = [];
  position.forEach((rank, i) => {
    rank.forEach((piece, j) => {
      if (piece === type) {
        results.push({ x: i, y: j });
      }
    });
  });
  return results;
};

export const copyPosition = (position: string[][]) => {
  const newPosition = new Array(8).fill("").map(() => new Array(8).fill(""));
  for (let rank = 0; rank < position.length; rank++) {
    for (let file = 0; file < position[0].length; file++) {
      newPosition[rank][file] = position[rank][file];
    }
  }
  return newPosition;
};
