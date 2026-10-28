'use strict';

const REVIEWS_KEY = 'rixfit-reviews';
const TEXT_MIN = 10;
const TEXT_MAX = 2000;
const LOW_RATING_MIN_TEXT = 30;

const reviewAreaLabels = { gym: 'Gym', pool: 'Pool', '': 'Not specified' };
const visitTypeLabels = { single: 'Single visit', membership: 'Membership visit', training: 'Training session' };

let reviews = loadFromStorage(REVIEWS_KEY, []);

const feedbackForm = document.getElementById('feedback-form');
const visitorName = document.getElementById('visitor-name');
const visitorEmail = document.getElementById('visitor-email');
const visitorPhone = document.getElementById('visitor-phone');
const visitCount = document.getElementById('visit-count');
const visitDate = document.getElementById('visit-date');
const areaInputs = Array.from(feedbackForm.querySelectorAll('input[name="area"]'));
const reviewRating = document.getElementById('review-rating');
const visitType = document.getElementById('visit-type');
const feedbackText = document.getElementById('feedback-text');
const feedbackHelp = document.getElementById('feedback-text-help');
const permission = document.getElementById('permission');

const feedbackResult = document.getElementById('feedback-result');
const feedbackConfirmation = document.getElementById('feedback-confirmation');
const feedbackErrors = document.getElementById('feedback-errors');
const feedbackPreview = document.getElementById('feedback-preview');

const reviewsEmpty = document.getElementById('reviews-empty');
const reviewsList = document.getElementById('reviews-list');

feedbackForm.noValidate = true;
visitDate.max = toDateInputValue(getToday());

const listControls = createElement('div', 'row g-2 align-items-end my-3');
const ratingFilter = createLabeledControl('select', 'filter-rating', 'Rating', 'col-6 col-md-3');
addOptions(ratingFilter.control, [
  { value: 'all', label: 'All ratings' },
  { value: 'positive', label: '4–5 (positive)' },
  { value: 'average', label: '3 (average)' },
  { value: 'critical', label: '1–2 (critical)' }
]);
const areaFilter = createLabeledControl('select', 'filter-area', 'Area', 'col-6 col-md-3');
addOptions(areaFilter.control, [
  { value: 'all', label: 'All areas' },
  { value: 'gym', label: 'Gym' },
  { value: 'pool', label: 'Pool' }
]);
const sortSelect = createLabeledControl('select', 'sort-reviews', 'Sort', 'col-6 col-md-3');
addOptions(sortSelect.control, [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest rating' },
  { value: 'lowest', label: 'Lowest rating' }
]);
const listResetWrapper = createElement('div', 'col-6 col-md-3');
const listReset = createElement('button', 'btn btn-outline-light w-100', 'Reset');
listReset.type = 'button';
listResetWrapper.append(listReset);
listControls.append(ratingFilter.wrapper, areaFilter.wrapper, sortSelect.wrapper, listResetWrapper);

const reviewsCount = createElement('p', 'small');
reviewsCount.setAttribute('aria-live', 'polite');
const reviewsNoMatch = createElement('p', 'error hidden', 'No saved reviews match these filters. Use Reset to see all of them.');
const listStatus = createElement('p', 'success hidden');
listStatus.setAttribute('role', 'status');

const listToolbar = createElement('div');
listToolbar.append(listControls, reviewsCount, reviewsNoMatch, listStatus);
reviewsList.insertAdjacentElement('beforebegin', listToolbar);

function matchesRatingFilter(rating, filter) {
  switch (filter) {
    case 'positive':
      return rating >= 4;
    case 'average':
      return rating === 3;
    case 'critical':
      return rating <= 2;
    default:
      return true;
  }
}

function getVisibleReviews() {
  const filtered = reviews.filter((review) => {
    const areaMatches = areaFilter.control.value === 'all' || review.area === areaFilter.control.value;
    return areaMatches && matchesRatingFilter(review.rating, ratingFilter.control.value);
  });

  const sorted = filtered.slice();
  const order = sortSelect.control.value;
  if (order === 'highest') {
    sorted.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
  } else if (order === 'lowest') {
    sorted.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
  } else if (order === 'oldest') {
    sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } else {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return sorted;
}

function getAverageRating(list) {
  if (list.length === 0) {
    return 0;
  }
  const total = list.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / list.length) * 10) / 10;
}

function createStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function createReviewCard(review) {
  const card = createElement('article', 'card bg-dark text-white border-secondary mb-3');
  card.dataset.id = review.id;
  const body = createElement('div', 'card-body');

  const header = createElement('div', 'd-flex flex-wrap justify-content-between gap-2');
  header.append(createElement('h3', 'h5 card-title mb-1', review.name));
  const stars = createElement('p', 'mb-1', createStars(review.rating));
  stars.setAttribute('aria-hidden', 'true');
  header.append(stars);

  const meta = [review.rating + ' out of 5', reviewAreaLabels[review.area], visitTypeLabels[review.visitType]];
  if (review.visitDate !== '') {
    meta.push('visited ' + parseDateValue(review.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  }

  const text = createElement('p', 'card-text', review.text);
  const footer = createElement('div', 'd-flex flex-wrap justify-content-between align-items-center gap-2');
  const time = createElement('time', 'small text-white-50', 'Saved on this device: ' + formatDateTime(review.createdAt));
  time.dateTime = review.createdAt;
  const removeButton = createElement('button', 'btn btn-outline-light btn-sm', 'Remove');
  removeButton.type = 'button';
  removeButton.dataset.remove = review.id;
  removeButton.setAttribute('aria-label', 'Remove the review by ' + review.name);
  footer.append(time, removeButton);

  body.append(header, createElement('p', 'small mb-2', meta.join(' · ')), text, footer);
  card.append(body);
  return card;
}

function renderReviews() {
  const visible = getVisibleReviews();
  reviewsList.replaceChildren();
  visible.forEach((review) => reviewsList.append(createReviewCard(review)));

  const hasReviews = reviews.length > 0;
  reviewsEmpty.classList.toggle('hidden', hasReviews);
  listToolbar.classList.toggle('hidden', !hasReviews);
  reviewsNoMatch.classList.toggle('hidden', !hasReviews || visible.length > 0);
  reviewsCount.textContent = 'Showing ' + visible.length + ' of ' + reviews.length + ' review(s) saved on this device. Average rating: ' + getAverageRating(reviews) + ' / 5.';
}

function showListStatus(text) {
  listStatus.textContent = text;
  listStatus.classList.remove('hidden');
}

ratingFilter.control.addEventListener('change', renderReviews);
areaFilter.control.addEventListener('change', renderReviews);
sortSelect.control.addEventListener('change', renderReviews);
listReset.addEventListener('click', () => {
  ratingFilter.control.value = 'all';
  areaFilter.control.value = 'all';
  sortSelect.control.value = 'newest';
  renderReviews();
});

reviewsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-remove]');
  if (button === null) {
    return;
  }
  const removed = reviews.find((review) => review.id === button.dataset.remove);
  reviews = reviews.filter((review) => review.id !== button.dataset.remove);
  saveToStorage(REVIEWS_KEY, reviews);
  renderReviews();
  showListStatus('The review by ' + removed.name + ' was removed from this device.');
  listStatus.setAttribute('tabindex', '-1');
  listStatus.focus();
});

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

updateCharacterCounter();
renderReviews();
