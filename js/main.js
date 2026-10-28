'use strict';

const CLUB_HOURS = {
  workday: { open: '07:00', close: '23:00' },
  weekend: { open: '09:00', close: '22:00' }
};

const VACATE_MINUTES = 15;

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


function timeToMinutes(time) {
  const parts = time.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return minutes + ' min';
  }
  if (minutes === 0) {
    return hours + ' h';
  }
  return hours + ' h ' + minutes + ' min';
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getOpeningHours(date) {
  return isWeekend(date) ? CLUB_HOURS.weekend : CLUB_HOURS.workday;
}

function toDateInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function parseDateValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const parts = value.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysFromToday(date) {
  return Math.round((date - getToday()) / 86400000);
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_PATTERN = /^(\+7|8)7\d{9}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;

function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

function isValidPhone(value) {
  const digitsOnly = value.trim().replace(/[\s()-]/g, '');
  return PHONE_PATTERN.test(digitsOnly);
}

function checkPersonName(value, label) {
  const name = value.trim();
  if (name === '') {
    return 'Enter your ' + label + '.';
  }
  if (name.length < 2 || name.length > 80) {
    return 'Your ' + label + ' must be 2–80 characters long.';
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Use letters, spaces, hyphens or apostrophes only.';
  }
  return '';
}

function checkEmail(value) {
  if (value.trim() === '') {
    return 'Enter your email address.';
  }
  if (!isValidEmail(value)) {
    return 'Enter an email like name@example.com.';
  }
  return '';
}

function checkPhone(value, isRequired) {
  if (value.trim() === '') {
    return isRequired ? 'Enter your phone number.' : '';
  }
  if (!isValidPhone(value)) {
    return 'Enter a Kazakhstan mobile number, for example +7 700 000 00 00.';
  }
  return '';
}


function createElement(tagName, classNames, text) {
  const element = document.createElement(tagName);
  if (classNames) {
    element.classList.add(...classNames.split(' '));
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createLabeledControl(tagName, id, labelText, wrapperClasses) {
  const wrapper = createElement('div', wrapperClasses);
  const label = createElement('label', 'form-label', labelText);
  label.htmlFor = id;
  const control = createElement(tagName, tagName === 'select' ? 'form-select' : 'form-control');
  control.id = id;
  wrapper.append(label, control);
  return { wrapper: wrapper, control: control };
}

function addOptions(select, options) {
  options.forEach((option) => {
    const optionElement = createElement('option', '', option.label);
    optionElement.value = option.value;
    select.append(optionElement);
  });
}

function addDescribedBy(field, id) {
  const current = field.getAttribute('aria-describedby');
  const ids = current ? current.split(' ') : [];
  if (!ids.includes(id)) {
    ids.push(id);
    field.setAttribute('aria-describedby', ids.join(' '));
  }
}


function getErrorElement(field, anchor) {
  const errorId = field.id + '-error';
  let errorElement = document.getElementById(errorId);
  if (errorElement === null) {
    errorElement = createElement('p', 'error small mb-0 hidden');
    errorElement.id = errorId;
    const insertAfter = anchor || field.closest('.form-check') || field;
    insertAfter.insertAdjacentElement('afterend', errorElement);
  }
  return errorElement;
}

function showFieldError(field, message, anchor) {
  const errorElement = getErrorElement(field, anchor);
  errorElement.textContent = 'Error: ' + message;
  errorElement.classList.remove('hidden');
  field.classList.remove('success');
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  addDescribedBy(field, errorElement.id);
}

function clearFieldError(field) {
  const errorElement = document.getElementById(field.id + '-error');
  if (errorElement !== null) {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  }
  field.classList.remove('error', 'success');
  field.removeAttribute('aria-invalid');
}

function markFieldValid(field) {
  clearFieldError(field);
  field.classList.add('success');
}

function validateFields(rules) {
  const errors = [];
  let firstInvalidField = null;

  rules.forEach((rule) => {
    const message = rule.check();
    if (message !== '') {
      showFieldError(rule.field, message, rule.anchor);
      errors.push(message);
      if (firstInvalidField === null) {
        firstInvalidField = rule.field;
      }
    } else {
      markFieldValid(rule.field);
    }
  });

  if (firstInvalidField !== null) {
    firstInvalidField.focus();
  }
  return errors;
}

function clearFormState(form) {
  form.querySelectorAll('.error, .success').forEach((element) => {
    if (element.matches('input, select, textarea')) {
      clearFieldError(element);
    }
  });
}

function showMessage(container, type, title, lines) {
  container.replaceChildren();
  container.classList.remove('hidden', 'error', 'success');
  container.classList.add(type);
  container.setAttribute('role', type === 'error' ? 'alert' : 'status');
  container.append(createElement('p', 'fw-bold mb-1', title));
  if (lines && lines.length > 0) {
    const list = createElement('ul', 'mb-0');
    lines.forEach((line) => {
      list.append(createElement('li', '', line));
    });
    container.append(list);
  }
}

function hideMessage(container) {
  container.replaceChildren();
  container.classList.remove('error', 'success');
  container.classList.add('hidden');
}

function createSummaryList(pairs) {
  const list = createElement('dl', 'row mb-0 mt-2');
  pairs.forEach((pair) => {
    list.append(createElement('dt', 'col-sm-4', pair[0]), createElement('dd', 'col-sm-8', pair[1]));
  });
  return list;
}

function loadFromStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue === null ? fallbackValue : JSON.parse(savedValue);
  } catch (error) {
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}


function getClubStatus(now) {
  const hours = getOpeningHours(now);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(hours.open);
  const closeMinutes = timeToMinutes(hours.close);

  if (minutesNow >= openMinutes && minutesNow < closeMinutes) {
    const minutesLeft = closeMinutes - VACATE_MINUTES - minutesNow;
    let text = 'Open now until ' + hours.close + '. ';
    if (minutesLeft > 0) {
      text += 'You have ' + formatDuration(minutesLeft) + ' to train before areas are vacated at ' + minutesToTime(closeMinutes - VACATE_MINUTES) + '.';
    } else {
      text += 'Training areas are closing — please finish your visit.';
    }
    return { isOpen: true, text: text };
  }

  if (minutesNow < openMinutes) {
    return { isOpen: false, text: 'Closed now. Opens today at ' + hours.open + '.' };
  }

  const tomorrow = addDays(now, 1);
  return {
    isOpen: false,
    text: 'Closed now. Opens tomorrow (' + WEEKDAY_NAMES[tomorrow.getDay()] + ') at ' + getOpeningHours(tomorrow).open + '.'
  };
}

function renderClubStatus(statusElement, hourItems) {
  const now = new Date();
  const status = getClubStatus(now);
  statusElement.textContent = status.text;
  statusElement.classList.toggle('success', status.isOpen);
  statusElement.classList.toggle('error', !status.isOpen);

  const todayIndex = isWeekend(now) ? 1 : 0;
  hourItems.forEach((item, index) => {
    item.classList.toggle('active', index === todayIndex);
  });
}

function initClubStatus() {
  const hoursSection = document.getElementById('hours');
  if (hoursSection === null) {
    return;
  }
  const hourItems = Array.from(hoursSection.querySelectorAll('li'));
  const statusElement = createElement('p', 'small');
  statusElement.setAttribute('aria-live', 'polite');
  hoursSection.append(statusElement);

  renderClubStatus(statusElement, hourItems);
  setInterval(() => renderClubStatus(statusElement, hourItems), 60000);
}


function markExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    if (link.textContent.includes('new tab')) {
      return;
    }
    if (link.querySelector('img') === null) {
      const arrow = createElement('span', '', ' ↗');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
    }
    link.append(createElement('span', 'visually-hidden', ' (opens in a new tab)'));
  });
}

initClubStatus();
markExternalLinks();
