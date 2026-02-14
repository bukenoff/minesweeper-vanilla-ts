import { Model, Cell } from "../model";

describe("Minesweeper model", () => {
  it("should be allright", () => {
    expect(Model).toBeDefined();
  });

  it("generate a set of random positions", () => {
    const model = new Model(9, 9, 9);

    const mines_positions = model.generateMinesPositions(9, { row: 1, col: 3 });
    expect(mines_positions.size).toBe(9);
  });
});

describe("Cell class", () => {
  it("should encode positions", () => {
    expect(Cell.encodeHashKey(1, 7, 9)).toBe(16);
    expect(Cell.encodeHashKey(2, 5, 9)).toBe(23);
    expect(Cell.encodeHashKey(0, 1, 9)).toBe(1);
  });

  it("should decode hash to position", () => {
    expect(Cell.decodeHashKey(16, 9)).toEqual({ row: 1, col: 7 });
    expect(Cell.decodeHashKey(23, 9)).toEqual({ row: 2, col: 5 });
    expect(Cell.decodeHashKey(1, 9)).toEqual({ row: 0, col: 1 });
  });
});
