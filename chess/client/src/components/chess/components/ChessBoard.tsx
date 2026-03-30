import React, { useEffect, useMemo, useRef, useState } from "react";
import { BoardOrientation } from "../Chess.types";
import Square from "./Square";
import { PieceCode } from "./Piece";
import { Board } from "../logic/chessEngine";
import "../styles/square.css";

import wp from "../assets/pieces/wp.svg";
import wn from "../assets/pieces/wn.svg";
import wb from "../assets/pieces/wb.svg";
import wr from "../assets/pieces/wr.svg";
import wq from "../assets/pieces/wq.svg";
import wk from "../assets/pieces/wk.svg";
import bp from "../assets/pieces/bp.svg";
import bn from "../assets/pieces/bn.svg";
import bb from "../assets/pieces/bb.svg";
import br from "../assets/pieces/br.svg";
import bq from "../assets/pieces/bq.svg";
import bk from "../assets/pieces/bk.svg";

const pieceMap: Record<string, string> = {
  wp,
  wn,
  wb,
  wr,
  wq,
  wk,
  bp,
  bn,
  bb,
  br,
  bq,
  bk,
};

type ChessBoardProps = {
  board: Board;
  orientation: BoardOrientation;
  freeStyle: boolean;
  showPlayerBadges?: boolean;
  topPlayer?: {
    name: string;
    avatarUrl?: string;
    isComputer?: boolean;
    color: "white" | "black";
  };
  bottomPlayer?: {
    name: string;
    avatarUrl?: string;
    isComputer?: boolean;
    color: "white" | "black";
  };
  topCapturedPieces?: string[];
  bottomCapturedPieces?: string[];
  topAdvantage?: number;
  bottomAdvantage?: number;
  checkedKingSquare?: string;
  selectedSquare?: string;
  validMoves?: string[];
  lastMove?: { from: string; to: string };
  onSquareClick: (square: string) => void;
  showCoordinates?: boolean;
  interactive?: boolean;
  whitePieces: string[];
  blackPieces: string[];
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
  animatedMove?: {
    from: string;
    to: string;
    piece: PieceCode;
    token: number;
  };
  onAnimatedMoveEnd?: () => void;
};

