export type BoardOrientation = "white" | "black";
export type ChessMovePayload = {
    from: string;
    to: string;
    promotion?: string;
    san?: string;
};
export type GameResult = {
  result: "white" | "black" | "draw" | "ongoing";
  check?: boolean;
  checkmate?: boolean;
  stalemate?: boolean;
};

export type ChessProps = {
  initialFen?: string;
  orientation?: BoardOrientation;
  showCoordinates?: boolean;
  showMoveList?: boolean;
  allowUndo?: boolean;
  allowReset?: boolean;
  allowFlip?: boolean;
  showGameOptions?: boolean;
  interactive?: boolean;
  onMove?: (move: ChessMovePayload) => void;
  onGameEnd?: (result: GameResult) => void;
  className?: string;
};
