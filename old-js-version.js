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

'use strict';

const services = [
    {id: 1, name: 'Adult Pool', area: 'pool', minutes: 60},
    {id: 2, name: 'Kids Pool', area: 'pool', minutes: 45},
    {id: 3, name: 'Turkish Hammam', area: 'sauna', minutes: 30},
    {id: 4, name: 'Vaporarium', area: 'sauna', minutes: 30},
    {id: 5, name: 'Infrared Sauna', area: 'sauna', minutes: 30},
    {id: 6, name: 'Deck Chair Sunbathing', area: 'terrace', minutes: 60},
    {id: 7, name: 'Massage', area: 'spa', minutes: 45}
];

function createPanel(area) {
    const panel = document.createElement('div');
    panel.classList.add('service-fact', 'hidden');
    const message = document.createElement('p');
    message.setAttribute('role', 'status');
    const saved = loadFromStorage('rixfit-services', {})[area] || [];
    const checkboxes = [];

    for (const service of services) {
        if (service.area === area) {
            const label = document.createElement('label');
            label.classList.add('d-block', 'mb-2');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input', 'me-2');
            checkbox.value = service.name;
            checkbox.checked = saved.includes(service.name);
            label.append(checkbox, `${service.name} (${service.minutes} min)`);
            checkboxes.push(checkbox);
            panel.append(label);
        }
    }

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.classList.add('btn', 'btn-primary');
    saveButton.textContent = 'Save my choice';

    saveButton.addEventListener('click', () => {
        const chosen = loadFromStorage('rixfit-services', {});
        chosen[area] = checkboxes.filter(box => box.checked).map(box => box.value);
        saveToStorage('rixfit-services', chosen);
        message.classList.add('success');
        message.textContent = chosen[area].length === 0
            ? 'Choice cleared. Nothing saved for this area.'
            : `Saved on this device: ${chosen[area].join(', ')}. See it in My Account.`;
    });

    panel.append(saveButton, message);
    return panel;
}

for (const card of document.querySelectorAll('.service-card')) {
    const area = card.querySelector('h3').id;
    const panel = createPanel(area);
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.classList.add('btn', 'btn-outline-light', 'mt-3');
    toggleButton.textContent = 'Choose a service type';
    toggleButton.setAttribute('aria-expanded', 'false');

    toggleButton.addEventListener('click', () => {
        const isHidden = panel.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', String(!isHidden));
    });

    card.append(toggleButton, panel);
}


/* =====================================================================
   Assignment 6 - OLD plain-JavaScript versions (Yeren Yedige pages)
   Not linked to any page. Compare with the jQuery versions in
   js/reviews.js, js/equipment.js and js/account.js. Each block is wrapped in
   { } so its const/let names do not clash. Helpers such as createElement,
   showFieldError, validateFields come from js/main.js.
   ===================================================================== */

