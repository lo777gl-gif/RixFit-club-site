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


// ------------------------------------------------------------------------------------------------------------------------------------------------------
// MY PART (Nuraly)

// Page script for index.html (booking), rules.html (rules filter) and register.html (registration).
// Requires main.js to be loaded first (SERVICES, TRAINERS and the shared helpers live there).

const MAX_GUESTS = 4;
const BOOKING_WINDOW_DAYS = 30;

const PASSWORD_RULES = [
    { label: 'At least 8 characters', test: (value) => value.length >= 8 },
    { label: 'An uppercase letter (A-Z)', test: (value) => /[A-Z]/.test(value) },
    { label: 'A lowercase letter (a-z)', test: (value) => /[a-z]/.test(value) },
    { label: 'A digit (0-9)', test: (value) => /\d/.test(value) },
    { label: 'A special character (! ? # $ ...)', test: (value) => /[^A-Za-z0-9\s]/.test(value) }
];

// Date and price helpers (booking)

function getServiceByKey(key) {
    return SERVICES.find((service) => service.key === key);
}

function getTrainersForArea(area) {
    return TRAINERS.filter((trainer) => trainer.area === area);
}

function calculateTotal(service, guests) {
    return service.price * guests;
}

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function toISODate(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseLocalDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getVisitDateError(value) {
    if (value === '') {
        return 'Date: choose the day of your visit.';
    }
    const visit = parseLocalDate(value);
    if (Number.isNaN(visit.getTime())) {
        return 'Date: enter a valid date.';
    }
    const today = startOfToday();
    if (visit < today) {
        return 'Date: the visit date cannot be in the past.';
    }
    if (visit > addDays(today, BOOKING_WINDOW_DAYS)) {
        return `Date: booking is possible up to ${BOOKING_WINDOW_DAYS} days ahead.`;
    }
    return '';
}

function createInputField({ id, name, label, type }) {
    const column = createEl('div', 'col-md-6');
    const labelEl = createEl('label', 'form-label', label);
    labelEl.htmlFor = id;
    const input = createEl('input', 'form-control');
    input.type = type;
    input.id = id;
    input.name = name;
    column.append(labelEl, input);
    return { column, input };
}

// Booking form (index.html)

function initBookingForm() {
    const form = document.querySelector('#booking-form');
    if (!form) {
        return;
    }

    const errorBox = document.querySelector('#booking-error');
    const confirmBox = document.querySelector('#booking-confirmation');
    const serviceField = form.elements.service;
    const trainerField = form.elements.trainer;

    // Extra fields are created here so the HTML stays untouched
    const dateField = createInputField({ id: 'visitDate', name: 'visitDate', label: 'Visit date:', type: 'date' });
    dateField.input.min = toISODate(startOfToday());
    dateField.input.max = toISODate(addDays(startOfToday(), BOOKING_WINDOW_DAYS));

    const guestsField = createInputField({ id: 'guests', name: 'guests', label: `Guests (1-${MAX_GUESTS}):`, type: 'number' });
    guestsField.input.min = '1';
    guestsField.input.max = String(MAX_GUESTS);
    guestsField.input.value = '1';

    form.elements.comments.closest('.col-12').before(dateField.column, guestsField.column);

    const summaryBox = createEl('div', 'alert alert-secondary mt-3');
    summaryBox.id = 'booking-summary';
    form.querySelector('#btn-submit').parentElement.before(summaryBox);

    function updateTrainerOptions(service) {
        trainerField.textContent = '';

        if (!service) {
            trainerField.disabled = true;
            trainerField.appendChild(new Option('- Choose trainer -', 'none'));
            return;
        }
        if (!service.needsTrainer) {
            trainerField.disabled = true;
            trainerField.appendChild(new Option('- Trainer is not required for this service -', 'none'));
            return;
        }

        trainerField.disabled = false;
        trainerField.appendChild(new Option('- Choose trainer -', 'none'));
        const fragment = document.createDocumentFragment();
        getTrainersForArea(service.area).forEach((trainer) => {
            fragment.appendChild(new Option(trainer.name, trainer.id));
        });
        trainerField.appendChild(fragment);
    }

    function readBookingData() {
        const checkedGender = form.querySelector('input[name="gender"]:checked');
        return {
            name: form.elements.userName.value.trim(),
            email: form.elements.userEmail.value.trim(),
            phone: form.elements.userPhone.value.trim(),
            age: form.elements.age.value.trim(),
            gender: checkedGender ? checkedGender.value : '',
            service: getServiceByKey(serviceField.value),
            trainerId: trainerField.value,
            date: dateField.input.value,
            guests: Number(guestsField.input.value)
        };
    }

    function validateBooking(data) {
        const errors = [];
        const add = (field, message) => errors.push({ field, message });
        const ageNumber = Number(data.age);
        const ageIsValid = data.age !== '' && Number.isInteger(ageNumber) && ageNumber >= 12 && ageNumber <= 90;

        if (!/^[\p{L}][\p{L}\s'-]+$/u.test(data.name)) {
            add(form.elements.userName, 'Name: write at least 2 letters.');
        }
        if (!isValidEmail(data.email)) {
            add(form.elements.userEmail, 'Email: write a correct address (for example: name@mail.com).');
        }
        if (!isValidPhone(data.phone)) {
            add(form.elements.userPhone, 'Phone: write from 10 to 15 digits (for example, +7 700 700 70 70).');
        }
        if (!ageIsValid) {
            add(form.elements.age, 'Age: enter a whole number from 12 to 90 (younger visitors are not admitted).');
        }
        if (data.gender === '') {
            add(form.querySelector('input[name="gender"]'), 'Gender: choose one of the variants.');
        }
        if (!data.service) {
            add(serviceField, 'Service: please select a training direction or service.');
        } else if (data.service.needsTrainer && (data.trainerId === '' || data.trainerId === 'none')) {
            add(trainerField, 'Trainer: please select an available coach for this service.');
        }
        // Rule that combines two fields: service minimum age vs visitor age
        if (data.service && ageIsValid && ageNumber < data.service.minAge) {
            add(form.elements.age, `Age: ${data.service.label} is available from ${data.service.minAge} years.`);
        }

        const dateError = getVisitDateError(data.date);
        if (dateError) {
            add(dateField.input, dateError);
        }
        if (!Number.isInteger(data.guests) || data.guests < 1 || data.guests > MAX_GUESTS) {
            add(guestsField.input, `Guests: choose from 1 to ${MAX_GUESTS} people.`);
        }
        if (!form.elements.agree.checked) {
            add(form.elements.agree, 'You must agree with the club rules.');
        }
        return errors;
    }

    function renderBookingSummary() {
        const data = readBookingData();
        const trainer = TRAINERS.find((item) => item.id === data.trainerId);
        const guestsAreValid = Number.isInteger(data.guests) && data.guests >= 1 && data.guests <= MAX_GUESTS;

        summaryBox.textContent = '';
        summaryBox.appendChild(createEl('strong', '', 'Booking summary'));

        if (!data.service) {
            summaryBox.appendChild(createEl('p', 'mb-0 mt-1', 'Choose a service to see your estimate.'));
            return;
        }

        let coachText = 'not required';
        if (data.service.needsTrainer) {
            coachText = trainer ? trainer.name : 'not chosen yet';
        }

        const lines = [
            `Service: ${data.service.label}`,
            `Coach: ${coachText}`,
            `Date: ${data.date || 'not chosen yet'}`,
            `Guests: ${guestsAreValid ? data.guests : `enter 1-${MAX_GUESTS}`}`,
            `Estimated total: ${guestsAreValid ? formatPrice(calculateTotal(data.service, data.guests)) : '-'}`
        ];
        lines.forEach((line) => summaryBox.appendChild(createEl('p', 'mb-1 mt-1', line)));
        summaryBox.appendChild(createEl('small', 'd-block text-muted', 'Estimate only: the final price is confirmed by the club.'));
    }

    serviceField.addEventListener('change', () => {
        updateTrainerOptions(getServiceByKey(serviceField.value));
    });
    form.addEventListener('input', renderBookingSummary);
    form.addEventListener('change', renderBookingSummary);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        errorBox.textContent = '';
        confirmBox.textContent = '';
        clearFormErrors(form);

        const data = readBookingData();
        const errors = validateBooking(data);

        if (errors.length > 0) {
            errors.forEach((error) => showFieldError(error.field, error.message));

            const alertBox = createEl('div', 'alert alert-danger mt-3');
            alertBox.setAttribute('role', 'alert');
            alertBox.textContent = `Please fix ${errors.length} field(s) marked above and send the form again.`;
            errorBox.appendChild(alertBox);

            errors[0].field.focus();
            return;
        }

        const trainer = TRAINERS.find((item) => item.id === data.trainerId);
        const total = calculateTotal(data.service, data.guests);

        const alertBox = createEl('div', 'alert alert-success mt-3');
        alertBox.setAttribute('role', 'status');
        alertBox.appendChild(createEl('h5', 'alert-heading', `Request #${generateRefNumber()} received!`));
        alertBox.appendChild(createEl('p', 'mb-1', `Client: ${data.name} | Guests: ${data.guests}`));
        alertBox.appendChild(createEl('p', 'mb-1', `Service: ${data.service.label} | Coach: ${data.service.needsTrainer ? trainer.name : 'not required'}`));
        alertBox.appendChild(createEl('p', 'mb-1', `Date: ${data.date} | Estimated total: ${formatPrice(total)}`));
        alertBox.appendChild(createEl('small', 'd-block text-muted mt-2 border-top pt-2',
            'Demo mode: no data was sent to a server. No real booking, payment or order was created.'));
        confirmBox.appendChild(alertBox);
    });

    form.addEventListener('reset', () => {
        errorBox.textContent = '';
        confirmBox.textContent = '';
        clearFormErrors(form);
        // Form values are restored after the reset event, so refresh the dependent parts afterwards
        setTimeout(() => {
            updateTrainerOptions(undefined);
            renderBookingSummary();
        }, 0);
    });

    updateTrainerOptions(undefined);
    renderBookingSummary();
}


