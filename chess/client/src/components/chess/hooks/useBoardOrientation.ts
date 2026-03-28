import { useMemo } from "react";
import { BoardOrientation } from "../Chess.types";
export default function useBoardOrientation(orientation: BoardOrientation) {
  return useMemo(() => (orientation === "white" ? 1 : -1), [orientation]);
}

