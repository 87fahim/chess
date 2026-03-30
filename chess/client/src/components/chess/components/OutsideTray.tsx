import React from "react";
import { pieceMap } from "./pieceMap";

type OutsideTrayProps = {
  pieces: string[];
  position: "top" | "bottom";
  freeStyle: boolean;
  onDragStart: (piece: string, fromSquare?: string, fromOutside?: boolean) => void;
};

export default function OutsideTray({ pieces, position, freeStyle, onDragStart }: OutsideTrayProps) {
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

  return (
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
}