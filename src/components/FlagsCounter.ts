import styles from "./FlagsCounter.module.css";

class FlagsCounter extends HTMLElement {
  static get observedAttributes() {
    return ["flags_left"];
  }
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: number, newValue: number) {
    if (name === "flags_left" && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const count = this.getAttribute("flags_left") ?? "0";

    this.innerHTML = `
      <div class="${styles.container}">
        <div class="${styles.flags_counter}"></div>: ${count}
      </div >
    `;
  }
}

customElements.define("flags-counter", FlagsCounter);
