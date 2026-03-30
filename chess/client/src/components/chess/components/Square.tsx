
import Piece, { PieceCode } from "./Piece";
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

type SquareProps = {
  square: string;
  row: number;
  col: number;
  piece?: PieceCode;
  isSelected?: boolean;
  isValidMove?: boolean;
  isCheckedKing?: boolean;
  isLastMoveSource?: boolean;
  isLastMoveDestination?: boolean;
  onClick?: () => void;
  onDragStart?: (piece: string, fromSquare?: string, fromOutside?: boolean) => void;
  onDrop?: (draggedPiece: string, fromSquare?: string, fromOutside?: boolean) => void;
  onDropOutside?: (draggedPiece: string, fromSquare?: string, fromOutside?: boolean) => void;
};

export default function Square({
  square,
  row,
  col,
  piece,
  isSelected = false,
  isValidMove = false,
  isCheckedKing = false,
  isLastMoveSource = false,
  isLastMoveDestination = false,
  onClick,
  onDragStart,
  onDrop,
}: SquareProps) {
  const isDark = (row + col) % 2 === 1;

  const className = ["square", isDark ? "dark" : "light", isSelected && "selected", isValidMove && "valid-move", isCheckedKing && "checked-king", (isLastMoveSource || isLastMoveDestination) && "last-move"]
    .filter(Boolean)
    .join(" ");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!piece) return;

    e.dataTransfer.setData("piece", piece);
    e.dataTransfer.setData("fromSquare", square);
    e.dataTransfer.setData("fromOutside", "false");

    const img = new Image();
    img.src = pieceMap[piece];
    e.dataTransfer.setDragImage(img, 25, 25);

    onDragStart?.(piece, square, false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedPiece = e.dataTransfer.getData("piece");
    const fromSquare = e.dataTransfer.getData("fromSquare");
    const fromOutside = e.dataTransfer.getData("fromOutside") === "true";

    if (draggedPiece) {
      onDrop?.(draggedPiece, fromSquare || undefined, fromOutside);
    }
  };

  return (
    <button
      type="button"
      className={className}
      data-square={square}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!!piece}
      onDragStart={handleDragStart}
    >
      {piece ? <Piece piece={piece} square={square} /> : null}
    </button>
  );
}