import { GameMode } from "./chessPanel.types";

export type ChessUiState = {
  gameMode: GameMode;
  computerGameConfigured: boolean;
  playerColor: "white" | "black";
  computerLevel: number;
};

type ChessUiAction =
  | { type: "set-game-mode"; payload: GameMode }
  | { type: "set-computer-configured"; payload: boolean }
  | { type: "set-player-color"; payload: "white" | "black" }
  | { type: "set-computer-level"; payload: number };

export const initialChessUiState: ChessUiState = {
  gameMode: "practice",
  computerGameConfigured: false,
  playerColor: "white",
  computerLevel: 1000,
};

export const chessUiReducer = (state: ChessUiState, action: ChessUiAction): ChessUiState => {
  switch (action.type) {
    case "set-game-mode":
      return { ...state, gameMode: action.payload };
    case "set-computer-configured":
      return { ...state, computerGameConfigured: action.payload };
    case "set-player-color":
      return { ...state, playerColor: action.payload };
    case "set-computer-level":
      return { ...state, computerLevel: action.payload };
    default:
      return state;
  }
};
