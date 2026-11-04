/* account.js - personal visit planner, written with jQuery.
   jQuery 4.0.0 (CDN, linked before this file in account.html): needed for the
   selectors, delegated remove button and slide/fade effects used below.
   Old plain-JS version of the schedule list: old-js-version.js. */

$(function () {
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

  const $form = $('#visit-plan-form');
  const $area = $('#plan-area');
  const $day = $('#plan-day');
  const $time = $('#plan-time');
  const $goal = $('#plan-goal');
  const $result = $('#plan-result');
  const $confirmation = $('#plan-confirmation');
  const $errors = $('#plan-errors');
  const $preview = $('#plan-preview');
  const $empty = $('#schedule-empty');
  const $list = $('#schedule-list');

  // noValidate is set by JS: without JS the browser's own required/min/max checks still work
  $form.prop('noValidate', true);
  $('#account-mode').text('This page is a personal planner. Visits you plan are saved only in this browser — it does not show a verified membership or reserve a class.');

  const $summary = $('<p>', { class: 'small', 'aria-live': 'polite' }).insertAfter($list);
  const $status = $('<p>', { class: 'success hidden', role: 'status', tabindex: '-1' }).insertAfter($summary);

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function describePlan(plan) {
    return capitalize(plan.day) + ' at ' + plan.time + ' — ' + planAreaLabels[plan.area] + ', ' + focusLabels[plan.goal];
  }

  function sortPlans(items) {
    return items.slice().sort(function (a, b) {
      return planDays.indexOf(a.day) - planDays.indexOf(b.day) || a.time.localeCompare(b.time);
    });
  }

  function getDayHours(day) {
    const hours = day === 'saturday' || day === 'sunday' ? WORK_HOURS.weekend : WORK_HOURS.weekday;
    return { open: pad2(hours.open) + ':00', close: pad2(hours.close) + ':00' };
  }

  function isPeakTime(time) {
    const minutes = timeToMinutes(time);
    return (minutes >= 360 && minutes < 540) || (minutes >= 1080 && minutes < 1260);
  }

  function findConflict(day, time) {
    return $.grep(plans, function (plan) {
      return plan.day === day && Math.abs(timeToMinutes(plan.time) - timeToMinutes(time)) < MIN_GAP_MINUTES;
    })[0];
  }

  function checkPlanTime(time, day) {
    if (time === '' || time < PLAN_EARLIEST || time > PLAN_LATEST) {
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
    if (area !== '' && focusAreas[goal].indexOf(area) === -1) {
      const allowed = $.map(focusAreas[goal], function (item) { return planAreaLabels[item].toLowerCase(); });
      return focusLabels[goal] + ' is planned in the ' + allowed.join(' or ') + ', not the ' + planAreaLabels[area].toLowerCase() + '.';
    }
    return '';
  }

  function updatePlanPreview() {
    const parts = [];
    parts.push($area.val() === '' ? 'Area: not chosen' : 'Area: ' + planAreaLabels[$area.val()]);
    if ($day.val() !== '') {
      const hours = getDayHours($day.val());
      parts.push(capitalize($day.val()) + ' (club open ' + hours.open + '–' + hours.close + ')');
    } else {
      parts.push('Day: not chosen');
    }
    parts.push($time.val() === '' ? 'Time: not chosen' : 'Time: ' + $time.val());
    parts.push($goal.val() === '' ? 'Focus: not chosen' : 'Focus: ' + focusLabels[$goal.val()]);

    $preview.empty().append($('<p>', { class: 'mb-1', text: 'Current plan: ' + parts.join(' · ') + '.' }));
    if ($time.val() !== '' && $area.val() === 'gym' && isPeakTime($time.val())) {
      // Effect with a purpose: the peak-time warning fades in when the chosen time is busy
      $('<p>', { class: 'small mb-1', text: 'Note: 18:00–21:00 is peak time — the gym floor is busiest and you may need to share equipment.' })
        .hide().appendTo($preview).fadeIn(300);
    }
  }

  /* COMPARISON (feature: show/hide + remove in the schedule, old version in old-js-version.js).
     .toggleClass('hidden', cond) matches classList.toggle one to one, so no gain there; but
     .closest('li').slideUp(250, callback) replaces a plain jump-cut removal and a manual
     animation would need requestAnimationFrame or CSS. Overall: shorter and clearer for effects, equal for class toggling. */

  /* ---------- schedule list: the <li> is cloned from the page's <template> ---------- */

  function createPlanItem(plan) {
    // .html() on <template> returns its markup; trimmed because $("...") needs a string starting with "<"
    const $item = $($('#schedule-item-template').html().trim());
    $item.find('.visit-description').text(describePlan(plan));
    $item.find('.visit-remove')
      .attr('data-id', plan.id)
      .attr('aria-label', 'Remove visit: ' + describePlan(plan));
    return $item;
  }

  function renderPlans() {
    $list.empty();
    $.each(sortPlans(plans), function (index, plan) {
      createPlanItem(plan).appendTo($list);
    });

    const isEmpty = plans.length === 0;
    $empty.toggleClass('hidden', !isEmpty);
    $list.toggleClass('hidden', isEmpty);

    if (isEmpty) {
      $summary.text('');
      return;
    }
    const gymCount = $.grep(plans, function (plan) { return plan.area === 'gym'; }).length;
    $summary.text(plans.length + ' of ' + MAX_PLANS + ' weekly visits planned: ' + gymCount + ' gym, ' + (plans.length - gymCount) + ' pool.');
  }

  /* DELEGATED click on #schedule-list: the "Remove visit" buttons are cloned from the
     template each time renderPlans() runs, so they did not exist when this line ran.
     A direct $('.visit-remove').on('click', ...) would find zero buttons now and never
     fire for the ones we add later. */
  $list.on('click', '.visit-remove', function () {
    const $button = $(this);
    const id = $button.attr('data-id');
    const removed = $.grep(plans, function (plan) { return plan.id === id; })[0];

    // Chain: from the clicked button go up to its <li>, slide it away, and update data only after it finished
    $button.prop('disabled', true).closest('li').slideUp(250, function () {
      plans = $.grep(plans, function (plan) { return plan.id !== id; });
      saveToStorage(PLANS_KEY, plans);
      renderPlans();
      $status.text('Removed: ' + describePlan(removed) + '.').removeClass('hidden').hide().fadeIn(200).trigger('focus');
    });
  });

  /* ---------- the form ---------- */

  $form.on('submit', function (event) {
    // Without preventDefault() the browser would send the form and reload the page, losing the checks below
    event.preventDefault();
    $confirmation.addClass('hidden');
    jqHideMessage($errors);
    $status.addClass('hidden');

    const errors = jqValidateFields([
      { $field: $area, check: function () { return $area.val() === '' ? 'Choose the gym or the pool.' : ''; } },
      { $field: $day, check: function () { return $day.val() === '' ? 'Choose a day.' : ''; } },
      { $field: $time, check: function () { return checkPlanTime($time.val(), $day.val()); } },
      { $field: $goal, check: function () { return checkPlanGoal($goal.val(), $area.val()); } }
    ]);

    if (errors.length === 0 && plans.length >= MAX_PLANS) {
      errors.push('You already have ' + MAX_PLANS + ' planned visits. Remove one before adding another.');
    }
    if (errors.length > 0) {
      jqShowMessage($errors, 'error', 'The plan was not saved:', errors);
      $errors.hide().slideDown(250);
      if (plans.length >= MAX_PLANS) {
        $result.trigger('focus');
      }
      return;
    }

    const plan = { id: 'plan-' + Date.now(), area: $area.val(), day: $day.val(), time: $time.val(), goal: $goal.val() };
    plans.push(plan);
    const saved = saveToStorage(PLANS_KEY, plans);
    renderPlans();

    // The new visit slides into the list (attribute selector finds its button, closest() its <li>)
    $list.find('.visit-remove[data-id="' + plan.id + '"]').closest('li').hide().slideDown(300);

    // Success message only when every check passed
    $confirmation
      .empty()
      .append($('<p>', {
        class: 'mb-0',
        text: saved
          ? 'Saved on this device: ' + describePlan(plan) + '. No club booking was made — the club does not receive this plan.'
          : 'Added for this session only (this browser blocked saving): ' + describePlan(plan) + '. No club booking was made.'
      }))
      .removeClass('hidden')
      .hide()
      .fadeIn(300, function () {
        $result.trigger('focus');
      });
    $form[0].reset(); // jQuery has no .reset(): call the native form method on the raw element
  });

  $form.on('reset', function () {
    jqClearFormState($form);
    setTimeout(updatePlanPreview, 0);
  });

  // change event, delegated to the form: clears the field's error and refreshes the preview
  $form.on('change', 'input, select', function () {
    jqClearFieldError($(this));
    updatePlanPreview();
  });
  $time.on('input', updatePlanPreview);

  /* ---------- prefill from the equipment page (?area=gym&focus=cardio) ---------- */

  function applyUrlPrefill() {
    const params = new URLSearchParams(window.location.search);
    const area = params.get('area');
    const focus = params.get('focus');
    if (area === null || !planAreaLabels.hasOwnProperty(area)) {
      return;
    }
    $area.val(area);
    if (focus !== null && focusLabels.hasOwnProperty(focus)) {
      $goal.val(focus);
    }
    $('<p>', { class: 'success', role: 'status', text: 'Area and focus were filled in from your equipment session. Choose a day and time to finish the plan.' })
      .insertBefore($form);
  }

  applyUrlPrefill();
  updatePlanPreview();
  renderPlans();
});
