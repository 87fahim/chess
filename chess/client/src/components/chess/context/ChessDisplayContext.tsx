import { createContext, ReactNode, useContext } from "react";
import { PieceColorPreset } from "../components/GameOptions";

export type SquarePatternPreset = "none" | "classic" | "soft" | "premium" | "three-d" | "strip";

export type ChessDisplayState = {
  lightSquareColor: string;
  darkSquareColor: string;
  whitePieceColor: PieceColorPreset;
  blackPieceColor: PieceColorPreset;
  squarePattern: SquarePatternPreset;
  squarePatternOpacity: number;
};

type ChessDisplayAction =
  | { type: "set-light-square-color"; payload: string }
  | { type: "set-dark-square-color"; payload: string }
  | { type: "set-white-piece-color"; payload: PieceColorPreset }
  | { type: "set-black-piece-color"; payload: PieceColorPreset }
  | { type: "set-square-pattern"; payload: SquarePatternPreset }
  | { type: "set-square-pattern-opacity"; payload: number };

export const initialChessDisplayState: ChessDisplayState = {
  lightSquareColor: "#f0e6d2",
  darkSquareColor: "#b58863",
  whitePieceColor: "classic",
  blackPieceColor: "classic",
  squarePattern: "none",
  squarePatternOpacity: 0.3,
};

export const chessDisplayReducer = (
  state: ChessDisplayState,
  action: ChessDisplayAction
): ChessDisplayState => {
  switch (action.type) {
    case "set-light-square-color":
      return { ...state, lightSquareColor: action.payload };
    case "set-dark-square-color":
      return { ...state, darkSquareColor: action.payload };
    case "set-white-piece-color":
      return { ...state, whitePieceColor: action.payload };
    case "set-black-piece-color":
      return { ...state, blackPieceColor: action.payload };
    case "set-square-pattern":
      return { ...state, squarePattern: action.payload };
    case "set-square-pattern-opacity":
      return { ...state, squarePatternOpacity: action.payload };
    default:
      return state;
  }
};

export type ChessDisplayActionsContextValue = {
  setLightSquareColor: (value: string) => void;
  setDarkSquareColor: (value: string) => void;
  setWhitePieceColor: (value: PieceColorPreset) => void;
  setBlackPieceColor: (value: PieceColorPreset) => void;
  setSquarePattern: (value: SquarePatternPreset) => void;
  setSquarePatternOpacity: (value: number) => void;
};

const ChessDisplayStateContext = createContext<ChessDisplayState | null>(null);
const ChessDisplayActionsContext = createContext<ChessDisplayActionsContextValue | null>(null);

type ChessDisplayProviderProps = {
  state: ChessDisplayState;
  actions: ChessDisplayActionsContextValue;
  children: ReactNode;
};

export function ChessDisplayProvider({ state, actions, children }: ChessDisplayProviderProps) {
  return (
    <ChessDisplayStateContext.Provider value={state}>
      <ChessDisplayActionsContext.Provider value={actions}>{children}</ChessDisplayActionsContext.Provider>
    </ChessDisplayStateContext.Provider>
  );
}

export function useChessDisplayState() {
  const ctx = useContext(ChessDisplayStateContext);
  if (!ctx) {
    throw new Error("useChessDisplayState must be used inside ChessDisplayProvider.");
  }
  return ctx;
}

export function useChessDisplayActions() {
  const ctx = useContext(ChessDisplayActionsContext);
  if (!ctx) {
    throw new Error("useChessDisplayActions must be used inside ChessDisplayProvider.");
  }
  return ctx;
}
