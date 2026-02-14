import "./style.css";
import { Controller } from "./controller.ts";
import { Model } from "./model.ts";
import { View } from "./view.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
      <div id="minesweeper-window"></div>
`;

new Controller(new Model(9, 9, 9), new View());
