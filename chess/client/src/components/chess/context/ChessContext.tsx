import { createContext, ReactNode, useContext } from "react";
import { BoardOrientation } from "../Chess.types";
import type { Board } from "../types/board";

export type ChessBoardStateContextValue = {
	board: Board;
	selectedSquare?: string;
	validMoves: string[];
	lastMove?: { from: string; to: string };
	checkedKingSquare?: string;
	orientation: BoardOrientation;
	freeStyle: boolean;
	showCoordinates: boolean;
	interactive: boolean;
	whitePieces: string[];
	blackPieces: string[];
};

export type ChessBoardActionsContextValue = {
	onSquareClick: (square: string) => void;
	onDragStart: (piece: string, fromSquare?: string, fromOutside?: boolean) => void;
	onDrop: (
		toSquare: string,
		draggedPiece: string,
		fromSquare?: string,
		fromOutside?: boolean
	) => void;
	onDropOutside: (
		draggedPiece: string,
		fromSquare?: string,
		fromOutside?: boolean
	) => void;
};

const ChessBoardStateContext = createContext<ChessBoardStateContextValue | null>(null);
const ChessBoardActionsContext = createContext<ChessBoardActionsContextValue | null>(null);

type ChessBoardProviderProps = {
	state: ChessBoardStateContextValue;
	actions: ChessBoardActionsContextValue;
	children: ReactNode;
};

export function ChessBoardProvider({ state, actions, children }: ChessBoardProviderProps) {
	return (
		<ChessBoardStateContext.Provider value={state}>
			<ChessBoardActionsContext.Provider value={actions}>{children}</ChessBoardActionsContext.Provider>
		</ChessBoardStateContext.Provider>
	);
}

export function useChessBoardState() {
	const ctx = useContext(ChessBoardStateContext);
	if (!ctx) {
		throw new Error("useChessBoardState must be used inside ChessBoardProvider.");
	}
	return ctx;
}

export function useChessBoardActions() {
	const ctx = useContext(ChessBoardActionsContext);
	if (!ctx) {
		throw new Error("useChessBoardActions must be used inside ChessBoardProvider.");
	}
	return ctx;
}
