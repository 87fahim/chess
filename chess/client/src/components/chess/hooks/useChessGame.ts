// import { useState } from "react";
// import { Chess } from "chess.js";
// import { ChessMovePayload, GameResult } from "../Chess.types";
// import { startFENtoBoard } from "../logic/boardMapper";

// type UseChessGameOptions = { initialFen?: string; orientation?: "white" | "black"; onMove?: (move: ChessMovePayload) => void; onGameEnd?: (result: GameResult) => void; };

// export default function useChessGame({ initialFen = "start", orientation = "white", onMove, onGameEnd, }: UseChessGameOptions) {
//   const [game] = useState(() => new Chess(initialFen === "start" ? undefined : initialFen));
//   const [selectedSquare, setSelectedSquare] = useState<string | undefined>();
//   const [moveHistory, setMoveHistory] = useState<ChessMovePayload[]>([]);
//   const [fen, setFen] = useState<string>(game.fen());
//   const [board, setBoard] = useState<string[][]>(() => startFENtoBoard(fen));
//   const [whitePieces, setWhitePieces] = useState<string[]>(["wp", "wn", "wb", "wr", "wq", "wk"]);
//   const [blackPieces, setBlackPieces] = useState<string[]>(["bp", "bn", "bb", "br", "bq", "bk"]);

//   const turn = game.turn() === "w" ? "white" : "black";
//   const status = game.isCheckmate() ? "checkmate" : game.isStalemate() ? "stalemate" : game.isCheck() ? "check" : "ongoing";
  
//   const validMoves: string[] = selectedSquare 
//     ? (game.moves({ square: selectedSquare as any, verbose: true }) as any[]).map((m) => m.to ?? m.san ?? "")
//     : [];

//   const onSquareClick = (square: string) => {
//     if (selectedSquare && selectedSquare !== square) {
//       const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
//       if (move) {
//         const payload: ChessMovePayload = { from: selectedSquare, to: square, promotion: move.promotion, san: move.san };
//         setMoveHistory((d) => [...d, payload]);
//         setSelectedSquare(undefined);
//         setFen(game.fen());
//         setBoard(startFENtoBoard(game.fen()));
//         onMove?.(payload);

//         const result: GameResult = {
//           result: game.isCheckmate() ? (turn === "white" ? "black" : "white") : game.isDraw() ? "draw" : "ongoing",
//           check: game.isCheck(),
//           checkmate: game.isCheckmate(),
//           stalemate: game.isStalemate(),
//         };
//         onGameEnd?.(result);
//       } else {
//         setSelectedSquare(square);
//       }
//     } else {
//       setSelectedSquare(square);
//     }
//   };

//   const onDragStart = (piece: string, fromSquare?: string, fromOutside?: boolean) => {
//     // Store drag data
//   };

//   const onDrop = (toSquare: string, draggedPiece: string, fromSquare?: string, fromOutside?: boolean) => {
//     const [toRow, toCol] = squareToCoords(toSquare);
//     const existingPiece = board[toRow][toCol];

//     if (existingPiece && existingPiece[0] === draggedPiece[0]) {
//       // Same color, do nothing
//       return;
//     }

//     // Update board
//     const newBoard = board.map(row => [...row]);
//     newBoard[toRow][toCol] = draggedPiece;

//     // Remove from source
//     if (fromSquare) {
//       const [fromRow, fromCol] = squareToCoords(fromSquare);
//       newBoard[fromRow][fromCol] = "";
//     }

//     setBoard(newBoard);
//     setSelectedSquare(undefined);
//   };

//   const onDropOutside = (draggedPiece: string, fromSquare?: string, fromOutside?: boolean) => {
//     // Remove piece
//     if (fromSquare) {
//       const [fromRow, fromCol] = squareToCoords(fromSquare);
//       const newBoard = board.map(row => [...row]);
//       newBoard[fromRow][fromCol] = "";
//       setBoard(newBoard);
//     } else if (fromOutside) {
//       if (draggedPiece.startsWith("w")) {
//         setWhitePieces(prev => prev.filter(p => p !== draggedPiece));
//       } else {
//         setBlackPieces(prev => prev.filter(p => p !== draggedPiece));
//       }
//     }
//   };

//   const squareToCoords = (square: string): [number, number] => {
//     const col = square.charCodeAt(0) - 97;
//     const row = 8 - parseInt(square[1]);
//     return [row, col];
//   };

