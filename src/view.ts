import { COLORS } from "./const";
import { type GameState, type Board, Cell } from "./model";

export class View {
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
    this.controls_element.appendChild(flags_counter);

    const restart_button = document.createElement("restart-button");
    this.restart_element = restart_button;
    this.controls_element.appendChild(restart_button);

    this.container.appendChild(this.controls_element);
    this.container.appendChild(this.board_element);

    game_window.appendChild(this.container);
  }

  flush() {
    this.cells_by_id.forEach((cell_element) => {
      cell_element.classList.value = "cell";
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

    cell_element.classList.add("cell-open");
    cell_element.setAttribute("disabled", "true");

    if (cell.has_mine) {
      cell_element.classList.add("cell-exploded");
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
      cell_element.classList.add("cell-flagged");
    } else {
      cell_element.classList.remove("cell-flagged");
    }

    if (flags_counter) {
      flags_counter.setAttribute("flags_left", `${flags_left}`);
    }
  }

  drawBoard(board: Board | null, flags_left: number, game_state: GameState) {
    if (!board) {
      throw new Error("no board provided");
    }

    const flags_counter = document.querySelector("flags-counter");

    if (flags_counter) {
      flags_counter.setAttribute("flags_left", `${flags_left}`);
    }

    const restart_button = document.createElement("restart-button");

    if (restart_button) {
      restart_button.setAttribute("game_state", game_state);
    }

    for (let i = 0; i < board.length; i++) {
      const rowView = document.createElement("div");
      rowView.classList.add("row");
      for (let j = 0; j < board[i].length; j++) {
        const id = Cell.encodeHashKey(i, j, board[i].length);
        const cellView = document.createElement("button");

        cellView.classList.add("cell");
        cellView.setAttribute("data-row", `${i}`);
        cellView.setAttribute("data-col", `${j}`);
        cellView.setAttribute("id", `${id}`);

        this.cells_by_id.set(id, cellView);

        rowView.appendChild(cellView);
      }

      this.board_element?.appendChild(rowView);
    }
  }

  addCursor(row: number, col: number, board: Board) {
    const max_col = board[0].length;
    const cell_id = Cell.encodeHashKey(row, col, max_col);
    const cell_element = this.cells_by_id.get(cell_id);

    if (!cell_element) {
      throw new Error("could not locate cell");
    }

    cell_element.classList.add("cell-cursor");
  }

  removeCursor(row: number, col: number, board: Board) {
    const max_col = board[0].length;
    const cell_id = Cell.encodeHashKey(row, col, max_col);
    const cell_element = this.cells_by_id.get(cell_id);

    if (!cell_element) {
      throw new Error("could not locate cell");
    }

    cell_element.classList.remove("cell-cursor");
  }
}
