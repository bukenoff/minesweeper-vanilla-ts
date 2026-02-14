import "./minesweeper.css";

const COLORS = {
  BLUE: "#5688c7",
  MUD_GREEN: "#545e56",
  RED: "#fe4a49",
  PURPLE: "#2b193d",
  YELLOW: "#d9b26f",
  STORMY_TEAL: "#0f7173",
  FANCY_BLACK: "#1e212b",
  GHOST_WHITE: "#dbdaea",
};

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

type Board = Cell[][];

type GameState = "pending" | "active" | "victory" | "loss";

export class MinesweeperModel {
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

export class MinesweeperView {
  container: HTMLDivElement | null = null;
  board_element: HTMLDivElement | null = null;
  controls_element: HTMLDivElement | null = null;
  restart_element: HTMLElement | null = null;
  cell_colors = [
    COLORS.BLUE,
    COLORS.MUD_GREEN,
    COLORS.RED,
    COLORS.PURPLE,
    COLORS.YELLOW,
    COLORS.STORMY_TEAL,
    COLORS.FANCY_BLACK,
    COLORS.GHOST_WHITE,
  ];
  cells_by_id: Map<number, HTMLButtonElement> = new Map();

  constructor() {
    const game_window = document.getElementById("minesweeper-window");

    if (!game_window) {
      throw new Error("Could not locate dialog");
    }

    this.container = document.createElement("div");
    this.container.style.display = "inline-block";

    this.board_element = document.createElement("div");
    this.controls_element = document.createElement("div");
    this.controls_element.classList.add("controls");

    const flags_counter = document.createElement("flags-counter");
    flags_counter.setAttribute("flags_left", "9");
    this.controls_element.appendChild(flags_counter);

    const restart_button = document.createElement("restart-button");
    this.restart_element = restart_button;
    restart_button.setAttribute("game_state", "victory");
    this.controls_element.appendChild(restart_button);

    this.container.appendChild(this.controls_element);
    this.container.appendChild(this.board_element);

    game_window.appendChild(this.container);
  }

  flush() {
    this.cells_by_id.forEach((cell_element) => {
      console.log("cell element", cell_element);
      cell_element.classList.value = "mines-cell";
      cell_element.removeAttribute("disabled");
      cell_element.textContent = "";
    });
    this.restart_element?.setAttribute("game_state", "pending");
  }

  openCell(board: Board, row: number, col: number, game_state: GameState) {
    const cell = board[row][col];

    const max_col = board[0].length;
    const cell_id = Cell.encodeHashKey(row, col, max_col);
    const cell_element = this.cells_by_id.get(cell_id);

    if (!cell_element) {
      throw new Error("could not locate cell");
    }

    this.restart_element?.setAttribute("game_state", game_state);

    cell_element.classList.add("mines-cell-open");
    cell_element.setAttribute("disabled", "true");

    if (cell.has_mine) {
      cell_element.classList.add("mines-cell-exploded");
      cell_element.innerHTML = `<i class="fa-solid fa-bomb fa-xs"></i>`;
      return;
    }

    if (cell.mines_around) {
      cell_element.textContent = cell.mines_around.toString();
      cell_element.style.color = this.cell_colors[cell.mines_around - 1];
    }
  }

  flagCell(
    board: Board,
    row: number,
    col: number,
    is_flagged: boolean,
    flags_left: number,
  ) {
    const max_col = board[0].length;
    const cell_id = Cell.encodeHashKey(row, col, max_col);
    const cell_element = this.cells_by_id.get(cell_id);

    if (!cell_element) {
      throw new Error("could not locate cell");
    }

    const flags_counter = document.querySelector("flags-counter");

    if (is_flagged) {
      cell_element.innerHTML = `<i class="fa-solid fa-flag fa-xs" style="color: #0d21a1ff"></i>`;
    } else {
      cell_element.innerHTML = "";
    }

    if (flags_counter) {
      flags_counter.setAttribute("flags_left", `${flags_left}`);
    }
  }

  drawBoard(board: Board | null, flags_left: number) {
    if (!board) {
      throw new Error("no board provided");
    }

    const flags_counter = document.querySelector("flags-counter");

    if (flags_counter) {
      flags_counter.setAttribute("flags_left", `${flags_left}`);
    }

    for (let i = 0; i < board.length; i++) {
      const rowView = document.createElement("div");
      rowView.classList.add("mines-row");
      for (let j = 0; j < board[i].length; j++) {
        const id = Cell.encodeHashKey(i, j, board[i].length);
        const cellView = document.createElement("button");

        cellView.classList.add("mines-cell");
        cellView.setAttribute("data-row", `${i}`);
        cellView.setAttribute("data-col", `${j}`);
        cellView.setAttribute("id", `${id}`);

        this.cells_by_id.set(id, cellView);

        rowView.appendChild(cellView);
      }

      this.board_element?.appendChild(rowView);
    }
  }
}

export class MinesweeperController {
  model: MinesweeperModel;
  view: MinesweeperView;

  constructor(model: MinesweeperModel, view: MinesweeperView) {
    this.model = model;
    this.view = view;

    this.view.drawBoard(this.model.board, this.model.flags_left);
    this.setupListeners();
  }

  restart() {
    this.model.flush();
    this.view.flush();
  }

  setupListeners(): void {
    const restart_button = document.querySelector("restart-button");

    restart_button?.addEventListener("restart", () => this.restart());

    const cells = document.getElementsByClassName(
      "mines-cell",
    ) as HTMLCollectionOf<HTMLButtonElement>;

    for (let cell of cells) {
      cell.addEventListener("click", () => {
        if (this.model.state === "loss" || this.model.state === "victory") {
          alert("you lost, start again");
          return;
        }
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        this.model.openCell(row, col, this.view.openCell.bind(this.view));
      });

      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (this.model.state === "loss" || this.model.state === "victory") {
          alert("you lost, start again");
          return;
        }
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        this.model.flagCell(row, col, this.view.flagCell.bind(this.view));
      });
    }
  }
}

export const Minesweeper = {
  Model: MinesweeperModel,
  View: MinesweeperView,
  Controller: MinesweeperController,
};
