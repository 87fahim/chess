type GameStatusProps = { status: string; turn: string };

export default function GameStatus({ status, turn }: GameStatusProps) {
  const turnLabel = turn === "white" ? "White" : "Black";
  const statusLabel = status === "ongoing" ? "Turn" : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="game-status">
      {statusLabel === "Turn" ? `${turnLabel} ${statusLabel}` : `${statusLabel}`}
    </div>
  );
}

