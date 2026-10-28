'use strict';

/* RixFit — main.js
   Shared data and helpers for every RixFit page.
   Load order: main.js first, then the page script (e.g. nuraly.js, reviews.js).
   Contains: club data, reusable helpers (dates, prices, validation, field errors,
   messages, storage) and the site-wide "Open now" badge in the footer. */

/* ---------- Shared club data ---------- */

const CLUB_TIMEZONE = 'Asia/Almaty';
// Same hours as the footer and the services.html table
const WORK_HOURS = {
    weekday: { open: 7, close: 23 },
    weekend: { open: 9, close: 22 }
};

// Demo prices (KZT per person, one visit). Agree them with the team so every page shows the same numbers.
const SERVICES = [
    { key: 'lose_weight', label: 'Weight Loss', area: 'gym', needsTrainer: true, minAge: 12, price: 6000 },
    { key: 'gain_muscle', label: 'Muscle Gain', area: 'gym', needsTrainer: true, minAge: 12, price: 6000 },
    { key: 'pool_swimming', label: 'Swim in Pool', area: 'pool', needsTrainer: true, minAge: 12, price: 5000 },
    { key: 'sauna', label: 'Sauna', area: 'sauna', needsTrainer: false, minAge: 18, price: 4000 },
    { key: 'spa', label: 'SPA', area: 'spa', needsTrainer: false, minAge: 12, price: 8000 }
];

const TRAINERS = [
    { id: 't1', name: 'Vera', area: 'gym', role: 'Gym Instructor' },
    { id: 't2', name: 'Chingis', area: 'gym', role: 'Certified Gym Trainer' },
    { id: 't3', name: 'Ulan', area: 'gym', role: 'Certified Gym Trainer' },
    { id: 't4', name: 'Dmitriy', area: 'gym', role: 'Certified Gym Trainer' },
    { id: 't5', name: 'Dmitriy', area: 'pool', role: 'Certified Swimming Coach' },
    { id: 't6', name: 'Sergey Mikhailovich', area: 'pool', role: 'Swimming & Gym Trainer' },
    { id: 't7', name: 'Sabina', area: 'pool', role: 'Water Polo & Swimming Instructor' },
    { id: 't8', name: 'Samat', area: 'pool', role: 'Certified Swimming Coach' }
];

/* ---------- Small helpers ---------- */

function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function createEl(tag, classNames = '', text = '') {
    const el = document.createElement(tag);
    if (classNames) {
        el.className = classNames;
    }
    if (text) {
        el.textContent = text;
    }
    return el;
}

// Same idea as createEl, used by the equipment, reviews and account pages
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

function formatPrice(amount) {
    return `${amount.toLocaleString('ru-RU')} ₸`;
}

function generateRefNumber() {
    // Demo reference only: it is not stored anywhere and confirms nothing.
    return Math.floor(100000 + Math.random() * 900000);
}

function pad2(number) {
    return String(number).padStart(2, '0');
}

/* ---------- Time and date helpers ---------- */

function timeToMinutes(time) {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
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

function toDateInputValue(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
}

// Turns "2026-10-21" into a local Date at midnight, or null when the value is empty/invalid
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

// Positive = future, 0 = today, negative = past
function daysFromToday(date) {
    return Math.round((date - getToday()) / 86400000);
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- Validators ---------- */

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return /^\+?[0-9\s()-]+$/.test(value.trim()) && digits.length >= 10 && digits.length <= 15;
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
        return 'Enter 10–15 digits, for example +7 700 000 00 00.';
    }
    return '';
}

/* ---------- Form controls built with DOM methods ---------- */

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

/* ---------- Field-level errors (shown beside the field, not in an alert) ---------- */

// Reuses a prepared "<id>-error" element when the page has one, otherwise creates it
function getErrorElement(field, anchor) {
    const errorId = `${field.id || field.name}-error`;
    let errorElement = document.getElementById(errorId);
    if (errorElement === null) {
        errorElement = createElement('p', 'error small mb-0 hidden');
        errorElement.id = errorId;
        let insertAfter = anchor || field;
        if (!anchor && (field.type === 'radio' || field.type === 'checkbox')) {
            // After the whole group of options, not between them
            insertAfter = field.closest('.form-check').parentElement.lastElementChild;
        }
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
    const errorElement = document.getElementById(`${field.id || field.name}-error`);
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

// Clears every field error inside a form (before validating again and on reset)
function clearFormErrors(form) {
    form.querySelectorAll('input, select, textarea').forEach((field) => clearFieldError(field));
}

function clearFormState(form) {
    clearFormErrors(form);
}

/* Runs a list of checks: { field, check: () => '' or error message, anchor? }.
   Shows every error beside its field, focuses the first invalid field and
   returns the list of error messages (empty list = form is valid). */
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

/* ---------- Result messages ---------- */

// type is 'success' or 'error'; lines is an optional list of strings
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

// pairs: [['Label', 'Value'], ...] -> a Bootstrap-grid description list
function createSummaryList(pairs) {
    const list = createElement('dl', 'row mb-0 mt-2');
    pairs.forEach((pair) => {
        list.append(createElement('dt', 'col-sm-4', pair[0]), createElement('dd', 'col-sm-8', pair[1]));
    });
    return list;
}

/* ---------- Device storage (only non-sensitive data) ---------- */

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

/* ---------- "Open now" badge in the footer (site-wide) ---------- */

function getHoursFor(dayIndex) {
    return dayIndex === 0 || dayIndex === 6 ? WORK_HOURS.weekend : WORK_HOURS.weekday;
}

function getClubTime(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: CLUB_TIMEZONE,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);
    const read = (type) => parts.find((part) => part.type === type).value;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return { day: days.indexOf(read('weekday')), hour: Number(read('hour')), minute: Number(read('minute')) };
}

function getOpenStatus(date = new Date()) {
    const { day, hour, minute } = getClubTime(date);
    const minutes = hour * 60 + minute;
    const today = getHoursFor(day);

    if (minutes >= today.open * 60 && minutes < today.close * 60) {
        return { isOpen: true, text: `Open now · until ${pad2(today.close)}:00` };
    }
    if (minutes < today.open * 60) {
        return { isOpen: false, text: `Closed · opens today at ${pad2(today.open)}:00` };
    }
    const tomorrow = getHoursFor((day + 1) % 7);
    return { isOpen: false, text: `Closed · opens tomorrow at ${pad2(tomorrow.open)}:00` };
}

function renderOpenBadge() {
    const hoursSection = document.querySelector('#hours');
    if (!hoursSection) {
        return;
    }

    let badge = document.querySelector('#open-status');
    if (!badge) {
        const wrapper = createEl('p', 'mt-2');
        badge = createEl('span', 'badge');
        badge.id = 'open-status';
        wrapper.appendChild(badge);
        hoursSection.appendChild(wrapper);
    }

    const status = getOpenStatus();
    badge.textContent = status.text;
    badge.classList.toggle('text-bg-success', status.isOpen);
    badge.classList.toggle('text-bg-secondary', !status.isOpen);
}

onReady(() => {
    renderOpenBadge();
    if (document.querySelector('#hours')) {
        setInterval(renderOpenBadge, 60000);
    }
});