// Rules search and filter (rules.html)

function initRulesFilter() {
    const clubSection = document.querySelector('#club-rules');
    const poolSection = document.querySelector('#swimming-pool-rules');
    if (!clubSection || !poolSection) {
        return;
    }

    // Build one flat list of rules from the existing markup
    const rules = [];
    clubSection.querySelectorAll('article').forEach((article) => {
        const category = article.querySelector('h3').textContent.replace(/^\d+\.\s*/, '');
        const container = article.closest('.col');
        article.querySelectorAll('li').forEach((item) => {
            rules.push({ item, container, category, text: item.textContent.toLowerCase() });
        });
    });
    poolSection.querySelectorAll('ol > li').forEach((item) => {
        rules.push({ item, container: poolSection, category: 'Swimming Pool', text: item.textContent.toLowerCase() });
    });

    const categories = [...new Set(rules.map((rule) => rule.category))];

    // Controls
    const bar = createEl('div', 'row g-2 align-items-end py-3');
    bar.setAttribute('role', 'search');

    const searchColumn = createEl('div', 'col-md-5');
    const searchLabel = createEl('label', 'form-label', 'Search rules');
    searchLabel.htmlFor = 'rules-search';
    const searchInput = createEl('input', 'form-control');
    searchInput.type = 'search';
    searchInput.id = 'rules-search';
    searchInput.placeholder = 'e.g. towel, locker, swim cap';
    searchColumn.append(searchLabel, searchInput);

    const categoryColumn = createEl('div', 'col-md-4');
    const categoryLabel = createEl('label', 'form-label', 'Category');
    categoryLabel.htmlFor = 'rules-category';
    const categorySelect = createEl('select', 'form-select');
    categorySelect.id = 'rules-category';
    categorySelect.appendChild(new Option('All categories', 'all'));
    categories.forEach((category) => categorySelect.appendChild(new Option(category, category)));
    categoryColumn.append(categoryLabel, categorySelect);

    const resetColumn = createEl('div', 'col-md-3');
    const resetButton = createEl('button', 'btn btn-outline-secondary w-100', 'Reset filters');
    resetButton.type = 'button';
    resetColumn.appendChild(resetButton);

    bar.append(searchColumn, categoryColumn, resetColumn);

    const countLine = createEl('p', 'mb-2');
    countLine.id = 'rules-count';
    countLine.setAttribute('aria-live', 'polite');

    const emptyState = createEl('div', 'alert alert-warning d-none',
        'No rules match your search. Try another word or press "Reset filters".');
    emptyState.id = 'rules-empty';
    emptyState.setAttribute('role', 'status');

    clubSection.before(bar, countLine, emptyState);

    function applyRulesFilter() {
        const query = searchInput.value.trim().toLowerCase();
        const category = categorySelect.value;
        let visibleCount = 0;

        rules.forEach((rule) => {
            const matchesText = query === '' || rule.text.includes(query);
            const matchesCategory = category === 'all' || rule.category === category;
            const isVisible = matchesText && matchesCategory;
            rule.item.classList.toggle('d-none', !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        // Hide a whole card/section when none of its rules match
        new Set(rules.map((rule) => rule.container)).forEach((container) => {
            const hasVisibleRule = rules.some((rule) => rule.container === container && !rule.item.classList.contains('d-none'));
            container.classList.toggle('d-none', !hasVisibleRule);
        });

        countLine.textContent = `Showing ${visibleCount} of ${rules.length} rules`;
        emptyState.classList.toggle('d-none', visibleCount !== 0);
    }

    function resetRulesFilter() {
        searchInput.value = '';
        categorySelect.value = 'all';
        applyRulesFilter();
        searchInput.focus();
    }

    searchInput.addEventListener('input', applyRulesFilter);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            resetRulesFilter();
        }
    });
    categorySelect.addEventListener('change', applyRulesFilter);
    resetButton.addEventListener('click', resetRulesFilter);

    applyRulesFilter();
}

