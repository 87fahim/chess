import { createContext, ReactNode, useContext } from "react";
import { CastlingRights, GameMode } from "./chessPanel.types";

export type ChessPanelStateContextValue = {
  gameMode: GameMode;
  computerLevel: number;
  computerLevelLocked: boolean;
  computerGameConfigured: boolean;
  computerSetupRequired: boolean;
  turn: "white" | "black";
  castlingRights: CastlingRights;
  freeStyle: boolean;
  allowUndo: boolean;
  allowReset: boolean;
  allowFlip: boolean;
  allowClearAll: boolean;
  nextMoveLoading: boolean;
  nextMoveDisabled: boolean;
  nextMoveDisabledReason?: string;
  suggestedMoveText?: string;
  nextMoveError?: string;
  moveCount: number;
  showMoveList: boolean;
  canRequestNextMove: boolean;
  canApplySuggestedMove: boolean;
};

export type ChessPanelActionsContextValue = {
  onGameModeChange: (mode: GameMode) => void;
  onStartComputerGame: (color: "white" | "black") => void;
  onComputerLevelChange: (level: number) => void;
  onTurnChange: (turn: "white" | "black") => void;
  onCastlingChange: (rights: CastlingRights) => void;
  onUndo: () => void;
  onReset: () => void;
  onFlip: () => void;
  onClearAll: () => void;
  onNextMove: () => void;
  onApplySuggestedMove: () => void;
  onOpenMoves: () => void;
};

const ChessPanelStateContext = createContext<ChessPanelStateContextValue | null>(null);
const ChessPanelActionsContext = createContext<ChessPanelActionsContextValue | null>(null);

type ChessPanelProviderProps = {
  state: ChessPanelStateContextValue;
  actions: ChessPanelActionsContextValue;
  children: ReactNode;
};

export function ChessPanelProvider({ state, actions, children }: ChessPanelProviderProps) {
  return (
    <ChessPanelStateContext.Provider value={state}>
      <ChessPanelActionsContext.Provider value={actions}>{children}</ChessPanelActionsContext.Provider>
    </ChessPanelStateContext.Provider>
  );
}

export function useChessPanelState() {
  const ctx = useContext(ChessPanelStateContext);
  if (!ctx) {
    throw new Error("useChessPanelState must be used inside ChessPanelProvider.");
  }
  return ctx;
}

export function useChessPanelActions() {
  const ctx = useContext(ChessPanelActionsContext);
  if (!ctx) {
    throw new Error("useChessPanelActions must be used inside ChessPanelProvider.");
  }
  return ctx;
}
