import { useMemo } from "react";
import { ChessMovePayload } from "../Chess.types";

type MoveListProps = {
  moves: ChessMovePayload[];
  isOpen: boolean;
  onClose: () => void;
};

const formatMove = (move: ChessMovePayload): string => {
  if (move.from && move.to && move.from.length === 2 && move.to.length === 2) {
    return `${move.from}-${move.to}`;
  }
  return move.san ?? `${move.from}-${move.to}`;
};

export default function MoveList({ moves, isOpen, onClose }: MoveListProps) {
  const columns = useMemo(() => {
    const white: string[] = [];
    const black: string[] = [];

    moves.forEach((move, idx) => {
      const formatted = formatMove(move);
      if (idx % 2 === 0) {
        white.push(formatted);
      } else {
        black.push(formatted);
      }
    });

    return {
      allWhite: [...white].reverse(),
      allBlack: [...black].reverse(),
    };
  }, [moves]);

  if (!isOpen) return null;

  return (
    <div className="move-popup-backdrop" onClick={onClose}>
      <div className="move-popup" onClick={(e) => e.stopPropagation()}>
        <div className="move-popup-header">
          <strong>All Moves</strong>
        </div>
        <div className="move-columns move-columns-popup">
          <div className="move-column">
            <div className="move-column-title">White</div>
            <ul>
              {columns.allWhite.map((move, idx) => (
                <li key={`pw-${move}-${idx}`}>{move}</li>
              ))}
            </ul>
          </div>
          <div className="move-column">
            <div className="move-column-title">Black</div>
            <ul>
              {columns.allBlack.map((move, idx) => (
                <li key={`pb-${move}-${idx}`}>{move}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

