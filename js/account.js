'use strict';

const PLANS_KEY = 'rixfit-visit-plans';
const MAX_PLANS = 7;
const MIN_GAP_MINUTES = 120;
const PLAN_EARLIEST = '09:00';
const PLAN_LATEST = '21:00';

const planDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const planAreaLabels = { gym: 'Gym', pool: 'Pool' };
const focusLabels = { strength: 'Strength', cardio: 'Cardio', swimming: 'Swimming', introduction: 'First visit and equipment introduction' };
const focusAreas = { strength: ['gym'], cardio: ['gym'], swimming: ['pool'], introduction: ['gym', 'pool'] };

let plans = loadFromStorage(PLANS_KEY, []);

const planForm = document.getElementById('visit-plan-form');
const planArea = document.getElementById('plan-area');
const planDay = document.getElementById('plan-day');
const planTime = document.getElementById('plan-time');
const planGoal = document.getElementById('plan-goal');
const planResult = document.getElementById('plan-result');
const planConfirmation = document.getElementById('plan-confirmation');
const planErrors = document.getElementById('plan-errors');
const planPreview = document.getElementById('plan-preview');
const scheduleEmpty = document.getElementById('schedule-empty');
const scheduleList = document.getElementById('schedule-list');
const scheduleTemplate = document.getElementById('schedule-item-template');

planForm.noValidate = true;
document.getElementById('account-mode').textContent = 'This page is a personal planner. Visits you plan are saved only in this browser — it does not show a verified membership or reserve a class.';

const scheduleSummary = createElement('p', 'small');
scheduleSummary.setAttribute('aria-live', 'polite');
scheduleList.insertAdjacentElement('afterend', scheduleSummary);
const scheduleStatus = createElement('p', 'success hidden');
scheduleStatus.setAttribute('role', 'status');
scheduleStatus.setAttribute('tabindex', '-1');
scheduleSummary.insertAdjacentElement('afterend', scheduleStatus);


function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function describePlan(plan) {
  return capitalize(plan.day) + ' at ' + plan.time + ' — ' + planAreaLabels[plan.area] + ', ' + focusLabels[plan.goal];
}

function sortPlans(list) {
  return list.slice().sort((a, b) => planDays.indexOf(a.day) - planDays.indexOf(b.day) || a.time.localeCompare(b.time));
}

function getDayHours(day) {
  return day === 'saturday' || day === 'sunday' ? CLUB_HOURS.weekend : CLUB_HOURS.workday;
}

function isPeakTime(time) {
  const minutes = timeToMinutes(time);
  return (minutes >= 360 && minutes < 540) || (minutes >= 1080 && minutes < 1260);
}

function findConflict(day, time) {
  return plans.find((plan) => plan.day === day && Math.abs(timeToMinutes(plan.time) - timeToMinutes(time)) < MIN_GAP_MINUTES);
}


function checkPlanTime(time, day) {
  if (time === '') {
    return 'Choose a time between ' + PLAN_EARLIEST + ' and ' + PLAN_LATEST + '.';
  }
  if (time < PLAN_EARLIEST || time > PLAN_LATEST) {
    return 'Choose a time between ' + PLAN_EARLIEST + ' and ' + PLAN_LATEST + '.';
  }
  if (day !== '') {
    const conflict = findConflict(day, time);
    if (conflict !== undefined) {
      return 'You already planned ' + describePlan(conflict) + '. Keep visits at least 2 hours apart.';
    }
  }
  return '';
}

function checkPlanGoal(goal, area) {
  if (goal === '') {
    return 'Choose your focus.';
  }
  if (area !== '' && !focusAreas[goal].includes(area)) {
    return focusLabels[goal] + ' is planned in the ' + focusAreas[goal].map((item) => planAreaLabels[item].toLowerCase()).join(' or ') + ', not the ' + planAreaLabels[area].toLowerCase() + '.';
  }
  return '';
}


