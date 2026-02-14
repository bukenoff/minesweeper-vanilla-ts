import { Model, Cell, Cursor } from "../model";

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

describe("Cursor model", () => {
  it("should be able to move cursor position", () => {
    const cursor = new Cursor(0, 0, 8, 8);

    cursor.move("right");
    cursor.move("down");
    cursor.move("down");
    cursor.move("right");
    cursor.move("up");

    expect(cursor.row).toBe(1);
    expect(cursor.col).toBe(2);
  });

  it("should respect board top bounds", () => {
    const cursor = new Cursor(0, 0, 8, 8);

    cursor.move("up");
    cursor.move("up");
    cursor.move("up");
    expect(cursor.row).toBe(0);
  });

  it("should respect board bottom bounds", () => {
    const cursor = new Cursor(8, 8, 8, 8);

    cursor.move("down");
    cursor.move("down");
    cursor.move("down");
    expect(cursor.row).toBe(cursor.max_row);
  });

  it("should respect board right bounds", () => {
    const cursor = new Cursor(8, 8, 8, 8);

    cursor.move("right");
    cursor.move("right");
    cursor.move("right");
    expect(cursor.col).toBe(cursor.max_col);
  });

  it("should respect board left bounds", () => {
    const cursor = new Cursor(0, 0, 8, 8);

    cursor.move("left");
    cursor.move("left");
    cursor.move("left");
    expect(cursor.col).toBe(0);
  });
});
