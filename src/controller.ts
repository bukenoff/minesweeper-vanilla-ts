import { Model } from "./model";
import { View } from "./view";

export class Controller {
  model: Model;
  view: View;

  constructor(model: Model, view: View) {
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
      "cell",
    ) as HTMLCollectionOf<HTMLButtonElement>;

    for (let cell of cells) {
      cell.addEventListener("click", () => {
        if (this.model.state === "loss" || this.model.state === "victory") {
          alert("you either lost or won, start again");
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
    document.addEventListener("keydown", (evt) => {
      switch (evt.key) {
        case "ArrowUp":
        case "k":
          this.view.cursor.move("up");
          break;
        case "ArrowRight":
        case "l":
          this.view.cursor.move("up");
          break;
        case "ArrowDown":
        case "j":
          this.view.cursor.move("down");
          break;
        case "ArrowLeft":
        case "h":
          this.view.cursor.move("left");
          break;

        default:
          break;
      }
    });
  }
}
