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

export type PieceCode = "wp" | "wn" | "wb" | "wr" | "wq" | "wk" | "bp" | "bn" | "bb" | "br" | "bq" | "bk";
type PieceProps = { piece: PieceCode; square: string };

const pieceMap: Record<PieceCode, string> = {
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

export default function Piece({ piece }: PieceProps) {
  const src = pieceMap[piece];
  if (!src) return null;

  const pieceColorClass = piece.startsWith("w") ? "piece-white" : "piece-black";

  return <img src={src} alt={piece} className={`piece ${pieceColorClass}`} />;
}

