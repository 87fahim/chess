import { pieceMap } from "./pieceMap";

export type BoardPlayer = {
  name: string;
  avatarUrl?: string;
  isComputer?: boolean;
};

type BoardPlayerBadgeProps = {
  player?: BoardPlayer;
  position: "top" | "bottom";
  capturedPieces: string[];
  advantage: number;
};

export default function BoardPlayerBadge({
  player,
  position,
  capturedPieces,
  advantage,
}: BoardPlayerBadgeProps) {
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
}