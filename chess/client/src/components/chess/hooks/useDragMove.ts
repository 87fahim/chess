import { useState } from "react";
export default function useDragMove() {
  const [dragging, setDragging] = useState(false);
  return { dragging, start: () => setDragging(true), stop: () => setDragging(false) };
}