//   const reset = () => {
//     game.reset();
//     setSelectedSquare(undefined);
//     setMoveHistory([]);
//     setFen(game.fen());
//     setBoard(startFENtoBoard(game.fen()));
//     setWhitePieces(["wp", "wn", "wb", "wr", "wq", "wk"]);
//     setBlackPieces(["bp", "bn", "bb", "br", "bq", "bk"]);
//   };

//   const undo = () => {
//     game.undo();
//     setSelectedSquare(undefined);
//     setMoveHistory((prev) => prev.slice(0, -1));
//     setFen(game.fen());
//     setBoard(startFENtoBoard(game.fen()));
//   };

//   return { board, turn, status, selectedSquare, validMoves, moveHistory, onSquareClick, undo, reset, whitePieces, blackPieces, onDragStart, onDrop, onDropOutside };
// }

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { ChessMovePayload, GameResult } from "../Chess.types";
import { startFENtoBoard } from "../logic/boardMapper";

type UseChessGameOptions = {
  initialFen?: string;
  orientation?: "white" | "black";
  onMove?: (move: ChessMovePayload) => void;
  onGameEnd?: (result: GameResult) => void;
};

type EditSnapshot = {
  board: string[][];
  fen: string;
  whitePieces: string[];
  blackPieces: string[];
  moveHistory: ChessMovePayload[];
};

type FreeStyleValidation = {
  isValid: boolean;
  errors: string[];
};

