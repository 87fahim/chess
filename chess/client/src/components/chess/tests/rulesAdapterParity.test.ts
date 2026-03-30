import { getRulesEngine } from "../logic/rulesAdapter";

const current = getRulesEngine("current");
const thirdParty = getRulesEngine("third-party");

const sortMoves = (moves: string[]) => [...moves].sort();

describe("rules adapter parity", () => {
  test("valid moves parity from initial position", () => {
    const initialFen = "rn1qkbnr/pppbpppp/8/3p4/8/3P1N2/PPPNPPPP/R1BQKB1R w KQkq - 0 1";

    expect(sortMoves(thirdParty.getValidMoves(initialFen, "f3"))).toEqual(
      sortMoves(current.getValidMoves(initialFen, "f3"))
    );
    expect(sortMoves(thirdParty.getValidMoves(initialFen, "d2"))).toEqual(
      sortMoves(current.getValidMoves(initialFen, "d2"))
    );
  });

  test("checkmate parity", () => {
    const checkmateFen = "rnb1kbnr/pppp1ppp/8/4p3/6q1/5N2/PPPPPPPP/RNBQKB1R w KQkq - 1 3";
    expect(thirdParty.isCheckmate(checkmateFen)).toBe(current.isCheckmate(checkmateFen));
  });

  test("stalemate parity", () => {
    const stalemateFen = "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1";
    expect(thirdParty.isStalemate(stalemateFen)).toBe(current.isStalemate(stalemateFen));
  });

  test("insufficient material parity", () => {
    const insufficientFen = "8/8/8/8/8/8/6k1/7K w - - 0 1";
    expect(thirdParty.insufficientMaterial(insufficientFen)).toBe(current.insufficientMaterial(insufficientFen));
  });
});