export default function ChessBoard({
  board,
  orientation,
  freeStyle,
  showPlayerBadges = false,
  topPlayer,
  bottomPlayer,
  topCapturedPieces = [],
  bottomCapturedPieces = [],
  topAdvantage = 0,
  bottomAdvantage = 0,
  checkedKingSquare,
  selectedSquare,
  validMoves = [],
  lastMove,
  onSquareClick,
  showCoordinates = true,
  interactive = true,
  whitePieces,
  blackPieces,
  onDragStart,
  onDrop,
  onDropOutside,
  animatedMove,
  onAnimatedMoveEnd,
}: ChessBoardProps) {
  const boardGridRef = useRef<HTMLDivElement | null>(null);
  const [ghostStyle, setGhostStyle] = useState<React.CSSProperties | null>(null);

  const ghostPieceSrc = useMemo(() => {
    if (!animatedMove) return null;
    return pieceMap[animatedMove.piece] ?? null;
  }, [animatedMove]);

  useEffect(() => {
    if (!animatedMove || !boardGridRef.current) {
      setGhostStyle(null);
      return;
    }

    const gridEl = boardGridRef.current;
    const fromEl = gridEl.querySelector(`[data-square="${animatedMove.from}"]`) as HTMLElement | null;
    const toEl = gridEl.querySelector(`[data-square="${animatedMove.to}"]`) as HTMLElement | null;

    if (!fromEl || !toEl) {
      setGhostStyle(null);
      onAnimatedMoveEnd?.();
      return;
    }

    const gridRect = gridEl.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    setGhostStyle({
      left: fromRect.left - gridRect.left,
      top: fromRect.top - gridRect.top,
      width: fromRect.width,
      height: fromRect.height,
      "--engine-move-dx": `${toRect.left - fromRect.left}px`,
      "--engine-move-dy": `${toRect.top - fromRect.top}px`,
    } as React.CSSProperties);
  }, [animatedMove, onAnimatedMoveEnd]);

  const rows =
    orientation === "white"
      ? [...Array(8).keys()]
      : [...Array(8).keys()].reverse();

  const cols =
    orientation === "white"
      ? [...Array(8).keys()]
      : [...Array(8).keys()].reverse();

  const topPieces = orientation === "white" ? blackPieces : whitePieces;
  const bottomPieces = orientation === "white" ? whitePieces : blackPieces;

  const handleOutsideDragStart =
    (piece: string) => (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData("piece", piece);
      e.dataTransfer.setData("fromSquare", "");
      e.dataTransfer.setData("fromOutside", "true");

      const dragElement = e.currentTarget as HTMLDivElement;
      const rect = dragElement.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragElement, rect.width / 2, rect.height / 2);

      onDragStart(piece, undefined, true);
    };
  const handleBoardContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const target = e.target as HTMLElement;
    const droppedOnSquare = target.closest(".square");

    if (droppedOnSquare) {
      return;
    }

    const draggedPiece = e.dataTransfer.getData("piece");
    const fromSquare = e.dataTransfer.getData("fromSquare");
    const fromOutside = e.dataTransfer.getData("fromOutside") === "true";

    if (freeStyle && draggedPiece) {
      onDropOutside(draggedPiece, fromSquare || undefined, fromOutside);
    }
  };

  const renderOutsideTray = (pieces: string[], position: "top" | "bottom") => (
    <div className={`outside-tray outside-tray-${position}`}>
      <div className="outside-tray-inner">
        {pieces.map((piece, index) => (
          <div
            key={`${position}-${piece}-${index}`}
            className="outside-piece"
            draggable={freeStyle}
            onDragStart={handleOutsideDragStart(piece)}
          >
            <img src={pieceMap[piece]} alt={piece} className="piece" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlayerBadge = (
    player: { name: string; avatarUrl?: string; isComputer?: boolean } | undefined,
    position: "top" | "bottom",
    capturedPieces: string[],
    advantage: number
  ) => {
    if (!player) {
      return null;
    }

    const initial = (player.name?.trim()?.charAt(0) || "P").toUpperCase();

    return (
      <div className={`board-player-badge board-player-badge-${position}`}>
        <div className="board-player-avatar" aria-hidden="true">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={`${player.name} avatar`} />
          ) : (
            <span>{player.isComputer ? "PC" : initial}</span>
          )}
        </div>
        <div className="board-player-meta">
          <span className="board-player-name">{player.name}</span>
          {(capturedPieces.length > 0 || advantage > 0) && (
            <div className="board-captured-row">
              <div className="board-captured-icons">
                {capturedPieces.map((piece, index) => (
                  <span key={`${position}-${piece}-${index}`} className="board-captured-piece" title={piece}>
                    <img src={pieceMap[piece]} alt={piece} />
                  </span>
                ))}
              </div>
              {advantage > 0 && <span className="board-captured-advantage">+{advantage}</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="chess-board-wrapper"
      onDragOver={(e) => freeStyle && e.preventDefault()}
      onDrop={handleBoardContainerDrop}
    >
      {freeStyle && renderOutsideTray(topPieces, "top")}

      <div className={`chess-board-container${showPlayerBadges && !freeStyle ? " with-player-badges" : ""}`}>
        {showCoordinates && (
          <div className="ranks-column">
            {rows.map((row) => (
              <div key={`rank-${row}`} className="rank-label">
                {8 - row}
              </div>
            ))}
          </div>
        )}

        <div className={`board-and-files${!freeStyle ? " top bottom" : ""}`}>
          {showPlayerBadges && renderPlayerBadge(topPlayer, "top", topCapturedPieces, topAdvantage)}

          <div ref={boardGridRef} className="chess-board-grid">
            {rows.map((row) =>
              cols.map((col) => {
                const square = `${String.fromCharCode(97 + col)}${8 - row}`;
                const rawPiece = board[row][col] as PieceCode | "";
                const isAnimatedDestination = Boolean(
                  animatedMove && ghostStyle && square === animatedMove.to
                );
                const piece = isAnimatedDestination ? "" : rawPiece;

                return (
                  <Square
                    key={square}
                    square={square}
                    row={row}
                    col={col}
                    piece={piece || undefined}
                    isSelected={selectedSquare === square}
                    isValidMove={validMoves.includes(square)}
                    isCheckedKing={checkedKingSquare === square}
                    isLastMoveSource={lastMove?.from === square}
                    isLastMoveDestination={lastMove?.to === square}
                    onClick={() => interactive && onSquareClick(square)}
                    onDragStart={onDragStart}
                    onDrop={(draggedPiece, fromSquare, fromOutside) =>
                      onDrop(square, draggedPiece, fromSquare, fromOutside)
                    }
                    onDropOutside={onDropOutside}
                  />
                );
              })
            )}

            {animatedMove && ghostStyle && ghostPieceSrc && (
              <div
                className="engine-move-ghost"
                style={ghostStyle}
                onAnimationEnd={onAnimatedMoveEnd}
              >
                <img
                  src={ghostPieceSrc}
                  alt={animatedMove.piece}
                  className={`piece ${animatedMove.piece.startsWith("w") ? "piece-white" : "piece-black"}`}
                />
              </div>
            )}
          </div>

          {showCoordinates && (
            <div className="files-row">
              {cols.map((col) => (
                <div key={`file-${col}`} className="file-label">
                  {String.fromCharCode(97 + col)}
                </div>
              ))}
            </div>
          )}

          {showPlayerBadges && renderPlayerBadge(bottomPlayer, "bottom", bottomCapturedPieces, bottomAdvantage)}
        </div>
      </div>

      {freeStyle && renderOutsideTray(bottomPieces, "bottom")}
    </div>
  );
}