import "./style.css";

type Coordinates = {
  row: number;
  col: number;
};

export class Cell {
  row: number;
  col: number;
  has_mine: boolean;
  mines_around: number;
  is_open: boolean;
  is_flagged: boolean;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.has_mine = false;
    this.mines_around = 0;
    this.is_open = false;
    this.is_flagged = false;
  }

  static encodeHashKey(row: number, col: number, max_col: number): number {
    return row * max_col + col;
  }

  static decodeHashKey(key: number, max_col: number): Coordinates {
    const row = Math.floor(key / max_col);
    const col = key % max_col;
    return { row, col };
  }
}

export type Board = Cell[][];

export type GameState = "pending" | "active" | "victory" | "loss";

export class Model {
  rows = 0;
  cols = 0;
  mines = 0;
  board: Board = [];
  state: GameState = "pending";
  cells_open = 0;
  flags_left = 0;

  constructor(rows: number, cols: number, mines: number) {
    this.init(rows, cols, mines);
  }

  init(rows: number, cols: number, mines: number) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.flags_left = mines;

    this.board = this.generateEmptyBoard(rows, cols);
    console.log(this.board);
    this.state = "pending";
    this.cells_open = 0;
  }

  get totalCells() {
    return this.rows * this.cols;
  }

  flush() {
    this.init(this.rows, this.cols, this.mines);
  }

  generateEmptyBoard(rows: number, cols: number) {
    const board = new Array(rows);

    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(cols);

      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = new Cell(i, j);
      }
    }

    return board;
  }

  generateMinesPositions(
    count: number,
    avoided_cell: Coordinates,
  ): Set<number> {
    const positions = new Set<number>();

    while (count) {
      const randow_row = Math.floor(Math.random() * this.rows);
      const randow_col = Math.floor(Math.random() * this.cols);

      if (randow_row === avoided_cell.row && randow_col === avoided_cell.col) {
        continue;
      }

      const hash = Cell.encodeHashKey(randow_row, randow_col, this.cols);

      if (positions.has(hash)) {
        continue;
      }

      positions.add(hash);
      count -= 1;
    }

    return positions;
  }

  plantHints(row: number, col: number) {
    const neighbors = this.getCellNeighbors(row, col);

    neighbors.forEach((neighbor) => {
      this.board[neighbor.row][neighbor.col].mines_around += 1;
    });
  }

  plantMines(avoided_cell: Coordinates) {
    const mines_positions = this.generateMinesPositions(
      this.mines,
      avoided_cell,
    );

    mines_positions.forEach((mine_position) => {
      const { row, col } = Cell.decodeHashKey(mine_position, this.cols);

      this.board[row][col].has_mine = true;
      this.plantHints(row, col);
    });
  }

  getCellNeighbors(row: number, col: number): Coordinates[] {
    const maxRow = this.rows - 1;
    const maxCol = this.cols - 1;

    return [
      { row: row - 1, col },
      { row: row - 1, col: col - 1 },
      { row: row - 1, col: col + 1 },
      { row: row + 1, col },
      { row: row + 1, col: col - 1 },
      { row: row + 1, col: col + 1 },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ].filter(
      (neighbor) =>
        neighbor.row !== -1 &&
        neighbor.col !== -1 &&
        neighbor.row !== maxRow + 1 &&
        neighbor.col !== maxCol + 1,
    );
  }

  flagCell(
    row: number,
    col: number,
    updateView: (
      board: Board,
      row: number,
      col: number,
      is_flagged: boolean,
      flags_left: number,
    ) => void,
  ) {
    const cell = this.board[row][col];

    if (cell.is_open) {
      return;
    }

    cell.is_flagged = !cell.is_flagged;

    if (cell.is_flagged) {
      this.flags_left -= 1;
    } else {
      this.flags_left += 1;
    }

    updateView(this.board, row, col, cell.is_flagged, this.flags_left);
  }

  openCell(
    row: number,
    col: number,
    updateView: (
      board: Board,
      row: number,
      col: number,
      game_state: GameState,
    ) => void,
  ) {
    // Check bounds
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return;
    }
    const cell = this.board[row][col];
    // Check state
    if (cell.is_open || cell.is_flagged) {
      return;
    }
    if (this.state === "loss" || this.state === "victory") {
      return;
    }
    // Start game if not started yet
    if (this.state === "pending") {
      this.plantMines({ row, col });
      this.state = "active";
    }

    this.board[row][col].is_open = true;
    this.cells_open += 1;

    if (cell.has_mine) {
      this.state = "loss";
      updateView(this.board, row, col, this.state);
      return;
    } else {
      updateView(this.board, row, col, this.state);
    }

    if (this.cells_open === this.totalCells - this.mines) {
      this.state = "victory";
      updateView(this.board, row, col, this.state);
    }

    if (!cell.mines_around) {
      const neighbors = this.getCellNeighbors(row, col);

      neighbors.forEach((neighbor) => {
        setTimeout(
          () => this.openCell(neighbor.row, neighbor.col, updateView),
          50,
        );
      });
    }
  }
}
