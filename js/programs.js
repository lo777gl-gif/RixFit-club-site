'use strict';

/* RixFit — programs.js
   programs-and-trainers.html: coach filter and FAQ built from an array (delegated accordion).
   Needs: jQuery 4.0.0, main.js and nuraly-common.js (RixFitUI) loaded before it. */

$(function () {
    const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /*
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

    /* 
       2. FAQ: a list built from an array (the markup for it exists nowhere in the HTML file).
       Answers come from this array only, never from the visitor, so .html() is safe for them. */

    const FAQ = [
        {
            question: 'What does a standard pass include?',
            answer: 'Every standard membership pass includes the <strong>fully equipped gym and strength area</strong>, the indoor swimming pool, 3 types of saunas and the summer terrace lounge.'
        },
        {
            question: 'When is the club open?',
            answer: 'Workdays from <strong>07:00 to 23:00</strong>, weekends from <strong>09:00 to 22:00</strong>.'
        },
        {
            question: 'How do I try the club before buying a pass?',
            answer: 'Send an application with the <strong>Booking form</strong> on the <a href="index.html#booking">main page</a> or call the club on <a href="tel:+77754385471">+7 775 438 54 71</a>. The club tells you the time to come by email or phone.'
        },
        {
            question: 'Can I choose my coach?',
            answer: 'Yes. In the <a href="index.html#booking">Booking form</a> choose a service that needs a coach, and the list shows the coaches of that area. Their working days are on the cards above.'
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
});