import "./style.css";
import { Minesweeper } from "./minesweeper.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
      <div id="minesweeper-window"></div>
`;

const { Controller, Model, View } = Minesweeper;

const minesModule = new Controller(new Model(9, 9, 9), new View());