/* ---- Feature 1 (old): reviews form validation, plain JS ---- */
{
  function updateCharacterCounter() {
    const length = feedbackText.value.trim().length;
    let text = 'Use 10–2,000 characters. ' + length + ' / ' + TEXT_MAX + ' used.';
    if (length < TEXT_MIN) {
      text += ' ' + (TEXT_MIN - length) + ' more needed.';
    }
    feedbackHelp.textContent = text;
  }
  
  function getSelectedReviewArea() {
    const checked = areaInputs.find((input) => input.checked);
    return checked === undefined ? '' : checked.value;
  }
  
  function checkVisitCount(value) {
    if (value.trim() === '') {
      return '';
    }
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1 || count > 999) {
      return 'Enter the number of visits as a whole number from 1 to 999.';
    }
    return '';
  }
  
  function checkVisitDate(value) {
    if (value === '') {
      return '';
    }
    const date = parseDateValue(value);
    if (date === null || daysFromToday(date) > 0) {
      return 'The visit date cannot be in the future.';
    }
    return '';
  }
  
  function checkFeedbackText(text, rating) {
    const trimmed = text.trim();
    if (trimmed.length < TEXT_MIN || trimmed.length > TEXT_MAX) {
      return 'Enter feedback between 10 and 2,000 characters.';
    }
    if (rating !== '' && Number(rating) <= 2 && trimmed.length < LOW_RATING_MIN_TEXT) {
      return 'For a rating of 1 or 2, explain what went wrong in at least ' + LOW_RATING_MIN_TEXT + ' characters.';
    }
    return '';
  }
  
  function validateFeedback() {
    return validateFields([
      { field: visitorName, check: () => checkPersonName(visitorName.value, 'name') },
      { field: visitorEmail, check: () => checkEmail(visitorEmail.value) },
      { field: visitorPhone, check: () => checkPhone(visitorPhone.value, false) },
      { field: visitCount, check: () => checkVisitCount(visitCount.value) },
      { field: visitDate, check: () => checkVisitDate(visitDate.value) },
      { field: reviewRating, check: () => (reviewRating.value === '' ? 'Choose a rating from 1 to 5.' : '') },
      { field: feedbackText, check: () => checkFeedbackText(feedbackText.value, reviewRating.value) },
      { field: permission, check: () => (permission.checked ? '' : 'Agree to display your name and feedback, or keep your notes private.') }
    ]);
  }
  
  function createReviewFromForm() {
    return {
      id: 'review-' + Date.now(),
      name: visitorName.value.trim(),
      area: getSelectedReviewArea(),
      visitType: visitType.value,
      rating: Number(reviewRating.value),
      visitDate: visitDate.value,
      text: feedbackText.value.trim(),
      createdAt: new Date().toISOString()
    };
  }
  
  function hideFeedbackResult() {
    feedbackConfirmation.classList.add('hidden');
    hideMessage(feedbackErrors);
    feedbackPreview.replaceChildren();
  }
  
  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideFeedbackResult();
  
    const errors = validateFeedback();
    if (errors.length > 0) {
      showMessage(feedbackErrors, 'error', 'Your feedback was not saved. Please fix ' + errors.length + ' field(s):', errors);
      return;
    }
  
    const review = createReviewFromForm();
    reviews.push(review);
    const saved = saveToStorage(REVIEWS_KEY, reviews);
  
    feedbackConfirmation.replaceChildren(createElement('p', 'mb-0', saved
      ? 'Your review was saved on this device only and is shown in the review list above. It was not sent to RixFit or published online. Your email and phone were checked but not stored.'
      : 'Your review is shown in the list above, but this browser blocked saving, so it will disappear after reloading. Nothing was sent to RixFit.'));
    feedbackConfirmation.classList.remove('hidden');
  
    feedbackPreview.replaceChildren(
      createElement('p', 'fw-bold mt-2 mb-0', 'Summary'),
      createSummaryList([
        ['Name', review.name],
        ['Rating', review.rating + ' out of 5'],
        ['Area', reviewAreaLabels[review.area]],
        ['Visit type', visitTypeLabels[review.visitType]],
        ['Visits', visitCount.value === '' ? 'not given' : visitCount.value],
        ['Feedback', review.text]
      ])
    );
  
    renderReviews();
    feedbackForm.reset();
    feedbackResult.focus();
  });
  
  feedbackForm.addEventListener('reset', () => {
    clearFormState(feedbackForm);
    setTimeout(updateCharacterCounter, 0);
  });
  
  feedbackForm.addEventListener('input', (event) => {
    if (event.target.matches('.form-control, .form-select')) {
      clearFieldError(event.target);
    }
    if (event.target === feedbackText) {
      updateCharacterCounter();
    }
  });
  permission.addEventListener('change', () => clearFieldError(permission));
  
}

/* ---- Feature 2 (old): equipment list built in code + delegated click, plain JS ---- */
{
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
}

/* ---- Feature 3 (old): planned-visit list, show/hide + remove, plain JS ---- */
{
  function renderPlans() {
    scheduleList.replaceChildren();
    sortPlans(plans).forEach((plan) => scheduleList.append(createPlanItem(plan)));
  
    const isEmpty = plans.length === 0;
    scheduleEmpty.classList.toggle('hidden', !isEmpty);
    scheduleList.classList.toggle('hidden', isEmpty);
  
    if (isEmpty) {
      scheduleSummary.textContent = '';
      return;
    }
    const gymCount = plans.filter((plan) => plan.area === 'gym').length;
    scheduleSummary.textContent = plans.length + ' of ' + MAX_PLANS + ' weekly visits planned: ' + gymCount + ' gym, ' + (plans.length - gymCount) + ' pool.';
  }
  
  scheduleList.addEventListener('click', (event) => {
    const button = event.target.closest('.visit-remove');
    if (button === null) {
      return;
    }
    const removed = plans.find((plan) => plan.id === button.dataset.id);
    plans = plans.filter((plan) => plan.id !== button.dataset.id);
    saveToStorage(PLANS_KEY, plans);
    renderPlans();
    scheduleStatus.textContent = 'Removed: ' + describePlan(removed) + '.';
    scheduleStatus.classList.remove('hidden');
    scheduleStatus.focus();
  });
}
