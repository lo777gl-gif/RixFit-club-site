'use strict';

const services = [
    {id: 1, name: 'Adult Pool', area: 'water', minutes: 60},
    {id: 2, name: 'Kids Pool', area: 'water', minutes: 45},
    {id: 3, name: 'Turkish Hammam', area: 'sauna', minutes: 30},
    {id: 4, name: 'Vaporarium', area: 'sauna', minutes: 30},
    {id: 5, name: 'Infrared Sauna', area: 'sauna', minutes: 30},
    {id: 6, name: 'Massage (SPA)', area: 'spa', minutes: 45},
    {id: 7, name: 'Summer Terrace', area: 'outdoor', minutes: 60}
];
const areas = ['all', 'water', 'sauna', 'spa', 'outdoor'];

function calculateMinutes(list, ids) {
    let total = 0;
    for (const item of list) {
        if (ids.includes(item.id)) {
            total += item.minutes;
        }
    }
    return total;
}

function validate(values, total) {
    const errors = {};
    const today = new Date().toLocaleDateString('en-CA');
    const now = new Date().toTimeString().slice(0, 5);
    if (total === 0) {
        errors.services = 'Choose at least one service.';
    }
    if (values.name.length < 2) {
        errors.name = 'Enter your name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact) && !/^\+?[0-9\s()-]{10,15}$/.test(values.contact)) {
        errors.contact = 'Enter a valid email or phone number.';
    }
    if (values.date === '' || values.date < today) {
        errors.date = 'Choose today or a future date.';
    }
    if (values.time === '') {
        errors.time = 'Choose a start time.';
    } else if (values.date === today && values.time <= now) {
        errors.time = 'For today, choose a start time that is still ahead.';
    }
    const people = Number(values.people);
    if (!Number.isInteger(people) || people < 1 || people > 10) {
        errors.people = 'Participants must be a whole number from 1 to 10.';
    }
    return errors;
}

function createElement(tag, classes, text = '') {
    const element = document.createElement(tag);
    element.classList.add(...classes);
    element.textContent = text;
    return element;
}

let area = 'all';
let selectedIds = [];

const planner = createElement('section', ['mt-4']);
const chips = createElement('div', ['d-flex', 'flex-wrap', 'gap-2', 'my-3']);
const count = createElement('p', ['mb-2']);
const grid = createElement('div', ['row', 'g-3', 'mb-3']);
const summary = createElement('p', ['mb-3']);
const form = createElement('form', []);
const result = createElement('div', ['success', 'hidden']);
form.noValidate = true;
count.setAttribute('role', 'status');

function updateSummary() {
    const total = calculateMinutes(services, selectedIds);
    summary.classList.remove('error');
    summary.textContent = total === 0 ? 'No services chosen yet.' : `Chosen: ${selectedIds.length}. Total time: ${total} min.`;
}

function createServiceCard(service) {
    const col = createElement('div', ['col-12', 'col-md-6', 'col-lg-4']);
    const card = createElement('label', ['card', 'h-100', 'border-secondary', 'p-3']);
    const checkbox = createElement('input', ['form-check-input', 'me-2']);
    checkbox.type = 'checkbox';
    checkbox.checked = selectedIds.includes(service.id);
    card.classList.toggle('selected', checkbox.checked);
    checkbox.addEventListener('change', () => {
        selectedIds = checkbox.checked ? [...selectedIds, service.id] : selectedIds.filter(id => id !== service.id);
        card.classList.toggle('selected', checkbox.checked);
        updateSummary();
    });
    card.append(checkbox, createElement('span', ['h5'], service.name), createElement('span', [], `One visit: ${service.minutes} min`));
    col.append(card);
    return col;
}

const chipButtons = areas.map(name => {
    const button = createElement('button', ['btn', 'btn-outline-light'], name);
    button.type = 'button';
    button.addEventListener('click', () => {
        area = name;
        render();
    });
    chips.append(button);
    return button;
});

function render() {
    const visible = services.filter(item => area === 'all' || item.area === area);
    grid.replaceChildren(...visible.map(createServiceCard));
    chipButtons.forEach((button, index) => button.classList.toggle('active', areas[index] === area));
    count.textContent = visible.length === 0 ? 'No services in this area.' : `Showing ${visible.length} of ${services.length} services.`;
    updateSummary();
}

const fieldDefs = [['name', 'Your name', 'text'], ['contact', 'Email or phone', 'text'], ['date', 'Date', 'date'],
    ['time', 'Start time', 'time'], ['people', 'Participants (1–10)', 'number']];
const fields = {};
for (const [key, labelText, type] of fieldDefs) {
    const label = createElement('label', ['form-label'], labelText);
    const input = createElement('input', ['form-control', 'mb-1']);
    const error = createElement('p', ['error', 'hidden']);
    label.htmlFor = input.id = `visit-${key}`;
    input.type = type;
    form.append(label, input, error);
    fields[key] = {input, error};
}
fields.people.input.value = '1';
const submitButton = createElement('button', ['btn', 'btn-primary', 'mt-2'], 'Send demonstration request');
form.append(submitButton);

form.addEventListener('submit', event => {
    event.preventDefault();
    result.classList.add('hidden');
    const values = {};
    let firstInvalid = null;
    for (const key of Object.keys(fields)) {
        values[key] = fields[key].input.value.trim();
    }
    const total = calculateMinutes(services, selectedIds);
    const errors = validate(values, total);
    if (errors.services !== undefined) {
        summary.classList.add('error');
        summary.textContent = errors.services;
        firstInvalid = grid.querySelector('input');
    }
    for (const key of Object.keys(fields)) {
        const message = errors[key] || '';
        fields[key].error.textContent = message;
        fields[key].error.classList.toggle('hidden', message === '');
        fields[key].input.classList.toggle('error', message !== '');
        if (message !== '' && firstInvalid === null) {
            firstInvalid = fields[key].input;
        }
    }
    if (firstInvalid !== null) {
        firstInvalid.focus();
        return;
    }
    const reference = Math.floor(1000 + Math.random() * 9000);
    result.textContent = `Thank you, ${values.name}. Demonstration request DEMO-${reference} for ${total} min on ${values.date} ` +
        `at ${values.time}, ${values.people} participant(s). No data was sent to a server and no real booking was created.`;
    result.classList.remove('hidden');
});

planner.append(createElement('h2', [], 'Visit Planner'), chips, count, grid, summary, form, result);
document.querySelector('main').append(planner);
render();
