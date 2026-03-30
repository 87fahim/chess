type GameStatusProps = { status: string; turn: string; className?: string };

export default function GameStatus({ status, turn, className = "" }: GameStatusProps) {
  const turnLabel = turn === "white" ? "White" : "Black";
  const statusLabel = status === "ongoing" ? "Turn" : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={["game-status", className].filter(Boolean).join(" ")}>
      {statusLabel === "Turn" ? `${turnLabel} ${statusLabel}` : `${statusLabel}`}
    </div>
  );
}

