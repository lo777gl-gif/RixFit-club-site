'use strict';

/* RixFit — programs.js
   programs-and-trainers.html: coach filter, FAQ built from an array (delegated accordion), trial-session form.
   Needs: jQuery 4.0.0, main.js and nuraly-common.js (RixFitUI) loaded before it. */

$(function () {
    const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /* ======================================================================
       1. Coach filter: area buttons + day select + count + empty state.
       Visitor goal: "who can train me in the pool on Saturday?"
       The schedule is read from the badges that are already on the cards. */

    const AREAS = [
        { key: 'all', label: 'All coaches' },
        { key: 'gym', label: 'Gym & Strength' },
        { key: 'pool', label: 'Pool & Aquatics' }
    ];

    const $cards = $('.trainer-card');
    const $sections = $('.coach-list, .aqua-list');
    let selectedArea = 'all';

    function getCardDays($card) {
        // Only the schedule badges sit inside ".d-flex"; the working-hours badge is inside a paragraph
        return $card.find('.d-flex .badge').map(function () {
            return $(this).text().trim();
        }).get();
    }

    function getCardArea($card) {
        return $card.closest('.coach-list').length > 0 ? 'gym' : 'pool';
    }

    const $areaGroup = $('<div>', { 'class': 'btn-group', role: 'group', 'aria-label': 'Coach area' });
    $.each(AREAS, function (_, area) {
        $('<button>', { type: 'button', 'class': 'btn btn-outline-light', 'data-area': area.key })
            .text(area.label)
            .appendTo($areaGroup);
    });
    $areaGroup.children().first().addClass('active').attr('aria-pressed', 'true');

    const $daySelect = $('<select>', { id: 'trainer-day', 'class': 'form-select' }).append(RixFitUI.makeOption('Any day', ''));
    $.each(DAY_ORDER, function (_, day) {
        $daySelect.append(RixFitUI.makeOption(day, day));
    });
    const $resetFilter = $('<button>', { type: 'button', id: 'trainer-reset', 'class': 'btn btn-outline-secondary w-100' }).text('Reset filters');

    const $filterBar = $('<div>', { id: 'trainer-filter', 'class': 'row g-2 align-items-end py-3', role: 'search' }).append(
        $('<div>', { 'class': 'col-md-6' }).append($('<span>', { 'class': 'form-label d-block' }).text('Area'), $areaGroup),
        $('<div>', { 'class': 'col-md-3' }).append($('<label>', { 'class': 'form-label', 'for': 'trainer-day' }).text('Works on'), $daySelect),
        $('<div>', { 'class': 'col-md-3' }).append($resetFilter)
    );
    const $count = $('<p>', { id: 'trainer-count', 'class': 'mb-2', 'aria-live': 'polite' });
    const $empty = $('<div>', { id: 'trainer-empty', 'class': 'alert alert-warning', role: 'status' })
        .text('No coach works on that day in this area. Try another day or press "Reset filters".')
        .hide();
    $('.coach-list').before($filterBar, $count, $empty);

    function applyCoachFilter() {
        const day = $daySelect.val();
        $cards.each(function () {
            const $card = $(this);
            const areaMatches = selectedArea === 'all' || getCardArea($card) === selectedArea;
            const dayMatches = day === '' || getCardDays($card).indexOf(day) !== -1;
            $card.closest('.col').toggleClass('d-none', !(areaMatches && dayMatches));
        });

        // :not(.d-none) keeps only the columns that are still visible
        const visible = $sections.find('.col:not(.d-none)').length;
        $count.text('Showing ' + visible + ' of ' + $cards.length + ' coaches');

        // Effect with a purpose: a whole section (heading + cards) slides away when none of its coaches match
        $sections.each(function () {
            const $section = $(this);
            $section.stop(true, true);
            if ($section.find('.col:not(.d-none)').length > 0) {
                $section.slideDown(250);
            } else {
                $section.slideUp(250);
            }
        });

        $empty.stop(true, true);
        if (visible === 0) {
            $empty.fadeIn(200);
        } else {
            $empty.fadeOut(150);
        }
    }

    // Delegated on the button group: one handler for the three area buttons
    $areaGroup.on('click', 'button', function () {
        const $button = $(this);
        selectedArea = $button.data('area');
        $button.addClass('active').attr('aria-pressed', 'true')
            .siblings().removeClass('active').attr('aria-pressed', 'false');
        applyCoachFilter();
    });
    $daySelect.on('change', applyCoachFilter);
    $resetFilter.on('click', function () {
        $daySelect.val('');
        $areaGroup.children().first().trigger('click');
    });
    applyCoachFilter();

    /* ======================================================================
       2. FAQ: a list built from an array (the markup for it exists nowhere in the HTML file).
       Answers come from this array only, never from the visitor, so .html() is safe for them. */

    const FAQ = [
        {
            question: 'What does a standard pass include?',
            answer: 'Every standard membership pass includes the <strong>fully equipped gym and strength area</strong>, the indoor swimming pool, 3 types of saunas and the summer terrace lounge.'
        },
        {
            question: 'When is the club open?',
            answer: 'Workdays from <strong>07:00 to 23:00</strong>, weekends from <strong>09:00 to 22:00</strong>. The free trial form below is for the visit day you choose.'
        },
        {
            question: 'How do I try the club before buying a pass?',
            answer: 'Fill in the <strong>Book a Free Trial Session</strong> form below. This site shows a demonstration only: the club tells you the time to come by email or phone.'
        },
        {
            question: 'Can I choose my coach?',
            answer: 'Yes. Pick a preferred coach in the trial form. The list follows the area you choose, and the form checks that the coach works on the day you select.'
        },
        {
            question: 'Can children train at the club?',
            answer: 'Online forms accept visitors from 12 years. Children may swim only under direct adult supervision, see the <a href="rules.html#swimming-pool-rules">pool rules</a>.'
        },
        {
            question: 'Where can I read the club rules?',
            answer: 'On the <a href="rules.html">Rules page</a>: dress code, gym floor etiquette, health and safety, lockers and the membership policy.'
        }
    ];
    const FAQ_FIRST_PART = 4;

    function createFaqItem(item, index) {
        const $question = $('<button>', {
            type: 'button',
            'class': 'faq-question btn btn-outline-light w-100 text-start',
            'aria-expanded': 'false',
            'aria-controls': 'faq-answer-' + index
        }).text(item.question); // .text(): the question is shown exactly as written

        // .html(): the answer holds <strong> and <a>; .text() would show those tags as plain characters
        const $answer = $('<div>', { id: 'faq-answer-' + index, 'class': 'faq-answer p-3' }).html(item.answer).hide();

        return $('<div>', { 'class': 'faq-item mb-2' }).append($question, $answer);
    }

    const $faqList = $('<div>', { id: 'faq-list' });
    $.each(FAQ.slice(0, FAQ_FIRST_PART), function (index, item) {
        $faqList.append(createFaqItem(item, index));
    });
    const $faqMore = $('<button>', { type: 'button', id: 'faq-more', 'class': 'btn btn-outline-secondary mt-2' }).text('More questions');
    const $faq = $('<section>', { id: 'faq', 'class': 'mb-4 p-3' }).append($('<h3>').text('Frequently Asked Questions'), $faqList, $faqMore);
    $('#testimonials').before($faq);

    /* DELEGATED handler: it is bound to #faq-list, which exists now, and it reacts to ".faq-question"
       buttons that the "More questions" button creates LATER. Binding directly with
       $('.faq-question').on('click', ...) would not work for them: a direct handler is attached only to
       the elements that exist at the moment of the call, and elements created afterwards (the extra
       questions below) would be dead buttons. With delegation the click bubbles up to #faq-list, and jQuery
       checks there whether the real target matches ".faq-question". */
    $faqList.on('click', '.faq-question', function () {
        const $button = $(this);
        const $item = $button.closest('.faq-item');

        // Chain, link by link: take the other items -> remove their "selected" class -> look for their answers
        // inside -> slide those answers up (an accordion: only one answer stays open)
        $item.siblings('.faq-item').removeClass('selected').find('.faq-answer').slideUp(200);
        $item.siblings('.faq-item').find('.faq-question').attr('aria-expanded', 'false');

        $item.toggleClass('selected');
        // slideToggle(duration, callback): the callback runs only after the slide has finished,
        // so aria-expanded is updated to the final state, not the state in the middle of the animation
        $button.next('.faq-answer').slideToggle(300, function () {
            $button.attr('aria-expanded', String($(this).css('display') !== 'none'));
        });
    });

    $faqMore.on('click', function () {
        $.each(FAQ.slice(FAQ_FIRST_PART), function (offset, item) {
            createFaqItem(item, FAQ_FIRST_PART + offset).hide().appendTo($faqList).slideDown(250);
        });
        $faqMore.prop('disabled', true).text('All questions are shown');
    });

    /* ======================================================================
       3. Trial-session form (#trial-form). Nothing is sent anywhere: there is no server behind it. */

    const TRIAL_TRAINERS = {
        vera: { name: 'Vera', area: 'gym' },
        ulan: { name: 'Ulan', area: 'gym' },
        chingis: { name: 'Chingis', area: 'gym' },
        'dmitriy-gym': { name: 'Dmitriy', area: 'gym' },
        'dmitriy-pool': { name: 'Dmitriy', area: 'pool' },
        sergey: { name: 'Sergey Mikhailovich', area: 'pool' },
        sabina: { name: 'Sabina', area: 'pool' },
        samat: { name: 'Samat', area: 'pool' }
    };

    const $form = $('#trial-form');
    const $errorBox = $('#trial-error');
    const $confirmBox = $('#trial-confirmation');
    const $trainer = $('#trainer');
    const $date = $('#preferred-date');

    // The HTML keeps required/min/max as the first line of defence. novalidate (set here, not in the HTML)
    // only hides the browser's one-bubble-at-a-time messages so our own message can appear beside every field.
    // A check in the browser never replaces a check on the server: the visitor can switch JavaScript off,
    // edit the page in DevTools or send the request without a browser at all, so the server must check again.
    $form.prop('noValidate', true);
    $date.attr({
        min: toDateInputValue(getToday()),
        max: toDateInputValue(addDays(getToday(), RixFitUI.BOOKING_WINDOW_DAYS))
    });

    function getTrialArea() {
        return $form.find('input[name="area"]:checked').val();
    }

    // The trainer list follows the chosen area: coaches of the other area are disabled and hidden
    function syncTrainerOptions() {
        const area = getTrialArea();
        $trainer.find('option').each(function () {
            const trainer = TRIAL_TRAINERS[$(this).val()];
            const otherArea = Boolean(trainer) && trainer.area !== area;
            $(this).prop('disabled', otherArea).prop('hidden', otherArea);
        });
        if ($trainer.find('option:selected').prop('disabled')) {
            $trainer.val('any');
        }
    }

    function getTrainerDays(trainer) {
        const sectionSelector = trainer.area === 'gym' ? '.coach-list' : '.aqua-list';
        const $card = $(sectionSelector + ' .trainer-card').filter(function () {
            return $(this).find('h4').text() === trainer.name;
        });
        return getCardDays($card);
    }

    function trainerError() {
        const trainer = TRIAL_TRAINERS[$trainer.val()];
        const visit = parseDateValue($date.val());
        if (!trainer || visit === null) {
            return ''; // "No preference", or a date that its own rule reports
        }
        const days = getTrainerDays(trainer);
        const weekday = RixFitUI.DAY_NAMES[visit.getDay()];
        if (days.indexOf(weekday) === -1) {
            return trainer.name + ' works on ' + days.join(', ') + '. Choose one of those days or another coach.';
        }
        return '';
    }

    function ageError() {
        const age = Number($('#age').val());
        return Number.isInteger(age) && age >= 12 && age <= 90 ? '' : 'Enter a whole number from 12 to 90.';
    }

    const rules = [
        { $field: $('#full-name'), check: function () { return checkPersonName($('#full-name').val(), 'full name'); } },
        { $field: $('#email'), check: function () { return checkEmail($('#email').val()); } },
        { $field: $('#phone'), check: function () { return checkPhone($('#phone').val(), true); } },
        { $field: $('#age'), check: ageError },
        { $field: $date, check: function () { return RixFitUI.visitDateError($date.val()); } },
        { $field: $trainer, check: trainerError } // combines two fields: the coach and the day of the visit
    ];

    $form.on('change', 'input[name="area"]', syncTrainerOptions);
    RixFitUI.clearErrorsWhileTyping($form, rules);

    // The date and the coach depend on each other: when one changes, re-check the pair only if it was marked invalid
    $form.on('change', '#preferred-date, #trainer', function () {
        $.each([$date, $trainer], function (_, $field) {
            const rule = $.grep(rules, function (item) { return item.$field.is($field); })[0];
            if ($field.hasClass('error') && rule.check() === '') {
                RixFitUI.clearFieldError($field, true);
            }
        });
    });

    $form.on('submit', function (event) {
        // Without preventDefault() the browser would submit the form (a POST to "#"), the page would reload,
        // and the result below would never be seen
        event.preventDefault();
        $confirmBox.empty();

        const failed = RixFitUI.validate(rules);
        if (failed.length > 0) {
            RixFitUI.showMessage($errorBox, 'error', 'Please fix ' + failed.length + ' field(s) marked above and send the form again.');
            return;
        }

        $errorBox.empty();
        const trainer = TRIAL_TRAINERS[$trainer.val()];
        const visit = parseDateValue($date.val());
        const lines = [
            'Name: ' + $('#full-name').val().trim(),
            'Contacts: ' + $('#email').val().trim() + ', ' + $('#phone').val().trim(),
            'Area: ' + (getTrialArea() === 'gym' ? 'Gym & Strength' : 'Pool & Aquatics'),
            'Coach: ' + (trainer ? trainer.name : 'no preference'),
            'Date: ' + $date.val() + ' (' + RixFitUI.DAY_NAMES[visit.getDay()] + ')',
            'Promo news: ' + ($('#newsletter').prop('checked') ? 'yes' : 'no'),
            'Demo mode: no data was sent to a server. No real booking, payment or order was created.'
        ];
        const notes = $('#notes').val().trim();
        if (notes !== '') {
            lines.splice(6, 0, 'Notes: ' + notes);
        }

        $form.get(0).reset(); // its handler clears the boxes, so the confirmation is shown after it
        RixFitUI.showMessage($confirmBox, 'success', 'Trial request #' + generateRefNumber() + ' received!', lines);
        RixFitUI.scrollToBox($confirmBox);
    });

    $form.on('reset', function () {
        $errorBox.empty();
        $confirmBox.empty();
        RixFitUI.clearFormErrors($form);
        setTimeout(syncTrainerOptions, 0); // values are restored after the reset event
    });

    syncTrainerOptions();
});
