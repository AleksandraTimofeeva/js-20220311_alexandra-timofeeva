
export default class SortableTable {
  element;
  subElements = {};

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order); // undefined
      const sortedData = this.sortData(id, newOrder);
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  };


  constructor(headerConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }


  getTemplate() {
    return `
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getColumnTitles()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getRows(this.data)}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
    `;
  }

  render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');
    const sortedData = this.sortData(id, order);

    wrapper.innerHTML = this.getTemplate(sortedData);

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  getColumnTitles() {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return this.headerConfig.map(
      item => {
        return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
           <span>${item.title}</span>
           ${this.getHeaderSortingArrow(id)}
        </div>`;
      }
    ).join('');
  }

  getHeaderSortingArrow (id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getRows(data = []) {
    return data.map(
      item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
             ${this.getCell(item)}
          </a>
        `;
      }).join('');
  }

  getCell(item) {
    return this.headerConfig.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  sort(fieldValue, orderValue) {
    const sortedData = this.sortData(fieldValue, orderValue);
    const cell = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    cell.dataset.order = orderValue;
    this.subElements.body.innerHTML = this.getRows(sortedData);
  }

  sortData(field, order) {
    const locales = ['ru', 'en'];
    const options = {
      caseFirst: 'upper',
    };
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType, customSorting } = column;

    return [...this.data].sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], locales, options);
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }


  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

