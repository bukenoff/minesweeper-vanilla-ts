import styles from "./RestartButton.module.css";

console.log("styles", styles);

const ICONS_BY_STATE: Record<string, string> = {
  pending: styles.pending,
  active: styles.active,
  victory: styles.victory,
  loss: styles.loss,
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

    console.log("state is", state);

    this.innerHTML = `<button class="${styles.container} ${ICONS_BY_STATE[state]}"></button>`;
  }
}

customElements.define("restart-button", RestartButton);
