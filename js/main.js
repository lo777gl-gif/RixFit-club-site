'use strict';

// Shared data and helpers for every RixFit page.
// Load order: main.js first, then the page script (e.g. nuraly.js).

const CLUB_TIMEZONE = 'Asia/Almaty';
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

// ---------------------------------------------------------------------------
// Small helpers

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

// ---------------------------------------------------------------------------
// Validators

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return /^\+?[0-9\s()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
}

// ---------------------------------------------------------------------------
// Field-level errors (shown beside the field, not in an alert)

function showFieldError(field, message) {
    const errorId = `${field.id || field.name}-error`;
    const error = createEl('div', 'invalid-feedback d-block', message);
    error.id = errorId;
    error.dataset.fieldError = 'true';

    if (field.type === 'radio' || field.type === 'checkbox') {
        field.closest('.form-check').parentElement.appendChild(error);
    } else {
        field.insertAdjacentElement('afterend', error);
    }

    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
}

function clearFormErrors(form) {
    form.querySelectorAll('[data-field-error]').forEach((el) => el.remove());
    form.querySelectorAll('.is-invalid').forEach((el) => {
        el.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
    });
}

// ---------------------------------------------------------------------------
// "Open now" badge in the footer (site-wide)

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
