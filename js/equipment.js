'use strict';

const equipmentCatalog = [
  { id: 'treadmill', name: 'Treadmill', area: 'cardio', fact: '2 machines in the archived listing', unit: 'minutes', tip: 'Start walking, then raise the speed gradually.' },
  { id: 'bike', name: 'Exercise bike', area: 'cardio', fact: 'Listed as an available type', unit: 'minutes', tip: 'Set the saddle at hip height.' },
  { id: 'elliptical', name: 'Elliptical trainer', area: 'cardio', fact: 'Listed as an available type', unit: 'minutes', tip: 'Keep your feet flat on the pedals.' },
  { id: 'rowing', name: 'Rowing machine', area: 'cardio', fact: 'Listed as an available type', unit: 'minutes', tip: 'Push with the legs first, then pull with the arms.' },
  { id: 'technogym', name: 'Technogym resistance machines', area: 'strength', fact: 'Listed as gym equipment', unit: 'sets', tip: 'Check the machine label and adjust the seat first.' },
  { id: 'dumbbells', name: 'Dumbbells and free weights', area: 'strength', fact: 'Listed as gym equipment', unit: 'sets', tip: 'Return dumbbells to the rack by weight.' },
  { id: 'platform', name: 'Lifting platform', area: 'strength', fact: 'Listed as gym equipment', unit: 'sets', tip: 'Ask a trainer to spot heavy lifts.' },
  { id: 'benches', name: 'Benches', area: 'strength', fact: 'Named in the equipment families list', unit: 'sets', tip: 'Use your own towel on the bench.' },
  { id: 'pool', name: 'Swimming pool', area: 'pool', fact: 'Pool access included in the archived offer', unit: 'minutes', tip: 'Shower first and wear a swim cap.' }
];

const equipmentAreaLabels = { cardio: 'Cardio', strength: 'Strength', pool: 'Pool' };

const WARM_UP_MINUTES = 10;
const COOL_DOWN_MINUTES = 5;
const SECONDS_PER_REP = 4;
const REST_SECONDS_PER_SET = 90;
const LONG_SESSION_MINUTES = 120;


const equipmentBody = document.getElementById('equipment-list');
const equipmentTable = equipmentBody.closest('table');
const actionHeader = createElement('th', '', 'Action');
actionHeader.scope = 'col';
equipmentTable.querySelector('thead tr').append(actionHeader);

const inventoryControls = createElement('form', 'row g-2 align-items-end mb-3');
inventoryControls.setAttribute('role', 'search');
inventoryControls.setAttribute('aria-label', 'Filter equipment');
const areaFilter = createLabeledControl('select', 'equipment-area', 'Area', 'col-12 col-sm-4');
addOptions(areaFilter.control, [
  { value: 'all', label: 'All areas' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Strength' },
  { value: 'pool', label: 'Pool' }
]);
const equipmentSearch = createLabeledControl('input', 'equipment-search', 'Search equipment', 'col-12 col-sm-5');
equipmentSearch.control.type = 'search';
equipmentSearch.control.placeholder = 'e.g. bike, dumbbells';
const inventoryResetWrapper = createElement('div', 'col-12 col-sm-3');
const inventoryReset = createElement('button', 'btn btn-outline-light w-100', 'Reset');
inventoryReset.type = 'button';
inventoryResetWrapper.append(inventoryReset);
inventoryControls.append(areaFilter.wrapper, equipmentSearch.wrapper, inventoryResetWrapper);

const inventoryCount = createElement('p', 'small');
inventoryCount.setAttribute('aria-live', 'polite');

const tableWrapper = equipmentTable.closest('.table-responsive');
tableWrapper.insertAdjacentElement('beforebegin', inventoryControls);
tableWrapper.insertAdjacentElement('beforebegin', inventoryCount);

let sessionItems = [];

function filterEquipment(items, area, searchText) {
  const query = searchText.trim().toLowerCase();
  return items.filter((item) => {
    const matchesArea = area === 'all' || item.area === area;
    const text = (item.name + ' ' + item.tip).toLowerCase();
    return matchesArea && (query === '' || text.includes(query));
  });
}

function isInSession(id) {
  return sessionItems.some((entry) => entry.id === id);
}

function createEquipmentRow(item) {
  const row = createElement('tr');
  const areaCell = createElement('th', '', equipmentAreaLabels[item.area]);
  areaCell.scope = 'row';
  const nameCell = createElement('td');
  nameCell.append(createElement('span', 'd-block', item.name), createElement('small', 'text-white-50', item.tip));
  const actionCell = createElement('td');
  const addButton = createElement('button', 'btn btn-outline-light btn-sm', isInSession(item.id) ? 'Added' : 'Add to session');
  addButton.type = 'button';
  addButton.dataset.id = item.id;
  addButton.disabled = isInSession(item.id);
  addButton.setAttribute('aria-label', 'Add ' + item.name + ' to my session');
  actionCell.append(addButton);
  row.append(areaCell, nameCell, createElement('td', '', item.fact), actionCell);
  return row;
}

function createNoResultsRow() {
  const row = createElement('tr');
  const cell = createElement('td', 'error');
  cell.colSpan = 4;
  cell.append(document.createTextNode('No equipment matches your filters. '));
  const resetLink = createElement('button', 'btn btn-outline-light btn-sm', 'Show all equipment');
  resetLink.type = 'button';
  resetLink.dataset.action = 'reset';
  cell.append(resetLink);
  row.append(cell);
  return row;
}

function renderInventory() {
  const matches = filterEquipment(equipmentCatalog, areaFilter.control.value, equipmentSearch.control.value);
  equipmentBody.replaceChildren();
  matches.forEach((item) => equipmentBody.append(createEquipmentRow(item)));
  if (matches.length === 0) {
    equipmentBody.append(createNoResultsRow());
  }
  inventoryCount.textContent = 'Showing ' + matches.length + ' of ' + equipmentCatalog.length + ' equipment entries.';
}

function resetInventory() {
  inventoryControls.reset();
  renderInventory();
  equipmentSearch.control.focus();
}

inventoryControls.addEventListener('submit', (event) => event.preventDefault());
areaFilter.control.addEventListener('change', renderInventory);
equipmentSearch.control.addEventListener('input', renderInventory);
inventoryReset.addEventListener('click', resetInventory);

equipmentBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button === null) {
    return;
  }
  if (button.dataset.action === 'reset') {
    resetInventory();
  } else {
    addToSession(button.dataset.id);
  }
});


