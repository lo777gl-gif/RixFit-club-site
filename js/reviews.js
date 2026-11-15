/* reviews.js - reviews page, written with jQuery. */

$(function () {
  'use strict';

  const REVIEWS_KEY = 'rixfit-reviews';
  const TEXT_MIN = 10;
  const TEXT_MAX = 2000;
  const LOW_RATING_MIN_TEXT = 30;

  const areaLabels = { gym: 'Gym', pool: 'Pool' };
  const ratingCaptions = { 1: 'Very poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' };

  let reviews = loadFromStorage(REVIEWS_KEY, []);
  let areaFilter = 'all';
  let newestId = null;

  const $form = $('#feedback-form');
  const $name = $('#visitor-name');
  const $nameGroup = $('#guest-name-group');
  const $identity = $('#identity-note');
  const $date = $('#visit-date');
  const $text = $('#feedback-text');
  const $help = $('#feedback-text-help');
  const $ratingError = $('#rating-error');
  const $ratingCaption = $('#rating-caption');
  const $summary = $('#rating-summary');
  const $empty = $('#reviews-empty');
  const $noMatch = $('#reviews-nomatch');
  const $list = $('#reviews-list');
  const $sort = $('#sort-reviews');

  $date.attr('max', toDateInputValue(getToday()));

  /* ---------- helpers ---------- */

  function createStars(value) {
    const $stars = $('<span>', { class: 'stars', 'aria-hidden': 'true' });
    for (let i = 1; i <= 5; i += 1) {
      $('<span>', { class: i <= value ? '' : 'off', text: '★' }).appendTo($stars);
    }
    return $stars;
  }

  function getAverage() {
    if (reviews.length === 0) { return 0; }
    let total = 0;
    $.each(reviews, function (index, review) { total += review.rating; });
    return total / reviews.length;
  }

  function getVisible() {
    const visible = $.grep(reviews, function (review) {
      return areaFilter === 'all' || review.area === areaFilter;
    });
    const order = $sort.val();
    return visible.sort(function (a, b) {
      if (order === 'highest') { return b.rating - a.rating || b.createdAt.localeCompare(a.createdAt); }
      if (order === 'lowest') { return a.rating - b.rating || b.createdAt.localeCompare(a.createdAt); }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  /* ---------- summary ---------- */

  function renderSummary() {
    $summary.empty();
    const hasReviews = reviews.length > 0;
    $('#summary-col').toggleClass('hidden', !hasReviews);
    $('#gis-col').toggleClass('col-lg-5', hasReviews).toggleClass('col-lg-12', !hasReviews);
    if (!hasReviews) { return; }

    const average = getAverage();
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    $.each(reviews, function (index, review) { counts[review.rating] += 1; });

    const $score = $('<div>', { class: 'text-center text-md-start' }).append(
      $('<p>', { class: 'rating-score mb-1', text: average.toFixed(1) }),
      createStars(Math.round(average)).addClass('fs-5'),
      $('<p>', { class: 'small text-white-50 mb-0 mt-1', text: reviews.length + (reviews.length === 1 ? ' review' : ' reviews') })
    );

    const $bars = $('<div>', { class: 'd-grid gap-1 flex-grow-1' });
    for (let star = 5; star >= 1; star -= 1) {
      const percent = Math.round((counts[star] / reviews.length) * 100);
      $('<div>', { class: 'rating-bar' }).append(
        $('<span>', { class: 'small', text: star + ' ★' }),
        $('<div>', { class: 'progress', role: 'progressbar', 'aria-label': star + ' star reviews', 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 })
          .append($('<div>', { class: 'progress-bar', style: 'width:' + percent + '%' })),
        $('<span>', { class: 'small text-end', text: counts[star] })
      ).appendTo($bars);
    }

    $summary.append($('<div>', { class: 'd-flex flex-column flex-md-row align-items-md-center gap-4' }).append($score, $bars));
  }

  /* ---------- list ---------- */

  function createReviewCard(review) {
    const meta = [];
    if (areaLabels[review.area]) { meta.push(areaLabels[review.area]); }
    if (review.visitDate) {
      meta.push('visited ' + parseDateValue(review.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
    }

    const $head = $('<div>', { class: 'd-flex align-items-center gap-3 mb-2' }).append(
      $('<div>', { class: 'review-avatar', 'aria-hidden': 'true', text: review.name.charAt(0).toUpperCase() }),
      $('<div>', { class: 'flex-grow-1' }).append(
        $('<h3>', { class: 'h6 mb-0', text: review.name }),
        $('<p>', { class: 'small text-white-50 mb-0', text: formatDateTime(review.createdAt) })
      ),
      $('<div>', { class: 'text-end' }).append(
        createStars(review.rating),
        $('<span>', { class: 'visually-hidden', text: review.rating + ' out of 5' })
      )
    );

    const $card = $('<article>', { class: 'review-card' + (review.id === newestId ? ' is-new' : ''), 'data-id': review.id }).append($head);
    if (meta.length > 0) { $card.append($('<p>', { class: 'small mb-2', text: meta.join(' · ') })); }
    $card.append(
      $('<p>', { class: 'mb-2', text: review.text }),
      $('<button>', { type: 'button', class: 'btn btn-link btn-sm p-0 text-white-50', text: 'Remove', 'data-remove': review.id, 'aria-label': 'Remove the review by ' + review.name })
    );
    return $card;
  }

  function renderReviews() {
    const visible = getVisible();
    $list.empty();
    $.each(visible, function (index, review) { createReviewCard(review).appendTo($list); });

    const hasReviews = reviews.length > 0;
    $empty.toggleClass('hidden', hasReviews);
    $noMatch.toggleClass('hidden', !hasReviews || visible.length > 0);
    $('.chip-group').closest('div.d-flex').toggleClass('hidden', !hasReviews);
    renderSummary();
  }

  $('[data-area]').on('click', function () {
    areaFilter = $(this).attr('data-area');
    $('[data-area]').each(function () {
      const active = $(this).attr('data-area') === areaFilter;
      $(this).toggleClass('btn-light', active).toggleClass('btn-outline-light', !active).attr('aria-pressed', String(active));
    });
    renderReviews();
  });
  $sort.on('change', renderReviews);

  $list.on('click', 'button[data-remove]', function () {
    const id = $(this).attr('data-remove');
    $(this).closest('article').fadeOut(250, function () {
      reviews = $.grep(reviews, function (review) { return review.id !== id; });
      saveToStorage(REVIEWS_KEY, reviews);
      renderReviews();
      RixFitSite.toast('Review removed.');
    });
  });

  /* ---------- form ---------- */

  function updateCounter() {
    const length = $text.val().trim().length;
    $help.text(length < TEXT_MIN
      ? 'At least ' + TEXT_MIN + ' characters (' + (TEXT_MIN - length) + ' more). ' + length + ' / ' + TEXT_MAX
      : length + ' / ' + TEXT_MAX);
  }

  function selectedRating() {
    return $form.find('input[name="rating"]:checked').val() || '';
  }

  function checkDate(value) {
    if (value === '') { return ''; }
    const date = parseDateValue(value);
    return date === null || daysFromToday(date) > 0 ? 'The visit date cannot be in the future.' : '';
  }

  function checkText(value) {
    const trimmed = value.trim();
    if (trimmed.length < TEXT_MIN) { return 'Write at least ' + TEXT_MIN + ' characters.'; }
    if (trimmed.length > TEXT_MAX) { return 'Keep your review under ' + TEXT_MAX + ' characters.'; }
    if (selectedRating() !== '' && Number(selectedRating()) <= 2 && trimmed.length < LOW_RATING_MIN_TEXT) {
      return 'For 1 or 2 stars, please explain what went wrong (at least ' + LOW_RATING_MIN_TEXT + ' characters).';
    }
    return '';
  }

  function showRatingError(message) {
    $ratingError.text(message === '' ? '' : 'Error: ' + message).toggleClass('hidden', message === '');
  }

  function updateIdentity() {
    const user = RixFitSite.getUser();
    $nameGroup.toggleClass('hidden', user !== null);
    $identity.empty();
    if (user) {
      $identity.append('Posting as ', $('<strong>', { text: user.name }), '.');
    } else {
      $identity.append('Have an account? ', $('<a>', { href: RixFitSite.authUrl('login.html'), text: 'Sign in' }), ' to post under your name.');
    }
  }
  RixFitSite.onChange(updateIdentity);

  $form.on('change', 'input[name="rating"]', function () {
    showRatingError('');
    $ratingCaption.text(ratingCaptions[selectedRating()]);
    if ($text.hasClass('error')) { $text.trigger('blur'); }
  });

  $name.on('blur', function () {
    if ($name.val() !== '') {
      const message = checkPersonName($name.val(), 'name');
      if (message !== '') { jqShowFieldError($name, message); } else { jqMarkFieldValid($name); }
    }
  });
  $date.on('change', function () {
    const message = checkDate($date.val());
    if (message !== '') { jqShowFieldError($date, message); } else { jqClearFieldError($date); }
  });
  $text.on('input', function () {
    updateCounter();
    if ($text.hasClass('error') && checkText($text.val()) === '') { jqMarkFieldValid($text); }
  });
  $text.on('blur', function () {
    if ($text.val() !== '') {
      const message = checkText($text.val());
      if (message !== '') { jqShowFieldError($text, message); } else { jqMarkFieldValid($text); }
    }
  });
  $name.on('input', function () { if ($name.hasClass('error')) { jqClearFieldError($name); } });

  $form.on('submit', function (event) {
    event.preventDefault();
    const user = RixFitSite.getUser();

    const rules = [];
    if (!user) { rules.push({ $field: $name, check: function () { return checkPersonName($name.val(), 'name'); } }); }
    rules.push(
      { $field: $date, check: function () { return checkDate($date.val()); } },
      { $field: $text, check: function () { return checkText($text.val()); } }
    );
    const errors = jqValidateFields(rules);
    const ratingMissing = selectedRating() === '';
    showRatingError(ratingMissing ? 'Choose a rating from 1 to 5 stars.' : '');
    if (ratingMissing && errors.length === 0) { $('#star-5').trigger('focus'); }
    if (errors.length > 0 || ratingMissing) { return; }

    const review = {
      id: 'review-' + Date.now(),
      name: user ? user.name : $name.val().trim(),
      userEmail: user ? user.email : '',
      area: $form.find('input[name="area"]:checked').val() || '',
      rating: Number(selectedRating()),
      visitDate: $date.val(),
      text: $text.val().trim(),
      createdAt: new Date().toISOString()
    };
    reviews.push(review);
    const saved = saveToStorage(REVIEWS_KEY, reviews);
    newestId = review.id;

    $form[0].reset();
    jqClearFormState($form);
    $ratingCaption.text('');
    updateCounter();
    areaFilter = 'all';
    $sort.val('newest');
    $('[data-area="all"]').trigger('click');
    RixFitSite.toast(saved ? 'Thank you! Your review is posted.' : 'Your review is posted, but this browser would not save it.');
    const $card = $list.find('[data-id="' + review.id + '"]');
    if ($card.length > 0) { $card[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });

  $form.on('reset', function () {
    setTimeout(function () {
      jqClearFormState($form);
      showRatingError('');
      $ratingCaption.text('');
      updateCounter();
    }, 0);
  });

  RixFitSite.mountFaq([
    {
      question: 'Who can leave a review?',
      answer: 'Anyone who has visited the club. Please write only about your <strong>own experience</strong> and do not include personal details of other people.'
    },
    {
      question: 'Do I need an account to post a review?',
      answer: 'No. As a guest you only enter your name. If you <a href="login.html?next=reviews.html">sign in</a>, the review is posted under your account name.'
    },
    {
      question: 'Why do 1 and 2 star reviews need more text?',
      answer: 'For a rating of 1 or 2 stars we ask for at least <strong>30 characters</strong>, so the club can understand what went wrong and fix it.'
    },
    {
      question: 'Can I remove my review?',
      answer: 'Yes. Use the <strong>Remove</strong> button under the review card.'
    },
    {
      question: 'Where can I read independent reviews?',
      answer: 'On the public directory: <a href="https://2gis.kz/astana/search/RixFit" target="_blank" rel="noopener noreferrer">RixFit on 2GIS</a>. Compare the dates and the number of ratings.'
    },
    {
      question: 'I have a complaint, not a review. Who do I contact?',
      answer: 'Call the club on <a href="tel:+77754385471">+7 775 438 54 71</a> or write to <a href="mailto:rixfitastana@gmail.com">rixfitastana@gmail.com</a>.'
    }
  ], 4);

  updateIdentity();
  updateCounter();
  renderReviews();
});