export default function useChessGame({
  initialFen = "start",
  orientation = "white",
  onMove,
  onGameEnd,
}: UseChessGameOptions) {
  const [selectedSquare, setSelectedSquare] = useState<string | undefined>();
  const [moveHistory, setMoveHistory] = useState<ChessMovePayload[]>([]);
  const [fen, setFen] = useState<string>(
    () => new Chess(initialFen === "start" ? undefined : initialFen).fen()
  );
  const [board, setBoard] = useState<string[][]>(() => {
    const startFen = new Chess(initialFen === "start" ? undefined : initialFen).fen();
    return startFENtoBoard(startFen);
  });
  const [editHistory, setEditHistory] = useState<EditSnapshot[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>();
  const [freeStyle, setFreeStyle] = useState(true);
  const [whitePieces, setWhitePieces] = useState<string[]>([
    "wp",
    "wn",
    "wb",
    "wr",
    "wq",
    "wk",
  ]);
  const [blackPieces, setBlackPieces] = useState<string[]>([
    "bp",
    "bn",
    "bb",
    "br",
    "bq",
    "bk",
  ]);

  const getGameFromFen = (fenValue: string): Chess | null => {
    try {
      return new Chess(fenValue);
    } catch {
      return null;
    }
  };

  const currentGame = getGameFromFen(fen);

  const freeStyleValidation: FreeStyleValidation = useMemo(() => {
    if (!freeStyle) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];
    const counts: Record<string, number> = {
      wk: 0,
      wq: 0,
      wr: 0,
      wb: 0,
      wn: 0,
      wp: 0,
      bk: 0,
      bq: 0,
      br: 0,
      bb: 0,
      bn: 0,
      bp: 0,
    };

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;

        if (counts[piece] === undefined) {
          errors.push(`Unsupported piece code at ${String.fromCharCode(97 + col)}${8 - row}.`);
          continue;
        }

        counts[piece] += 1;

        if ((piece === "wp" || piece === "bp") && (row === 0 || row === 7)) {
          errors.push("Pawns cannot be placed on the first or last rank.");
        }
      }
    }

    const whiteTotal = counts.wp + counts.wn + counts.wb + counts.wr + counts.wq + counts.wk;
    const blackTotal = counts.bp + counts.bn + counts.bb + counts.br + counts.bq + counts.bk;

    if (counts.wk !== 1) errors.push("White must have exactly one king.");
    if (counts.bk !== 1) errors.push("Black must have exactly one king.");
    if (counts.wp > 8) errors.push("White cannot have more than 8 pawns.");
    if (counts.bp > 8) errors.push("Black cannot have more than 8 pawns.");
    if (whiteTotal > 16) errors.push("White cannot have more than 16 pieces.");
    if (blackTotal > 16) errors.push("Black cannot have more than 16 pieces.");

    if (!getGameFromFen(fen)) {
      errors.push("The position is not a valid chess FEN.");
    }

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)],
    };
  }, [board, fen, freeStyle]);

  const turn: "white" | "black" = fen.split(' ')[1] === "w" ? "white" : "black";
  const status = currentGame?.isCheckmate()
    ? "checkmate"
    : currentGame?.isStalemate()
      ? "stalemate"
      : currentGame?.isCheck()
        ? "check"
        : "ongoing";

  const validMoves: string[] = !freeStyle && selectedSquare && currentGame
    ? (currentGame.moves({ square: selectedSquare as any, verbose: true }) as any[]).map(
        (m) => m.to ?? m.san ?? ""
      )
    : [];

  const squareToCoords = (square: string): [number, number] => {
    const col = square.charCodeAt(0) - 97;
    const row = 8 - parseInt(square[1], 10);
    return [row, col];
  };

  const createSnapshot = (): EditSnapshot => ({
    board: board.map((row) => [...row]),
    fen,
    whitePieces: [...whitePieces],
    blackPieces: [...blackPieces],
    moveHistory: [...moveHistory],
  });

  const pushSnapshot = () => {
    setEditHistory((prev) => [...prev, createSnapshot()]);
  };

  const getSanitizedCastling = (boardState: string[][]): string => {
    const currentCastling = fen.split(" ")[2] || "-";
    let castling = "";

    if (boardState[7][4] === "wk") {
      if (currentCastling.includes("K") && boardState[7][7] === "wr") castling += "K";
      if (currentCastling.includes("Q") && boardState[7][0] === "wr") castling += "Q";
    }

    if (boardState[0][4] === "bk") {
      if (currentCastling.includes("k") && boardState[0][7] === "br") castling += "k";
      if (currentCastling.includes("q") && boardState[0][0] === "br") castling += "q";
    }

    return castling || "-";
  };

  // Helper function to convert board state to FEN
  const boardToFen = (
    boardState: string[][],
    options?: { castling?: string; sanitizeCastling?: boolean }
  ): string => {
    let fenString = "";
    
    // Convert board rows to FEN notation
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece === "") {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fenString += emptyCount;
            emptyCount = 0;
          }
          // Convert piece code to FEN notation
          const type = piece[1].toUpperCase();
          fenString += piece[0] === "w" ? type : type.toLowerCase();
        }
      }
      if (emptyCount > 0) {
        fenString += emptyCount;
      }
      if (row < 7) {
        fenString += "/";
      }
    }
    
    // Preserve current turn and castling rights from existing FEN
    const currentParts = fen.split(' ');
    const currentTurn = currentParts[1] || 'w';
    const castling = options?.sanitizeCastling
      ? getSanitizedCastling(boardState)
      : (options?.castling ?? currentParts[2] ?? 'KQkq');
    const enPassant = currentParts[3] || '-';
    const halfmove = currentParts[4] || '0';
    const fullmove = currentParts[5] || '1';
    
    fenString += ` ${currentTurn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
    
    return fenString;
  };

  const applyLegalMove = (from: string, to: string) => {
    const ruleGame = getGameFromFen(fen);
    if (!ruleGame) {
      return false;
    }

    const move = ruleGame.move({ from, to, promotion: "q" });
    if (!move) {
      return false;
    }

    const payload: ChessMovePayload = {
      from,
      to,
      promotion: move.promotion,
      san: move.san,
    };

    pushSnapshot();
    setMoveHistory((prev) => [...prev, payload]);
    setSelectedSquare(undefined);
    setLastMove({ from, to });
    setFen(ruleGame.fen());
    setBoard(startFENtoBoard(ruleGame.fen()));
    onMove?.(payload);

    const result: GameResult = {
      result: ruleGame.isCheckmate()
        ? turn === "white"
          ? "black"
          : "white"
        : ruleGame.isDraw()
          ? "draw"
          : "ongoing",
      check: ruleGame.isCheck(),
      checkmate: ruleGame.isCheckmate(),
      stalemate: ruleGame.isStalemate(),
    };

    onGameEnd?.(result);
    return true;
  };

  const onSquareClick = (square: string) => {
    if (freeStyle) {
      setSelectedSquare((prev) => (prev === square ? undefined : square));
      return;
    }

    const turnColor = turn === "white" ? "w" : "b";
    const clickedPiece = currentGame?.get(square as any);

    if (selectedSquare === square) {
      setSelectedSquare(undefined);
      return;
    }

    if (clickedPiece && clickedPiece.color === turnColor) {
      setSelectedSquare(square);
      return;
    }

    if (selectedSquare && selectedSquare !== square) {
      if (!applyLegalMove(selectedSquare, square)) {
        setSelectedSquare(undefined);
      }
    } else {
      setSelectedSquare(undefined);
    }
  };

  const onDragStart = (piece: string, fromSquare?: string, fromOutside?: boolean) => {
    if (freeStyle || fromOutside || !fromSquare) {
      return;
    }

    const pieceColor = piece[0];
    const turnColor = turn === "white" ? "w" : "b";

    if (pieceColor === turnColor) {
      setSelectedSquare(fromSquare);
    }
  };

  const onDrop = (
    toSquare: string,
    draggedPiece: string,
    fromSquare?: string,
    fromOutside?: boolean
  ) => {
    if (!freeStyle) {
      if (fromOutside || !fromSquare) {
        return;
      }

      applyLegalMove(fromSquare, toSquare);
      return;
    }

    const [toRow, toCol] = squareToCoords(toSquare);
    const newBoard = board.map((row) => [...row]);
    const targetPiece = newBoard[toRow][toCol];

    // Do not allow dropping onto same-color piece
    if (targetPiece && targetPiece[0] === draggedPiece[0]) {
      return;
    }

    // Outside -> Board = COPY
    if (fromOutside) {
      pushSnapshot();
      newBoard[toRow][toCol] = draggedPiece;
      setSelectedSquare(undefined);
      setLastMove({ from: "outside", to: toSquare });
      setBoard(newBoard);
      setFen(boardToFen(newBoard));
      setMoveHistory((prev) => [
        ...prev,
        { from: "outside", to: toSquare, san: `${draggedPiece}@${toSquare}` },
      ]);
      return;
    }

    // Board -> Board
    if (fromSquare) {
      const [fromRow, fromCol] = squareToCoords(fromSquare);

      // same square, no-op
      if (fromSquare === toSquare) {
        return;
      }

      pushSnapshot();
      newBoard[toRow][toCol] = draggedPiece;
      newBoard[fromRow][fromCol] = "";
      setSelectedSquare(undefined);
      setLastMove({ from: fromSquare, to: toSquare });
      setBoard(newBoard);
      setFen(boardToFen(newBoard));
      setMoveHistory((prev) => [
        ...prev,
        { from: fromSquare, to: toSquare, san: `${fromSquare}-${toSquare}` },
      ]);
    }
  };

  const onDropOutside = (
    draggedPiece: string,
    fromSquare?: string,
    fromOutside?: boolean
  ) => {
    if (!freeStyle) {
      return;
    }

    // Board -> Outside: remove from board
    if (fromSquare && !fromOutside) {
      const [fromRow, fromCol] = squareToCoords(fromSquare);
      pushSnapshot();
      const newBoard = board.map((row) => [...row]);
      newBoard[fromRow][fromCol] = "";
      setBoard(newBoard);
      setFen(boardToFen(newBoard));
      setMoveHistory((prev) => [
        ...prev,
        { from: fromSquare, to: "outside", san: `${fromSquare}->outside` },
      ]);
    }

    // Outside -> Outside or failed outside drag from palette:
    // do nothing, keep original piece in tray
  };

  const reset = () => {
    const resetGame = new Chess();
    setSelectedSquare(undefined);
    setMoveHistory([]);
    setEditHistory([]);
    setLastMove(undefined);
    setFen(resetGame.fen());
    setBoard(startFENtoBoard(resetGame.fen()));
    setWhitePieces(["wp", "wn", "wb", "wr", "wq", "wk"]);
    setBlackPieces(["bp", "bn", "bb", "br", "bq", "bk"]);
  };

  const undo = () => {
    if (editHistory.length > 0) {
      const last = editHistory[editHistory.length - 1];
      setEditHistory((prev) => prev.slice(0, -1));
      setSelectedSquare(undefined);
      setBoard(last.board);
      setFen(last.fen);
      setWhitePieces(last.whitePieces);
      setBlackPieces(last.blackPieces);
      setMoveHistory(last.moveHistory);
      // Set lastMove to the previous move in history if available
      setLastMove(last.moveHistory.length > 0 ? {
        from: last.moveHistory[last.moveHistory.length - 1].from,
        to: last.moveHistory[last.moveHistory.length - 1].to,
      } : undefined);
      return;
    }
  };

  const flip = () => {
    setSelectedSquare(undefined);
  };

  // Parse castling rights from FEN
  const getCastlingRights = (fen: string) => {
    const parts = fen.split(' ');
    const castling = parts[2] || '-';
    return {
      whiteKingSide: castling.includes('K'),
      whiteQueenSide: castling.includes('Q'),
      blackKingSide: castling.includes('k'),
      blackQueenSide: castling.includes('q'),
    };
  };

  // Update turn in FEN
  const setTurn = (newTurn: 'white' | 'black') => {
    if (!freeStyle) {
      return;
    }

    pushSnapshot();
    const parts = fen.split(' ');
    parts[1] = newTurn === 'white' ? 'w' : 'b';
    const newFen = parts.join(' ');
    setFen(newFen);
    // Update board from new FEN
    setBoard(startFENtoBoard(newFen));
  };

  // Update castling rights in FEN
  const setCastlingRights = (rights: { whiteKingSide: boolean; whiteQueenSide: boolean; blackKingSide: boolean; blackQueenSide: boolean }) => {
    if (!freeStyle) {
      return;
    }

    pushSnapshot();
    const parts = fen.split(' ');
    let castling = '';
    if (rights.whiteKingSide) castling += 'K';
    if (rights.whiteQueenSide) castling += 'Q';
    if (rights.blackKingSide) castling += 'k';
    if (rights.blackQueenSide) castling += 'q';
    parts[2] = castling || '-';
    const newFen = parts.join(' ');
    setFen(newFen);
  };

  // Clear all pieces except kings
  const clearAllPieces = () => {
    if (!freeStyle) {
      return;
    }

    pushSnapshot();
    const newBoard = board.map(row => 
      row.map(piece => {
        if (piece === 'wk' || piece === 'bk') return piece;
        return '';
      })
    );
    setBoard(newBoard);
    setFen(boardToFen(newBoard));
    setSelectedSquare(undefined);
    setMoveHistory((prev) => [...prev, { from: "setup", to: "setup", san: "clear-all" }]);
  };

  const setFreeStyleMode = (enabled: boolean) => {
    if (enabled) {
      setFreeStyle(true);
      setSelectedSquare(undefined);
      return;
    }

    // Reset the board when disabling Free Style
    const resetGame = new Chess();
    setFreeStyle(false);
    setSelectedSquare(undefined);
    setMoveHistory([]);
    setEditHistory([]);
    setLastMove(undefined);
    setFen(resetGame.fen());
    setBoard(startFENtoBoard(resetGame.fen()));
    setWhitePieces(["wp", "wn", "wb", "wr", "wq", "wk"]);
    setBlackPieces(["bp", "bn", "bb", "br", "bq", "bk"]);
  };

  const applySuggestedMove = (uciMove: string): boolean => {
    const trimmed = uciMove.trim().toLowerCase();
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(trimmed)) {
      return false;
    }

    const ruleGame = getGameFromFen(fen);
    if (!ruleGame) {
      return false;
    }

    const from = trimmed.slice(0, 2);
    const to = trimmed.slice(2, 4);
    const promotion = trimmed.length === 5 ? trimmed[4] : "q";

    const move = ruleGame.move({ from, to, promotion });
    if (!move) {
      return false;
    }

    const payload: ChessMovePayload = {
      from,
      to,
      promotion: move.promotion,
      san: move.san,
    };

    pushSnapshot();
    setMoveHistory((prev) => [...prev, payload]);
    setSelectedSquare(undefined);
    setLastMove({ from, to });
    setFen(ruleGame.fen());
    setBoard(startFENtoBoard(ruleGame.fen()));
    onMove?.(payload);

    const result: GameResult = {
      result: ruleGame.isCheckmate()
        ? turn === "white"
          ? "black"
          : "white"
        : ruleGame.isDraw()
          ? "draw"
          : "ongoing",
      check: ruleGame.isCheck(),
      checkmate: ruleGame.isCheckmate(),
      stalemate: ruleGame.isStalemate(),
    };

    onGameEnd?.(result);
    return true;
  };

  return {
    board,
    fen,
    freeStyle,
    turn,
    status,
    selectedSquare,
    validMoves,
    moveHistory,
    lastMove,
    onSquareClick,
    undo,
    reset,
    flip,
    whitePieces,
    blackPieces,
    onDragStart,
    onDrop,
    onDropOutside,
    castlingRights: getCastlingRights(fen),
    setFreeStyleMode,
    setTurn,
    setCastlingRights,
    clearAllPieces,
    freeStyleValidation,
    applySuggestedMove,
  };
}