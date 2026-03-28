import { BoardOrientation } from "../Chess.types";
const filesWhite = ["a","b","c","d","e","f","g","h"];
const ranks = ["8","7","6","5","4","3","2","1"];

type CoordinatesProps={orientation?:BoardOrientation};
export default function Coordinates({ orientation = "white" }: CoordinatesProps) {
  const fileRow = orientation === "white" ? filesWhite : [...filesWhite].reverse();
  const rankColumn = orientation === "white" ? ranks : [...ranks].reverse();
  return (
    <div className="coordinates">
      <div className="files">{fileRow.map((f) => <span key={f}>{f}</span>)}</div>
      <div className="ranks">{rankColumn.map((r) => <span key={r}>{r}</span>)}</div>
    </div>
  );
}

