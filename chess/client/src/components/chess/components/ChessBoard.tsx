import React, { useEffect, useMemo, useRef, useState } from "react";
import { BoardOrientation } from "../Chess.types";
import Square from "./Square";
import { PieceCode } from "./Piece";
import { pieceMap } from "./pieceMap";
import OutsideTray from "./OutsideTray";
import BoardPlayerBadge, { BoardPlayer } from "./BoardPlayerBadge";
import { useChessBoardActions, useChessBoardState } from "../context/ChessContext";
import "../styles/square.css";

type ChessBoardPlayersProps = {
  showPlayerBadges?: boolean;
  topPlayer?: BoardPlayer;
  bottomPlayer?: BoardPlayer;
  topCapturedPieces?: string[];
  bottomCapturedPieces?: string[];
  topAdvantage?: number;
  bottomAdvantage?: number;
};

type ChessBoardAnimationProps = {
  animatedMove?: {
    from: string;
    to: string;
    piece: PieceCode;
    token: number;
  };
  onAnimatedMoveEnd?: () => void;
};

type ChessBoardProps = {
  players: ChessBoardPlayersProps;
  animation?: ChessBoardAnimationProps;
};

export default function ChessBoard({
  players,
  animation,
}: ChessBoardProps) {
  const {
    board,
    selectedSquare,
    validMoves,
    lastMove,
    checkedKingSquare,
    orientation,
    freeStyle,
    showCoordinates,
    interactive,
    whitePieces,
    blackPieces,
  } = useChessBoardState();
  const { onSquareClick, onDragStart, onDrop, onDropOutside } = useChessBoardActions();
  const {
    showPlayerBadges = false,
    topPlayer,
    bottomPlayer,
    topCapturedPieces = [],
    bottomCapturedPieces = [],
    topAdvantage = 0,
    bottomAdvantage = 0,
  } = players;
  const { animatedMove, onAnimatedMoveEnd } = animation ?? {};

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

  return (
    <div
      className="chess-board-wrapper"
      onDragOver={(e) => freeStyle && e.preventDefault()}
      onDrop={handleBoardContainerDrop}
    >
      {freeStyle && (
        <OutsideTray
          pieces={topPieces}
          position="top"
          freeStyle={freeStyle}
          onDragStart={onDragStart}
        />
      )}

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
          {showPlayerBadges && (
            <BoardPlayerBadge
              player={topPlayer}
              position="top"
              capturedPieces={topCapturedPieces}
              advantage={topAdvantage}
            />
          )}

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

          {showPlayerBadges && (
            <BoardPlayerBadge
              player={bottomPlayer}
              position="bottom"
              capturedPieces={bottomCapturedPieces}
              advantage={bottomAdvantage}
            />
          )}
        </div>
      </div>

      {freeStyle && (
        <OutsideTray
          pieces={bottomPieces}
          position="bottom"
          freeStyle={freeStyle}
          onDragStart={onDragStart}
        />
      )}
    </div>
  );
}