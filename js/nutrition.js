'use strict';

const drinks = [
    {id: 1, name: 'Sea Buckthorn-Lime', category: 'tea', price: 1800, price400: null, image: 'images/seabucktorn-lime-tea.jpg'},
    {id: 2, name: 'Raspberry-Cinnamon', category: 'tea', price: 1800, price400: null, image: 'images/raspberry-cinnamon-tea.jpg'},
    {id: 3, name: 'Moroccan', category: 'tea', price: 1800, price400: null, image: 'images/moroccan-mint-tea.jpg'},
    {id: 4, name: 'Apple', category: 'juice', price: 1600, price400: 2200, image: 'images/apple-fresh.jpg'},
    {id: 5, name: 'Apple-Carrot', category: 'juice', price: 1600, price400: 2200, image: 'images/apple-carrot-fresh.jpg'},
    {id: 6, name: 'Carrot', category: 'juice', price: 1600, price400: 2200, image: 'images/carrot-fresh.jpg'},
    {id: 7, name: 'Orange-Apple-Carrot', category: 'juice', price: 1600, price400: 2200, image: 'images/orange-carrot-apple-fresh.jpg'},
    {id: 8, name: 'Orange-Apple', category: 'juice', price: 1600, price400: 2200, image: 'images/orange-apple-fresh.webp'},
    {id: 9, name: 'Orange-Carrot', category: 'juice', price: 1600, price400: 2200, image: 'images/orange-carrot-fresh.png'},
    {id: 10, name: 'Orange', category: 'juice', price: 1600, price400: 2200, image: 'images/orange-fresh.webp'},
    {id: 11, name: 'Milkshake', category: 'milkshake', price: 1900, price400: null, image: 'images/milkshake.jpg'}
];

const categories = [
    {value: 'all', label: 'All'},
    {value: 'tea', label: 'Tea'},
    {value: 'juice', label: 'Fresh juices'},
    {value: 'milkshake', label: 'Milkshakes'}
];

let category = 'all';
let query = '';

const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.id = 'drink-search';

searchInput.addEventListener('input', () => {
    query = searchInput.value;
    query = query.trim().toLowerCase();
    render();
});

function filter(drinks, category, query) {
    const result = [];
    for (const item of drinks) {
        if ((category === 'all' || item.category === category) && item.name.toLowerCase().includes(query)) {
            result.push(item);
        }
    }
    return result;
}

const intro = document.querySelector('.bar-intro');
const grid = document.createElement('div');
const error = document.createElement('p');
error.setAttribute('role', 'status');
grid.classList.add('row', 'g-3');

const filterBar = document.createElement('div');
filterBar.classList.add('d-flex', 'flex-wrap', 'gap-2', 'my-3');
filterBar.setAttribute('role', 'group');
filterBar.setAttribute('aria-label', 'Drink category');

const filterButtons = [];
for (const cat of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-light');
    button.textContent = cat.label;
    button.dataset.category = cat.value;

    button.addEventListener('click', () => {
        category = cat.value;
        render();
    });

    filterButtons.push(button);
    filterBar.append(button);
}

intro.after(searchInput, filterBar, error, grid);

function createDrinkCard(drink) {
    const col = document.createElement('div');
    col.classList.add('col-12', 'col-sm-6', 'col-lg-4');
    const card = document.createElement('div');
    card.classList.add('card', 'h-100', 'bg-transparent', 'text-white', 'border-secondary');
    const body = document.createElement('div');
    body.classList.add('card-body');
    const title = document.createElement('h3');
    title.classList.add('h5', 'card-title');
    const img = document.createElement('img');
    img.classList.add('bar-image', 'w-100');
    const price = document.createElement('p');

    img.src = drink.image;
    img.alt = `${drink.name} drink`;

    title.textContent = drink.name;
    price.textContent = `${drink.price} ₸`;

    body.append(title, price);
    card.append(img, body);
    col.append(card);

    return col;
}

function render() {
    const result = filter(drinks, category, query);
    grid.replaceChildren();
    for (const drink of result) {
        grid.append(createDrinkCard(drink));
    }
    for (const button of filterButtons) {
        const isActive = button.dataset.category === category;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    }
    error.classList.toggle('error', result.length === 0);
    if (result.length === 0) {
        error.textContent = 'No drinks found. Try another name';
    } else {
        error.textContent = `Showing ${result.length} of ${drinks.length} drinks`;
    }
}
for (const wrapper of document.querySelectorAll('.table-responsive')) {
    wrapper.remove();
}

render();