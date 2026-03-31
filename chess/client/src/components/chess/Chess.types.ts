export type BoardOrientation = "white" | "black";
export type PieceColorPreset = "classic" | "sapphire" | "emerald" | "ruby" | "gold";

export type ChessAppearanceSettings = {
  lightSquareColor: string;
  darkSquareColor: string;
  whitePieceColor: PieceColorPreset;
  blackPieceColor: PieceColorPreset;
};

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
  externalGameMode?: "vs-computer" | "vs-player" | "practice" | "online";
  boardZoom?: number;
  onBoardZoomChange?: (nextZoom: number) => void;
  appearanceSettings?: ChessAppearanceSettings;
  interactive?: boolean;
  onMove?: (move: ChessMovePayload) => void;
  onGameEnd?: (result: GameResult) => void;
  className?: string;
};