const builder = createElement('section', 'py-4');
builder.id = 'session-builder';
builder.setAttribute('aria-labelledby', 'session-heading');
const builderHeading = createElement('h2', '', 'Build your session');
builderHeading.id = 'session-heading';
const builderHelp = createElement('p', '', 'Add equipment from the inventory, then set minutes for cardio and the pool or sets × reps for strength. The estimate includes a 10-minute warm-up and a 5-minute cool-down.');
const sessionEmpty = createElement('p', 'border border-secondary rounded p-3', 'Your session is empty. Use "Add to session" in the inventory above.');
const sessionList = createElement('ul', 'list-group mb-3');
const sessionSummary = createElement('div', 'hidden');
sessionSummary.setAttribute('aria-live', 'polite');
const sessionActions = createElement('div', 'd-flex flex-wrap gap-2');
const planLink = createElement('a', 'btn btn-primary', 'Plan this visit');
const clearSessionButton = createElement('button', 'btn btn-outline-light', 'Clear session');
clearSessionButton.type = 'button';
sessionActions.append(planLink, clearSessionButton);
const sessionActionsWrapper = createElement('div', 'hidden');
sessionActionsWrapper.append(sessionActions);

builder.append(builderHeading, builderHelp, sessionEmpty, sessionList, sessionSummary, sessionActionsWrapper);
document.getElementById('inventory').insertAdjacentElement('afterend', builder);

function addToSession(id) {
  const item = equipmentCatalog.find((equipment) => equipment.id === id);
  if (item === undefined || isInSession(id)) {
    return;
  }
  if (item.unit === 'minutes') {
    sessionItems.push({ id: id, minutes: item.area === 'pool' ? 30 : 15 });
  } else {
    sessionItems.push({ id: id, sets: 3, reps: 10 });
  }
  renderInventory();
  renderSession();
  const newItemInput = sessionList.querySelector('li:last-child input');
  newItemInput.focus();
}

function removeFromSession(id) {
  sessionItems = sessionItems.filter((entry) => entry.id !== id);
  renderInventory();
  renderSession();
  builderHeading.setAttribute('tabindex', '-1');
  builderHeading.focus();
}

function createNumberInput(id, label, value, min, max, entryId, property) {
  const control = createLabeledControl('input', id, label, 'col-6 col-sm-4 col-md-3');
  control.control.type = 'number';
  control.control.min = String(min);
  control.control.max = String(max);
  control.control.value = String(value);
  control.control.classList.add('form-control-sm');
  control.control.dataset.entry = entryId;
  control.control.dataset.property = property;
  return control.wrapper;
}

