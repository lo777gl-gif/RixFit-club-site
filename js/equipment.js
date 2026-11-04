/* equipment.js - gym equipment page, written with jQuery.
   jQuery 4.0.0 (CDN, linked before this file in gym-equipment.html): needed for the
   selectors, delegated events and slide/fade effects used below.
   Old plain-JS version of the inventory list: old-js-version.js. */

$(function () {
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

  let sessionItems = [];

  function findItem(id) {
    return $.grep(equipmentCatalog, function (item) { return item.id === id; })[0];
  }

  function isInSession(id) {
    return $.grep(sessionItems, function (entry) { return entry.id === id; }).length > 0;
  }

  /* COMPARISON (feature: list built in code + delegated click, old version in old-js-version.js).
     $('<tr>', {...}).append(...) and .appendTo() replace createElement + dataset/setAttribute +
     append sequences; .on('click','button',fn) with $(this) replaces addEventListener +
     event.target.closest. The result is clearly shorter and easier to read (about a third fewer lines). */

  /* ---------- inventory: filter controls and table rows built in code ---------- */

  const $body = $('#equipment-list'); // selector by id
  const $table = $body.closest('table'); // traversal: from the tbody up to its table
  $('<th>', { scope: 'col', text: 'Action' }).appendTo($table.find('thead tr'));

  const area = jqLabeledControl('select', 'equipment-area', 'Area', 'col-12 col-sm-4');
  jqAddOptions(area.$control, [
    { value: 'all', label: 'All areas' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Strength' },
    { value: 'pool', label: 'Pool' }
  ]);
  const search = jqLabeledControl('input', 'equipment-search', 'Search equipment', 'col-12 col-sm-5');
  search.$control.attr({ type: 'search', placeholder: 'e.g. bike, dumbbells' });
  const $reset = $('<button>', { type: 'button', class: 'btn btn-outline-light w-100', text: 'Reset' });
  const $controls = $('<form>', { class: 'row g-2 align-items-end mb-3', role: 'search', 'aria-label': 'Filter equipment' })
    .append(area.$wrapper, search.$wrapper, $('<div>', { class: 'col-12 col-sm-3' }).append($reset));
  const $count = $('<p>', { class: 'small', 'aria-live': 'polite' });
  $table.closest('.table-responsive').before($controls, $count);

  function filterEquipment(searchText) {
    const query = searchText.trim().toLowerCase();
    const areaValue = area.$control.val();
    return $.grep(equipmentCatalog, function (item) {
      const text = (item.name + ' ' + item.tip).toLowerCase();
      return (areaValue === 'all' || item.area === areaValue) && (query === '' || text.indexOf(query) !== -1);
    });
  }

  function createEquipmentRow(item) {
    const added = isInSession(item.id);
    const $button = $('<button>', {
      type: 'button',
      class: 'btn btn-outline-light btn-sm',
      text: added ? 'Added' : 'Add to session',
      'data-id': item.id,
      'aria-label': 'Add ' + item.name + ' to my session'
    }).prop('disabled', added);
    return $('<tr>').append(
      $('<th>', { scope: 'row', text: equipmentAreaLabels[item.area] }),
      $('<td>').append($('<span>', { class: 'd-block', text: item.name }), $('<small>', { class: 'text-white-50', text: item.tip })),
      $('<td>', { text: item.fact }),
      $('<td>').append($button)
    );
  }

  function renderInventory() {
    const matches = filterEquipment(search.$control.val());
    $body.empty();
    $.each(matches, function (index, item) {
      createEquipmentRow(item).appendTo($body);
    });
    if (matches.length === 0) {
      $('<tr>').append(
        $('<td>', { class: 'error', colspan: 4, text: 'No equipment matches your filters. ' })
          .append($('<button>', { type: 'button', class: 'btn btn-outline-light btn-sm', 'data-action': 'reset', text: 'Show all equipment' }))
      ).appendTo($body);
    }
    $count.text('Showing ' + matches.length + ' of ' + equipmentCatalog.length + ' equipment entries.');
  }

  function resetInventory() {
    $controls[0].reset();
    renderInventory();
    search.$control.trigger('focus');
  }

  // submit event: pressing Enter in the search box must not reload the page
  $controls.on('submit', function (event) {
    event.preventDefault();
  });
  $controls.on('change', 'select', renderInventory);
  $controls.on('input', 'input[type="search"]', renderInventory);
  $reset.on('click', resetInventory);

  /* DELEGATED handler on the tbody, which exists from the start. The rows and their
     buttons are created by renderInventory() every time a filter changes, so a direct
     $body.find('button').on('click', ...) would be lost with the old rows and would
     never reach the new ones. */
  $body.on('click', 'button', function () {
    const $button = $(this);
    if ($button.attr('data-action') === 'reset') {
      resetInventory();
    } else {
      addToSession($button.attr('data-id'));
    }
  });

  /* ---------- session builder, created in code ---------- */

  const $heading = $('<h2>', { id: 'session-heading', text: 'Build your session' });
  const $help = $('<p>', { text: 'Add equipment from the inventory, then set minutes for cardio and the pool or sets × reps for strength. The estimate includes a 10-minute warm-up and a 5-minute cool-down.' });
  const $sessionEmpty = $('<p>', { class: 'border border-secondary rounded p-3' })
    // .html() is right here: the text contains a <strong> tag from our own constant string
    .html('Your session is empty. Use <strong>Add to session</strong> in the inventory above.');
  const $sessionList = $('<ul>', { class: 'list-group mb-3' });
  const $summary = $('<div>', { class: 'hidden', 'aria-live': 'polite' });
  const $planLink = $('<a>', { class: 'btn btn-primary', text: 'Plan this visit' });
  const $clear = $('<button>', { type: 'button', class: 'btn btn-outline-light', text: 'Clear session' });
  const $actions = $('<div>', { class: 'hidden' }).append($('<div>', { class: 'd-flex flex-wrap gap-2' }).append($planLink, $clear));

  $('<section>', { id: 'session-builder', class: 'py-4', 'aria-labelledby': 'session-heading' })
    .append($heading, $help, $sessionEmpty, $sessionList, $summary, $actions)
    .insertAfter('#inventory');

  function createNumberInput(id, label, value, min, max, entryId, property) {
    const control = jqLabeledControl('input', id, label, 'col-6 col-sm-4 col-md-3');
    control.$control
      .addClass('form-control-sm')
      .attr({ type: 'number', min: min, max: max, 'data-entry': entryId, 'data-property': property })
      .val(value);
    return control.$wrapper;
  }

  function createSessionItem(entry) {
    const item = findItem(entry.id);
    const $row = $('<div>', { class: 'row g-2 align-items-end' });
    if (item.unit === 'minutes') {
      $row.append(createNumberInput('minutes-' + entry.id, 'Minutes (5–60)', entry.minutes, 5, 60, entry.id, 'minutes'));
    } else {
      $row.append(
        createNumberInput('sets-' + entry.id, 'Sets (1–6)', entry.sets, 1, 6, entry.id, 'sets'),
        createNumberInput('reps-' + entry.id, 'Reps (5–20)', entry.reps, 5, 20, entry.id, 'reps')
      );
    }
    $row.append($('<div>', { class: 'col-12 col-sm-4 col-md-3' }).append(
      $('<button>', {
        type: 'button',
        class: 'btn btn-outline-danger btn-sm',
        text: 'Remove',
        'data-remove': entry.id,
        'aria-label': 'Remove ' + item.name + ' from session'
      })
    ));
    return $('<li>', { class: 'list-group-item bg-dark text-white border-secondary' })
      .append($('<p>', { class: 'fw-bold mb-2', text: item.name + ' (' + equipmentAreaLabels[item.area] + ')' }), $row);
  }

  function getEntryMinutes(entry) {
    if (entry.minutes !== undefined) {
      return entry.minutes;
    }
    return Math.ceil(entry.sets * (entry.reps * SECONDS_PER_REP + REST_SECONDS_PER_SET) / 60);
  }

  function calculateSession() {
    const minutesByArea = { cardio: 0, strength: 0, pool: 0 };
    $.each(sessionItems, function (index, entry) {
      minutesByArea[findItem(entry.id).area] += getEntryMinutes(entry);
    });
    const work = minutesByArea.cardio + minutesByArea.strength + minutesByArea.pool;
    return { minutesByArea: minutesByArea, totalMinutes: WARM_UP_MINUTES + work + COOL_DOWN_MINUTES };
  }

  function getPlanSuggestion(minutesByArea) {
    if (minutesByArea.pool > minutesByArea.cardio + minutesByArea.strength) {
      return { area: 'pool', focus: 'swimming' };
    }
    return { area: 'gym', focus: minutesByArea.cardio > minutesByArea.strength ? 'cardio' : 'strength' };
  }

  function updateSessionSummary() {
    const result = calculateSession();
    const suggestion = getPlanSuggestion(result.minutesByArea);

    $summary.empty().append(jqSummaryList([
      ['Cardio', formatDuration(result.minutesByArea.cardio)],
      ['Strength', formatDuration(result.minutesByArea.strength)],
      ['Pool', formatDuration(result.minutesByArea.pool)],
      ['Estimated total', formatDuration(result.totalMinutes) + ' including warm-up and cool-down']
    ]));
    if (result.totalMinutes > LONG_SESSION_MINUTES) {
      $('<p>', { class: 'error', text: 'Warning: this session is longer than 2 hours. Consider splitting it into two visits.' })
        .hide().appendTo($summary).fadeIn(250);
    }
    $('<p>', { class: 'small mb-3', text: 'Estimate only: real timing depends on your pace and how busy the floor is. This plan does not reserve equipment.' }).appendTo($summary);

    $planLink
      .attr('href', 'account.html?area=' + suggestion.area + '&focus=' + suggestion.focus + '#visit-plan')
      .text('Plan this ' + suggestion.area + ' visit');
  }

  // Shows/hides the empty message, summary and buttons depending on the list
  function refreshSessionState() {
    const isEmpty = sessionItems.length === 0;
    $sessionEmpty.toggleClass('hidden', !isEmpty);
    $summary.toggleClass('hidden', isEmpty);
    $actions.toggleClass('hidden', isEmpty);
    if (!isEmpty) {
      updateSessionSummary();
    }
  }

  function renderSession() {
    $sessionList.empty();
    $.each(sessionItems, function (index, entry) {
      createSessionItem(entry).appendTo($sessionList);
    });
    refreshSessionState();
  }

  function addToSession(id) {
    const item = findItem(id);
    if (item === undefined || isInSession(id)) {
      return;
    }
    const entry = item.unit === 'minutes'
      ? { id: id, minutes: item.area === 'pool' ? 30 : 15 }
      : { id: id, sets: 3, reps: 10 };
    sessionItems.push(entry);
    renderInventory();
    refreshSessionState();
    createSessionItem(entry).hide().appendTo($sessionList).slideDown(250, function () {
      /* Chain of 4 methods; what each link does:
           $sessionList.children(':last') -> the newest <li> (filter :last)
           .find('input')                 -> looks inside it for its number inputs
           .first()                       -> keeps only the first of them
           .trigger('focus')              -> moves keyboard focus there, after the slide ended */
      $sessionList.children(':last').find('input').first().trigger('focus');
    });
  }

  // input event, delegated: the number fields are created later by our own code
  $sessionList.on('input', 'input[type="number"]', function () {
    const $input = $(this);
    const value = Number($input.val());
    const min = Number($input.attr('min'));
    const max = Number($input.attr('max'));

    if ($input.val() === '' || !Number.isInteger(value) || value < min || value > max) {
      jqShowFieldError($input, 'Enter a whole number from ' + min + ' to ' + max + '.');
      return;
    }
    jqClearFieldError($input);
    const entry = $.grep(sessionItems, function (item) { return item.id === $input.attr('data-entry'); })[0];
    entry[$input.attr('data-property')] = value;
    updateSessionSummary();
  });

  // click event, delegated: Remove buttons of the session items
  $sessionList.on('click', 'button[data-remove]', function () {
    const id = $(this).attr('data-remove');
    $(this).prop('disabled', true).closest('li').slideUp(250, function () {
      sessionItems = $.grep(sessionItems, function (entry) { return entry.id !== id; });
      renderInventory();
      renderSession();
      $heading.attr('tabindex', '-1').trigger('focus');
    });
  });

  $clear.on('click', function () {
    $sessionList.slideUp(250, function () {
      sessionItems = [];
      renderInventory();
      renderSession();
      $sessionList.show();
      search.$control.trigger('focus');
    });
  });

  renderInventory();
  renderSession();
});
