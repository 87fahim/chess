import { renderHook, act } from "@testing-library/react"; 
import useChessGame from "../hooks/useChessGame"; 
test("useChessGame basic state", () => { 
    const { result } = renderHook(() => useChessGame({ initialFen: "start" })); 
    expect(result.current.turn).toBe("white"); });