function createSessionItem(entry) {
  const item = equipmentCatalog.find((equipment) => equipment.id === entry.id);
  const listItem = createElement('li', 'list-group-item bg-dark text-white border-secondary');
  listItem.append(createElement('p', 'fw-bold mb-2', item.name + ' (' + equipmentAreaLabels[item.area] + ')'));

  const row = createElement('div', 'row g-2 align-items-end');
  if (item.unit === 'minutes') {
    row.append(createNumberInput('minutes-' + entry.id, 'Minutes (5–60)', entry.minutes, 5, 60, entry.id, 'minutes'));
  } else {
    row.append(
      createNumberInput('sets-' + entry.id, 'Sets (1–6)', entry.sets, 1, 6, entry.id, 'sets'),
      createNumberInput('reps-' + entry.id, 'Reps (5–20)', entry.reps, 5, 20, entry.id, 'reps')
    );
  }
  const removeWrapper = createElement('div', 'col-12 col-sm-4 col-md-3');
  const removeButton = createElement('button', 'btn btn-outline-danger btn-sm', 'Remove');
  removeButton.type = 'button';
  removeButton.dataset.remove = entry.id;
  removeButton.setAttribute('aria-label', 'Remove ' + item.name + ' from session');
  removeWrapper.append(removeButton);
  row.append(removeWrapper);
  listItem.append(row);
  return listItem;
}

function getEntryMinutes(entry) {
  if (entry.minutes !== undefined) {
    return entry.minutes;
  }
  const seconds = entry.sets * (entry.reps * SECONDS_PER_REP + REST_SECONDS_PER_SET);
  return Math.ceil(seconds / 60);
}

function calculateSession(entries) {
  const minutesByArea = { cardio: 0, strength: 0, pool: 0 };
  entries.forEach((entry) => {
    const item = equipmentCatalog.find((equipment) => equipment.id === entry.id);
    minutesByArea[item.area] += getEntryMinutes(entry);
  });
  const workMinutes = minutesByArea.cardio + minutesByArea.strength + minutesByArea.pool;
  return { minutesByArea: minutesByArea, totalMinutes: WARM_UP_MINUTES + workMinutes + COOL_DOWN_MINUTES };
}

function getPlanSuggestion(minutesByArea) {
  const gymMinutes = minutesByArea.cardio + minutesByArea.strength;
  if (minutesByArea.pool > gymMinutes) {
    return { area: 'pool', focus: 'swimming' };
  }
  return { area: 'gym', focus: minutesByArea.cardio > minutesByArea.strength ? 'cardio' : 'strength' };
}

function updateSessionSummary() {
  const result = calculateSession(sessionItems);
  const suggestion = getPlanSuggestion(result.minutesByArea);

  sessionSummary.replaceChildren(createSummaryList([
    ['Cardio', formatDuration(result.minutesByArea.cardio)],
    ['Strength', formatDuration(result.minutesByArea.strength)],
    ['Pool', formatDuration(result.minutesByArea.pool)],
    ['Estimated total', formatDuration(result.totalMinutes) + ' including warm-up and cool-down']
  ]));
  if (result.totalMinutes > LONG_SESSION_MINUTES) {
    sessionSummary.append(createElement('p', 'error', 'Warning: this session is longer than 2 hours. Consider splitting it into two visits.'));
  }
  sessionSummary.append(createElement('p', 'small mb-3', 'Estimate only: real timing depends on your pace and how busy the floor is. This plan does not reserve equipment.'));

  planLink.href = 'account.html?area=' + suggestion.area + '&focus=' + suggestion.focus + '#visit-plan';
  planLink.textContent = 'Plan this ' + suggestion.area + ' visit';
}

function renderSession() {
  sessionList.replaceChildren();
  sessionItems.forEach((entry) => sessionList.append(createSessionItem(entry)));

  const isEmpty = sessionItems.length === 0;
  sessionEmpty.classList.toggle('hidden', !isEmpty);
  sessionSummary.classList.toggle('hidden', isEmpty);
  sessionActionsWrapper.classList.toggle('hidden', isEmpty);
  if (!isEmpty) {
    updateSessionSummary();
  }
}

sessionList.addEventListener('input', (event) => {
  const input = event.target;
  const value = Number(input.value);
  const min = Number(input.min);
  const max = Number(input.max);
  const entry = sessionItems.find((item) => item.id === input.dataset.entry);

  if (input.value === '' || !Number.isInteger(value) || value < min || value > max) {
    showFieldError(input, 'Enter a whole number from ' + min + ' to ' + max + '.');
    return;
  }
  clearFieldError(input);
  entry[input.dataset.property] = value;
  updateSessionSummary();
});

sessionList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-remove]');
  if (button !== null) {
    removeFromSession(button.dataset.remove);
  }
});

clearSessionButton.addEventListener('click', () => {
  sessionItems = [];
  renderInventory();
  renderSession();
  equipmentSearch.control.focus();
});

renderInventory();
renderSession();
