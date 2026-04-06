import ChessButton from "./ChessButton";
import ChessSurface from "./ChessSurface";

type FenDockProps = {
  fen: string;
};

export default function FenDock({ fen }: FenDockProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fen);
    } catch {
      // Ignore clipboard failures so the dock stays non-blocking.
    }
  };

  return (
    <div className="fen-display-container">
      <ChessSurface className="fen-surface">
        <ChessButton
          variant="chip"
          align="center"
          className="fen-copy-btn"
          onClick={handleCopy}
          title="Copy FEN to clipboard"
          aria-label="Copy FEN to clipboard"
        >
          📋
        </ChessButton>
        <input
          type="text"
          value={fen}
          readOnly
          className="fen-input"
          size={Math.max(16, Math.min(96, fen.length + 1))}
          aria-label="Current FEN"
        />
      </ChessSurface>
    </div>
  );
}