import { startFENtoBoard } from "../logic/boardMapper";
test("boardMapper parse", () => {
    const board = startFENtoBoard("8/8/8/8/8/8/8/8 w - - 0 1");
    expect(board).toHaveLength(8);
    expect(board[0]).toHaveLength(8);
});
