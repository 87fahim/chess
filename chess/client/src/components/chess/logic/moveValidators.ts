import { Chess } from "chess.js";
const engine = new Chess();
export const isValidMove = (fen:string, from:string, to:string) => { engine.load(fen); return engine.move({from,to,promotion:"q"}) != null; };

