class DifficultySelect extends HTMLElement {
  static get observedAttributes() {
    return ["difficulty"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: number, newValue: number) {
    if (name === "difficulty" && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const current_value = this.getAttribute("difficulty");

    this.innerHTML = `
      <select name="difficulty" id="difficulty">
        <option value="easy" selected={${current_value === "easy"}}>Easy</option>
        <option value="normal" selected={${current_value === "normal"}>Normal</option>
        <option value="hard" selected={${current_value === "hard"}}>Hard</option>
      </select>
    `;
  }
}

customElements.define("difficulty-select", DifficultySelect);
