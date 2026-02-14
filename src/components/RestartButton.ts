import styles from "./RestartButton.module.css";

const ICONS_BY_STATE: Record<string, string> = {
  pending: "<i class='fa-regular fa-lg fa-face-smile'></i>",
  active: "<i class='fa-regular fa-lg fa-face-smile'></i>",
  victory: "<i class='fa-regular fa-lg fa-face-grin'></i>",
  loss: "<i class='fa-regular fa-lg fa-face-frown'></i>",
};

class RestartButton extends HTMLElement {
  static get observedAttributes() {
    return ["game_state"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
  }

  attributeChangedCallback(name: string, old_value: string, new_value: string) {
    if (name === "game_state" && old_value !== new_value) {
      this.render();
    }
  }

  private handleClick = () => {
    this.dispatchEvent(
      new CustomEvent("restart", { bubbles: true, composed: true }),
    );
  };

  render() {
    const state = this.getAttribute("game_state") ?? "pending";

    this.innerHTML = `<button class="${styles.container}">${ICONS_BY_STATE[state]}</button>`;
  }
}

customElements.define("restart-button", RestartButton);
