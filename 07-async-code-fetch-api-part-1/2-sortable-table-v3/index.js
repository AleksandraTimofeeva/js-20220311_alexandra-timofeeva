import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];

  loading = false;

  onSortClick = event => {
    console.log(this.isSortLocally.toString())
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };

    if (column) {
      const {id, order} = column.dataset;
      const newOrder = toggleOrder(order);

      const sortedData = this.sortData(id, newOrder);
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortOnClient(sortedData);
      } else {
        this.sortOnServer(sortedData);
      }
    }
  };

  constructor(headerConfig = [], {
    url = '',
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render();
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate([]);
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order);

    // this.loadData(id, order).then(data => {
    //   this.element.innerHTML = this.getTemplate(data);
    // });

    console.log(data)

    this.renderBody(data);
    this.initEventListeners();

  }

  renderBody(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.data = data;
      this.subElements.body.innerHTML = this.getBody(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  getTemplate(data) {
    return `
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getBody(data)}
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

  async loadData(sort, order) {
    this.url.searchParams.set('_sort', sort);
    this.url.searchParams.set('_order', order)

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    // let response = await fetch('https://course-js.javascript.ru/api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30')
    // let dataArray = await response.json();
    return data;
  }

  getBody(data = []) {
    return data
      .map(item =>
        `<div class="sortable-table__row">
             ${this.getCell(item, data)}
          </div>`)
      .join('');
  }

  getCell(item) {
    return this.headerConfig.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    })
      .join('');
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  sortOnClient (sortedData) {

  }

  sortOnServer (sortedData) {
    this.subElements.body.innerHTML = this.getBody(sortedData);
  }


  getHeader() {
    return this.headerConfig.map(item => this.getHeaderRow(item)).join('');
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
         <span>${title}</span>
         ${this.getHeaderSortingArrow(id)}
      </div>`;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  sort(fieldValue, orderValue) {
    const sortedData = this.sortData(fieldValue, orderValue);
    const cell = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    cell.dataset.order = orderValue;
    this.subElements.body.innerHTML = this.getBody(sortedData);
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
    const {sortType, customSorting} = column;

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


