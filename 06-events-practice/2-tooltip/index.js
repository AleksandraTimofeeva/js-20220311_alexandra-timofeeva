class Tooltip {
  static instance;
  element;

  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');
    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = event => {
    // метод на прототипе
    this.moveTooltip(event);
  }

  onPointerOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  constructor() {
    // singleton
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  moveTooltip() {
    const dislocation = 10;
    const left = event.clientX + dislocation;
    const top = event.clientY + dislocation;
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerover', this.onPointerDown);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