function updatePlanPreview() {
  const parts = [];
  parts.push(planArea.value === '' ? 'Area: not chosen' : 'Area: ' + planAreaLabels[planArea.value]);
  if (planDay.value !== '') {
    const hours = getDayHours(planDay.value);
    parts.push(capitalize(planDay.value) + ' (club open ' + hours.open + '–' + hours.close + ')');
  } else {
    parts.push('Day: not chosen');
  }
  parts.push(planTime.value === '' ? 'Time: not chosen' : 'Time: ' + planTime.value);
  parts.push(planGoal.value === '' ? 'Focus: not chosen' : 'Focus: ' + focusLabels[planGoal.value]);

  planPreview.replaceChildren(createElement('p', 'mb-1', 'Current plan: ' + parts.join(' · ') + '.'));
  if (planTime.value !== '' && planArea.value === 'gym' && isPeakTime(planTime.value)) {
    planPreview.append(createElement('p', 'small mb-1', 'Note: 18:00–21:00 is peak time — the gym floor is busiest and you may need to share equipment.'));
  }
}


function createPlanItem(plan) {
  const item = scheduleTemplate.content.firstElementChild.cloneNode(true);
  item.querySelector('.visit-description').textContent = describePlan(plan);
  const removeButton = item.querySelector('.visit-remove');
  removeButton.dataset.id = plan.id;
  removeButton.setAttribute('aria-label', 'Remove visit: ' + describePlan(plan));
  return item;
}

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


planForm.addEventListener('submit', (event) => {
  event.preventDefault();
  planConfirmation.classList.add('hidden');
  hideMessage(planErrors);
  scheduleStatus.classList.add('hidden');

  const errors = validateFields([
    { field: planArea, check: () => (planArea.value === '' ? 'Choose the gym or the pool.' : '') },
    { field: planDay, check: () => (planDay.value === '' ? 'Choose a day.' : '') },
    { field: planTime, check: () => checkPlanTime(planTime.value, planDay.value) },
    { field: planGoal, check: () => checkPlanGoal(planGoal.value, planArea.value) }
  ]);

  if (errors.length === 0 && plans.length >= MAX_PLANS) {
    errors.push('You already have ' + MAX_PLANS + ' planned visits. Remove one before adding another.');
  }
  if (errors.length > 0) {
    showMessage(planErrors, 'error', 'The plan was not saved:', errors);
    if (plans.length >= MAX_PLANS) {
      planResult.focus();
    }
    return;
  }

  const plan = { id: 'plan-' + Date.now(), area: planArea.value, day: planDay.value, time: planTime.value, goal: planGoal.value };
  plans.push(plan);
  const saved = saveToStorage(PLANS_KEY, plans);
  renderPlans();

  planConfirmation.replaceChildren(createElement('p', 'mb-0', saved
    ? 'Saved on this device: ' + describePlan(plan) + '. No club booking was made — the club does not receive this plan.'
    : 'Added for this session only (this browser blocked saving): ' + describePlan(plan) + '. No club booking was made.'));
  planConfirmation.classList.remove('hidden');
  planForm.reset();
  planResult.focus();
});

planForm.addEventListener('reset', () => {
  clearFormState(planForm);
  setTimeout(updatePlanPreview, 0);
});

planForm.addEventListener('change', (event) => {
  clearFieldError(event.target);
  updatePlanPreview();
});
planTime.addEventListener('input', updatePlanPreview);


function applyUrlPrefill() {
  const params = new URLSearchParams(window.location.search);
  const area = params.get('area');
  const focus = params.get('focus');
  if (area === null || !Object.keys(planAreaLabels).includes(area)) {
    return;
  }
  planArea.value = area;
  if (focus !== null && Object.keys(focusLabels).includes(focus)) {
    planGoal.value = focus;
  }
  const note = createElement('p', 'success', 'Area and focus were filled in from your equipment session. Choose a day and time to finish the plan.');
  note.setAttribute('role', 'status');
  planForm.insertAdjacentElement('beforebegin', note);
}

applyUrlPrefill();
updatePlanPreview();
renderPlans();