// Registration form (register.html): front-end demo only

function isStrongPassword(value) {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}

function initRegisterForm() {
    const form = document.querySelector('#registerForm');
    if (!form) {
        return;
    }

    form.noValidate = true; // our own validation replaces the browser bubbles

    const errorBox = document.querySelector('#register-error');
    const confirmBox = document.querySelector('#register-confirmation');
    const usernameField = form.elements.username;
    const emailField = form.elements.email;
    const passwordField = form.elements.password;
    const confirmField = form.elements.confirmPassword;

    // Live checklist
    const checklist = createEl('ul', 'list-unstyled small mt-2');
    checklist.id = 'password-checklist';
    const checklistItems = PASSWORD_RULES.map(() => {
        const item = createEl('li');
        checklist.appendChild(item);
        return item;
    });
    passwordField.insertAdjacentElement('afterend', checklist);

    // Live match hint + Show/Hide button
    const matchHint = createEl('p', 'small mt-2 mb-0');
    matchHint.id = 'confirm-hint';
    matchHint.setAttribute('aria-live', 'polite');
    confirmField.insertAdjacentElement('afterend', matchHint);

    const toggleButton = createEl('button', 'btn btn-outline-light btn-sm mt-2', 'Show passwords');
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-pressed', 'false');
    toggleButton.setAttribute('aria-controls', 'password confirmPassword');
    matchHint.insertAdjacentElement('afterend', toggleButton);

    function renderChecklist() {
        PASSWORD_RULES.forEach((rule, index) => {
            const passed = rule.test(passwordField.value);
            checklistItems[index].textContent = `${passed ? '✓' : '✗'} ${rule.label}`;
            checklistItems[index].classList.toggle('text-success', passed);
            checklistItems[index].classList.toggle('text-secondary', !passed);
        });
    }

    function renderMatchHint() {
        if (confirmField.value === '') {
            matchHint.textContent = '';
            return;
        }
        const matches = confirmField.value === passwordField.value;
        matchHint.textContent = matches ? '✓ Passwords match' : '✗ Passwords do not match';
        matchHint.classList.toggle('text-success', matches);
        matchHint.classList.toggle('text-secondary', !matches);
    }

    passwordField.addEventListener('input', () => {
        renderChecklist();
        renderMatchHint();
    });
    confirmField.addEventListener('input', renderMatchHint);

    toggleButton.addEventListener('click', () => {
        const willShow = passwordField.type === 'password';
        passwordField.type = willShow ? 'text' : 'password';
        confirmField.type = willShow ? 'text' : 'password';
        toggleButton.textContent = willShow ? 'Hide passwords' : 'Show passwords';
        toggleButton.setAttribute('aria-pressed', String(willShow));
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        errorBox.textContent = '';
        confirmBox.textContent = '';
        clearFormErrors(form);

        const username = usernameField.value.trim();
        const errors = [];

        if (!/^[\p{L}\d_.-]{3,}$/u.test(username)) {
            errors.push({ field: usernameField, message: 'User name: at least 3 characters, only letters, digits and _ . -' });
        }
        if (!isValidEmail(emailField.value.trim())) {
            errors.push({ field: emailField, message: 'Email: write a correct address (for example: name@mail.com).' });
        }
        if (!isStrongPassword(passwordField.value)) {
            errors.push({ field: passwordField, message: 'Password: it must satisfy every point of the checklist below.' });
        }
        if (confirmField.value === '' || confirmField.value !== passwordField.value) {
            errors.push({ field: confirmField, message: 'Confirm password: it must exactly match the password.' });
        }

        if (errors.length > 0) {
            errors.forEach((error) => showFieldError(error.field, error.message));
            const alertBox = createEl('div', 'alert alert-danger mt-3', `Please fix ${errors.length} field(s) marked above.`);
            alertBox.setAttribute('role', 'alert');
            errorBox.appendChild(alertBox);
            errors[0].field.focus();
            return;
        }

        form.reset(); // passwords are never kept or shown after a successful check
        const alertBox = createEl('div', 'alert alert-success mt-3');
        alertBox.setAttribute('role', 'status');
        alertBox.appendChild(createEl('h5', 'alert-heading', `Form for "${username}" is valid`));
        alertBox.appendChild(createEl('p', 'mb-0',
            'Front-end demonstration only: no account was created, no data was sent and nobody was signed in.'));
        confirmBox.appendChild(alertBox);
    });

    form.addEventListener('reset', () => {
        errorBox.textContent = '';
        confirmBox.textContent = '';
        clearFormErrors(form);
        passwordField.type = 'password';
        confirmField.type = 'password';
        toggleButton.textContent = 'Show passwords';
        toggleButton.setAttribute('aria-pressed', 'false');
        setTimeout(() => {
            renderChecklist();
            renderMatchHint();
        }, 0);
    });

    renderChecklist();
}


onReady(() => {
    initBookingForm();
    initRulesFilter();
    initRegisterForm();
});
