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

const searchInput = $('<input>');
searchInput.attr('type', 'search').attr('id', 'drink-search');

searchInput.on('input', () => {
    query = searchInput.val();
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

const intro = $('.bar-intro');
const grid = $('<div>');
const error = $('<p>');
error.attr('role', 'status');
grid.addClass('row g-3');

const filterBar = $('<div>');
filterBar.addClass('d-flex flex-wrap gap-2 my-3');
filterBar.attr('role', 'group').attr('aria-label', 'Drink category');

const filterButtons = [];
for (const cat of categories) {
    const button = $('<button>');
    button.attr('type','button');
    button.addClass('btn btn-outline-light');
    button.text(cat.label);
    button.data(category, cat.value);

    button.on('click', () => {
        category = cat.value;
        render();
    });

    filterButtons.push(button);
    filterBar.append(button);
}

intro.after(searchInput, filterBar, error, grid);

function createDrinkCard(drink) {
    const col = $('<div>');
    col.addClass('col-12 col-sm-6 col-lg-4');
    const card = $('<div>');
    card.addClass('card h-100 bg-transparent text-white border-secondary');
    const body = $('<div>');
    body.addClass('card-body');
    const title = $('<h3>');
    title.addClass('h5 card-title');
    const img = $('<img>');
    img.addClass('bar-image w-100');
    const price = $('<p>');

    img.attr('src', drink.image);
    img.attr('alt', `${drink.name} drink`);

    title.text(drink.name);
    price.text(`${drink.price} ₸`);

    body.append(title, price);
    card.append(img, body);
    col.append(card);

    return col;
}

function render() {
    const result = filter(drinks, category, query);
    grid.empty();
    for (const drink of result) {
        grid.append(createDrinkCard(drink));
    }
    grid.hide();
    grid.fadeIn(1000);
    for (const button of filterButtons) {
        const isActive = button.data('category') === category;
        button.toggleClass('active', isActive);
        button.attr('aria-pressed', String(isActive));
    }
    error.toggleClass('error', result.length === 0);
    if (result.length === 0) {
        error.text('No drinks found. Try another name');
    } else {
        error.text(`Showing ${result.length} of ${drinks.length} drinks`);
    }
}
$('.table-responsive').remove();

render();