/* reviews.js - reviews page, written with jQuery.
   jQuery 4.0.0 (CDN, linked before this file in reviews.html): the whole page logic
   below uses $() selectors, .on() events, effects and DOM building, which plain
   JavaScript would need much longer code for. Old plain-JS version: old-js-version.js. */

$(function () {
  'use strict';

  const REVIEWS_KEY = 'rixfit-reviews';
  const TEXT_MIN = 10;
  const TEXT_MAX = 2000;
  const LOW_RATING_MIN_TEXT = 30;

  const reviewAreaLabels = { gym: 'Gym', pool: 'Pool', '': 'Not specified' };
  const visitTypeLabels = { single: 'Single visit', membership: 'Membership visit', training: 'Training session' };

  let reviews = loadFromStorage(REVIEWS_KEY, []);

  // selectors by id
  const $form = $('#feedback-form');
  const $name = $('#visitor-name');
  const $email = $('#visitor-email');
  const $phone = $('#visitor-phone');
  const $visitCount = $('#visit-count');
  const $visitDate = $('#visit-date');
  const $rating = $('#review-rating');
  const $visitType = $('#visit-type');
  const $text = $('#feedback-text');
  const $help = $('#feedback-text-help');
  const $permission = $('#permission');
  const $result = $('#feedback-result');
  const $confirmation = $('#feedback-confirmation');
  const $errors = $('#feedback-errors');
  const $preview = $('#feedback-preview');
  const $empty = $('#reviews-empty');
  const $list = $('#reviews-list');

  /* The attributes required / minlength / maxlength stay in the HTML as the first line
     of defence (they also work if this script fails to load). Because JS turns on
     noValidate, our own per-field messages replace the browser bubbles. A browser check
     never replaces a server check: anyone can edit the HTML, disable JS or send the
     request directly, so the server must validate every value again. */
  $form.prop('noValidate', true);
  $visitDate.attr('max', toDateInputValue(getToday()));

  /* ---------- filter / sort toolbar, created in code ---------- */

  const rating = jqLabeledControl('select', 'filter-rating', 'Rating', 'col-6 col-md-3');
  jqAddOptions(rating.$control, [
    { value: 'all', label: 'All ratings' },
    { value: 'positive', label: '4–5 (positive)' },
    { value: 'average', label: '3 (average)' },
    { value: 'critical', label: '1–2 (critical)' }
  ]);
  const area = jqLabeledControl('select', 'filter-area', 'Area', 'col-6 col-md-3');
  jqAddOptions(area.$control, [
    { value: 'all', label: 'All areas' },
    { value: 'gym', label: 'Gym' },
    { value: 'pool', label: 'Pool' }
  ]);
  const sort = jqLabeledControl('select', 'sort-reviews', 'Sort', 'col-6 col-md-3');
  jqAddOptions(sort.$control, [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'highest', label: 'Highest rating' },
    { value: 'lowest', label: 'Lowest rating' }
  ]);
  const $reset = $('<button>', { type: 'button', class: 'btn btn-outline-light w-100', text: 'Reset' });
  const $controls = $('<div>', { class: 'row g-2 align-items-end my-3' }).append(
    rating.$wrapper, area.$wrapper, sort.$wrapper,
    $('<div>', { class: 'col-6 col-md-3' }).append($reset)
  );

  const $count = $('<p>', { class: 'small', 'aria-live': 'polite' });
  const $noMatch = $('<p>', { class: 'error hidden', text: 'No saved reviews match these filters. Use Reset to see all of them.' });
  const $status = $('<p>', { class: 'success hidden', role: 'status' });
  const $toolbar = $('<div>').append($controls, $count, $noMatch, $status).insertBefore($list);

  /* ---------- filtering, sorting, rendering ---------- */

  function matchesRating(value, filter) {
    if (filter === 'positive') { return value >= 4; }
    if (filter === 'average') { return value === 3; }
    if (filter === 'critical') { return value <= 2; }
    return true;
  }

  function getVisibleReviews() {
    const areaValue = area.$control.val();
    const ratingValue = rating.$control.val();
    // $.grep is jQuery's array filter
    const visible = $.grep(reviews, function (review) {
      return (areaValue === 'all' || review.area === areaValue) && matchesRating(review.rating, ratingValue);
    });

    const order = sort.$control.val();
    return visible.sort(function (a, b) {
      if (order === 'highest') { return b.rating - a.rating || b.createdAt.localeCompare(a.createdAt); }
      if (order === 'lowest') { return a.rating - b.rating || b.createdAt.localeCompare(a.createdAt); }
      if (order === 'oldest') { return a.createdAt.localeCompare(b.createdAt); }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  function getAverageRating() {
    if (reviews.length === 0) { return 0; }
    let total = 0;
    $.each(reviews, function (index, review) { total += review.rating; });
    return Math.round((total / reviews.length) * 10) / 10;
  }

  function createStars(value) {
    return '★'.repeat(value) + '☆'.repeat(5 - value);
  }

  // The card markup exists nowhere in reviews.html: it is built from the array of reviews.
  function createReviewCard(review) {
    const meta = [review.rating + ' out of 5', reviewAreaLabels[review.area], visitTypeLabels[review.visitType]];
    if (review.visitDate !== '') {
      meta.push('visited ' + parseDateValue(review.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    }

    const $header = $('<div>', { class: 'd-flex flex-wrap justify-content-between gap-2' }).append(
      $('<h3>', { class: 'h5 card-title mb-1', text: review.name }),
      $('<p>', { class: 'mb-1', 'aria-hidden': 'true', text: createStars(review.rating) })
    );
    const $footer = $('<div>', { class: 'd-flex flex-wrap justify-content-between align-items-center gap-2' }).append(
      $('<time>', { class: 'small text-white-50', datetime: review.createdAt, text: 'Saved on this device: ' + formatDateTime(review.createdAt) }),
      $('<button>', {
        type: 'button',
        class: 'btn btn-outline-light btn-sm',
        text: 'Remove',
        'data-remove': review.id,
        'aria-label': 'Remove the review by ' + review.name
      })
    );
    const $body = $('<div>', { class: 'card-body' }).append(
      $header,
      $('<p>', { class: 'small mb-2', text: meta.join(' · ') }),
      $('<p>', { class: 'card-text', text: review.text }),
      $footer
    );
    return $('<article>', { class: 'card bg-dark text-white border-secondary mb-3', 'data-id': review.id }).append($body);
  }

  function renderReviews() {
    const visible = getVisibleReviews();
    $list.empty();
    $.each(visible, function (index, review) {
      createReviewCard(review).appendTo($list);
    });

    const hasReviews = reviews.length > 0;
    $empty.toggleClass('hidden', hasReviews);
    $toolbar.toggleClass('hidden', !hasReviews);
    $noMatch.toggleClass('hidden', !hasReviews || visible.length > 0);
    $count.text('Showing ' + visible.length + ' of ' + reviews.length + ' review(s) saved on this device. Average rating: ' + getAverageRating() + ' / 5.');
  }

  function showListStatus(message) {
    // Effect with a purpose: the "removed" notice fades in so the visitor notices it
    $status.text(message).removeClass('hidden').hide().fadeIn(250).attr('tabindex', '-1').trigger('focus');
  }

  /* change event: re-render when any of the three selects changes */
  $controls.on('change', 'select', renderReviews);

  $reset.on('click', function () {
    rating.$control.val('all');
    area.$control.val('all');
    sort.$control.val('newest');
    renderReviews();
  });

  /* DELEGATED handler: bound once to #reviews-list, which already exists. Every card
     (and its Remove button) is created later by renderReviews(), after the user submits
     the form or changes a filter. A direct binding like $('button[data-remove]').on(...)
     would only attach to the buttons that exist at that moment, so buttons created by
     our own code afterwards would never react. With delegation the event bubbles up to
     #reviews-list and jQuery checks whether the target matches the selector. */
  $list.on('click', 'button[data-remove]', function () {
    const $button = $(this);
    const id = $button.attr('data-remove');
    const $card = $button.closest('article');
    const removed = $.grep(reviews, function (review) { return review.id === id; })[0];
    $button.prop('disabled', true);

    // The data is changed in the callback, only after the card has finished fading out.
    $card.fadeOut(300, function () {
      reviews = $.grep(reviews, function (review) { return review.id !== id; });
      saveToStorage(REVIEWS_KEY, reviews);
      renderReviews();
      showListStatus('The review by ' + removed.name + ' was removed from this device.');
    });
  });

  /* COMPARISON (feature: form validation, old version in old-js-version.js).
     $field.val().trim(), jqValidateFields + jqShowFieldError ($field.addClass/.text/.removeClass)
     replace getElementById, .value, classList and createElement/append lines. About the
     same number of lines, but shorter per line and one consistent API, so slightly clearer;
     the real gain is chaining (.empty().removeClass().addClass()) instead of separate statements. */

  /* ---------- form: character counter and checks ---------- */

  function updateCharacterCounter() {
    const length = $text.val().trim().length;
    let message = 'Use 10–2,000 characters. ' + length + ' / ' + TEXT_MAX + ' used.';
    if (length < TEXT_MIN) {
      message += ' ' + (TEXT_MIN - length) + ' more needed.';
    }
    $help.text(message);
  }

  function checkVisitCount(value) {
    if (value.trim() === '') { return ''; }
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1 || count > 999) {
      return 'Enter the number of visits as a whole number from 1 to 999.';
    }
    return '';
  }

  function checkVisitDate(value) {
    if (value === '') { return ''; }
    const date = parseDateValue(value);
    if (date === null || daysFromToday(date) > 0) {
      return 'The visit date cannot be in the future.';
    }
    return '';
  }

  function checkFeedbackText(value, ratingValue) {
    const trimmed = value.trim();
    if (trimmed.length < TEXT_MIN || trimmed.length > TEXT_MAX) {
      return 'Enter feedback between 10 and 2,000 characters.';
    }
    if (ratingValue !== '' && Number(ratingValue) <= 2 && trimmed.length < LOW_RATING_MIN_TEXT) {
      return 'For a rating of 1 or 2, explain what went wrong in at least ' + LOW_RATING_MIN_TEXT + ' characters.';
    }
    return '';
  }

  function validateFeedback() {
    return jqValidateFields([
      { $field: $name, check: function () { return checkPersonName($name.val(), 'name'); } },
      { $field: $email, check: function () { return checkEmail($email.val()); } },
      { $field: $phone, check: function () { return checkPhone($phone.val(), false); } },
      { $field: $visitCount, check: function () { return checkVisitCount($visitCount.val()); } },
      { $field: $visitDate, check: function () { return checkVisitDate($visitDate.val()); } },
      { $field: $rating, check: function () { return $rating.val() === '' ? 'Choose a rating from 1 to 5.' : ''; } },
      { $field: $text, check: function () { return checkFeedbackText($text.val(), $rating.val()); } },
      // .prop('checked') is the live state; .attr('checked') would only return the initial HTML attribute
      { $field: $permission, check: function () { return $permission.prop('checked') ? '' : 'Agree to display your name and feedback, or keep your notes private.'; } }
    ]);
  }

  function createReviewFromForm() {
    return {
      id: 'review-' + Date.now(),
      name: $name.val().trim(),
      // selector by attribute + :checked filter; no radio chosen -> val() is undefined
      area: $form.find('input[name="area"]:checked').val() || '',
      visitType: $visitType.val(),
      rating: Number($rating.val()),
      visitDate: $visitDate.val(),
      text: $text.val().trim(),
      createdAt: new Date().toISOString()
    };
  }

  function hideFeedbackResult() {
    $confirmation.addClass('hidden');
    jqHideMessage($errors);
    $preview.empty();
  }

  $form.on('submit', function (event) {
    /* Without preventDefault() the browser would submit the form (GET to
       reviews.html#feedback-result), reload the page and throw away our checks, the
       per-field messages and the review that was just built. */
    event.preventDefault();
    hideFeedbackResult();

    const errors = validateFeedback();
    if (errors.length > 0) {
      jqShowMessage($errors, 'error', 'Your feedback was not saved. Please fix ' + errors.length + ' field(s):', errors);
      $errors.hide().slideDown(250);
      return;
    }

    const review = createReviewFromForm();
    reviews.push(review);
    const saved = saveToStorage(REVIEWS_KEY, reviews);

    $preview.append(
      $('<p>', { class: 'fw-bold mt-2 mb-0', text: 'Summary' }),
      jqSummaryList([
        ['Name', review.name],
        ['Rating', review.rating + ' out of 5'],
        ['Area', reviewAreaLabels[review.area]],
        ['Visit type', visitTypeLabels[review.visitType]],
        ['Visits', $visitCount.val() === '' ? 'not given' : $visitCount.val()],
        ['Feedback', review.text]
      ])
    );

    // Success message appears only here, when every check has passed; focus moves after the fade ends.
    $confirmation
      .empty()
      .append($('<p>', {
        class: 'mb-0',
        text: saved
          ? 'Your review was saved on this device only and is shown in the review list above. It was not sent to RixFit or published online. Your email and phone were checked but not stored.'
          : 'Your review is shown in the list above, but this browser blocked saving, so it will disappear after reloading. Nothing was sent to RixFit.'
      }))
      .removeClass('hidden')
      .hide()
      .fadeIn(400, function () {
        $result.trigger('focus');
      });

    renderReviews();
    $form[0].reset(); // jQuery has no .reset(): use the native form method on the raw element
  });

  $form.on('reset', function () {
    jqClearFormState($form);
    setTimeout(updateCharacterCounter, 0);
  });

  /* input event, delegated to the form: clears a field's error as soon as the visitor edits it */
  $form.on('input', '.form-control, .form-select', function () {
    jqClearFieldError($(this));
  });
  $text.on('input', updateCharacterCounter);
  $permission.on('change', function () {
    jqClearFieldError($(this));
  });

  updateCharacterCounter();
  renderReviews();
});
