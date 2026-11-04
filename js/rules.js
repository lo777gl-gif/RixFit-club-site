'use strict';

/* RixFit — rules.js
   rules.html: search + category filter for the club and pool rules, rewritten with jQuery
   (plain-JavaScript version: old-js-version.js, initRulesFilter).
   Needs: jQuery 4.0.0 and nuraly-common.js (RixFitUI) loaded before it. */

$(function () {
    const $club = $('#club-rules');
    const $pool = $('#swimming-pool-rules');
    if ($club.length === 0 || $pool.length === 0) {
        return;
    }

    /* ---------- One flat list of rules, read from the markup that is already on the page ---------- */

    const rules = [];

    $club.find('article').each(function () {
        const $article = $(this);
        const category = $article.find('h3').text().replace(/^\d+\.\s*/, '');
        const $container = $article.closest('.col');
        $article.find('li').each(function () {
            rules.push({ $item: $(this), $container: $container, category: category, text: $(this).text().toLowerCase() });
        });
    });
    $pool.find('ol > li').each(function () {
        rules.push({ $item: $(this), $container: $pool, category: 'Swimming Pool', text: $(this).text().toLowerCase() });
    });

    const categories = [];
    $.each(rules, function (_, rule) {
        if ($.inArray(rule.category, categories) === -1) {
            categories.push(rule.category);
        }
    });

    /* ---------- Controls, built with jQuery ---------- */

    const $search = $('<input>', { type: 'search', id: 'rules-search', 'class': 'form-control', placeholder: 'e.g. towel, locker, swim cap' });
    const $category = $('<select>', { id: 'rules-category', 'class': 'form-select' }).append(RixFitUI.makeOption('All categories', 'all'));
    $.each(categories, function (_, category) {
        $category.append(RixFitUI.makeOption(category, category));
    });
    const $reset = $('<button>', { type: 'button', id: 'rules-reset', 'class': 'btn btn-outline-secondary w-100' }).text('Reset filters');

    const $bar = $('<div>', { 'class': 'row g-2 align-items-end py-3', role: 'search' }).append(
        $('<div>', { 'class': 'col-md-5' }).append($('<label>', { 'class': 'form-label', 'for': 'rules-search' }).text('Search rules'), $search),
        $('<div>', { 'class': 'col-md-4' }).append($('<label>', { 'class': 'form-label', 'for': 'rules-category' }).text('Category'), $category),
        $('<div>', { 'class': 'col-md-3' }).append($reset)
    );
    const $count = $('<p>', { id: 'rules-count', 'class': 'mb-2', 'aria-live': 'polite' });
    const $empty = $('<div>', { id: 'rules-empty', 'class': 'alert alert-warning', role: 'status' })
        .text('No rules match your search. Try another word or press "Reset filters".')
        .hide();
    $club.before($bar, $count, $empty);

    /* FEATURE 2 of 3 — show/hide of the rules.
       .toggleClass('d-none', condition) replaces classList.toggle, and $(this).find('li:not(.d-none)') replaces
       the Set + rules.some() search for visible items (3 lines become 1). That part is clearer. The function
       as a whole is NOT shorter (30 lines against 24) because I added the fadeIn/fadeOut of the empty state. */
    function applyRulesFilter() {
        const query = $search.val().trim().toLowerCase();
        const category = $category.val();
        let visibleCount = 0;

        $.each(rules, function (_, rule) {
            const matchesText = query === '' || rule.text.indexOf(query) !== -1;
            const matchesCategory = category === 'all' || rule.category === category;
            const isVisible = matchesText && matchesCategory;
            rule.$item.toggleClass('d-none', !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        // Hide a whole card/section when none of its rules is left. .add() joins the five cards and the pool section
        $club.find('.col').add($pool).each(function () {
            $(this).toggleClass('d-none', $(this).find('li:not(.d-none)').length === 0);
        });

        $count.text('Showing ' + visibleCount + ' of ' + rules.length + ' rules');

        // The empty-state message fades in only when the search really finds nothing
        $empty.stop(true, true);
        if (visibleCount === 0) {
            $empty.fadeIn(200);
        } else {
            $empty.fadeOut(150);
        }
    }

    function resetRulesFilter() {
        $search.val('');
        $category.val('all');
        applyRulesFilter();
        $search.trigger('focus');
    }

    /* ---------- Events: input, keydown, change, click ---------- */

    $search.on('input', applyRulesFilter);
    $search.on('keydown', function (event) {
        if (event.key === 'Escape') {
            resetRulesFilter();
        }
    });
    $category.on('change', applyRulesFilter);
    $reset.on('click', resetRulesFilter);

    applyRulesFilter();
});
