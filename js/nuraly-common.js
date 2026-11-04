'use strict';

/* RixFit — nuraly-common.js
   Shared jQuery code for index.html, programs-and-trainers.html, rules.html and register.html.
   Load order on every page: jQuery (CDN) -> main.js (club data + pure helpers) -> this file -> the page file.

   jQuery version: 4.0.0 (the same file services.html loads from code.jquery.com, with an SRI hash).
   The <script> line for jQuery is needed because $ and every $(...) call below exist only after the
   library has loaded, so it must come before this file and the page files.

   main.js stays plain JavaScript because the other pages (reviews, account, equipment, nutrition) still
   use it. From main.js this file only reuses pure functions that touch no DOM (checkEmail, checkPhone,
   checkPersonName, getToday, addDays, parseDateValue, toDateInputValue), so no feature mixes both approaches. */

const RixFitUI = (function ($) {
    const BOOKING_WINDOW_DAYS = 30;
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function isChoice($field) {
        return $field.is('[type="radio"], [type="checkbox"]');
    }

    // Every field gets its own "<id>-error" paragraph; radio/checkbox use their id or name
    function errorIdFor($field) {
        return ($field.attr('id') || $field.attr('name')) + '-error';
    }

    /* ---------- Field-level errors (a message beside each invalid field) ---------- */

    function showFieldError($field, message, $anchor) {
        const id = errorIdFor($field);
        let $error = $('#' + id);

        if ($error.length === 0) {
            $error = $('<p>', { id: id, 'class': 'error small mb-0' }).hide();
            // A radio/checkbox error goes after the whole group, not between the options
            const $after = $anchor || (isChoice($field) ? $field.closest('.form-check').parent().children().last() : $field);
            $after.after($error);
        }

        $error.stop(true, true).text('Error: ' + message).slideDown(150);

        // Chain, link by link: take the class "success" off -> put the class "error" on (the red style
        // from base.css) -> tell screen readers the field is invalid -> link the field to its message
        $field.removeClass('success').addClass('error').attr('aria-invalid', 'true').attr('aria-describedby', id);
    }

    // animate = true slides the message away (the visitor fixed the field); false clears it at once
    function clearFieldError($field, animate) {
        const $error = $('#' + errorIdFor($field));
        if (animate) {
            $error.stop(true, true).slideUp(150);
        } else {
            $error.stop(true, true).hide().text('');
        }
        $field.removeClass('error success').removeAttr('aria-invalid');
    }

    function markValid($field) {
        clearFieldError($field, false);
        $field.addClass('success');
    }

    function clearFormErrors($form) {
        $form.find('input, select, textarea').each(function () {
            clearFieldError($(this), false);
        });
    }

    /* Runs a list of rules: { $field, check: () => '' or an error message, $anchor? }.
       Shows every error beside its own field, focuses the first invalid field and
       returns the list of failed rules (empty list = the whole form is valid). */
    function validate(rules) {
        const failed = [];

        $.each(rules, function (_, rule) {
            const message = rule.check();
            if (message === '') {
                markValid(rule.$field);
            } else {
                showFieldError(rule.$field, message, rule.$anchor);
                failed.push(rule);
            }
        });

        if (failed.length > 0) {
            failed[0].$field.trigger('focus');
        }
        return failed;
    }

    // Clears an error as soon as the visitor fixes the field. One handler on the form is enough
    // (delegation), and it also covers fields that the page scripts add to the form later.
    function clearErrorsWhileTyping($form, rules) {
        $form.on('input change', 'input, select, textarea', function () {
            const name = $(this).attr('name');
            $.each(rules, function (_, rule) {
                const sameField = rule.$field.attr('name') === name;
                if (sameField && rule.$field.hasClass('error') && rule.check() === '') {
                    clearFieldError(rule.$field, true);
                }
            });
        });
    }

    /* ---------- Result messages (Bootstrap alerts built with jQuery) ---------- */

    // type: 'success' or 'error'; lines: optional list of plain-text lines
    function showMessage($box, type, title, lines) {
        const $alert = $('<div>', {
            'class': 'alert alert-' + (type === 'error' ? 'danger' : 'success') + ' mt-3',
            role: type === 'error' ? 'alert' : 'status'
        });
        $alert.append($('<h5>', { 'class': 'alert-heading' }).text(title));
        $.each(lines || [], function (_, line) {
            // .text(), never .html(): the line can contain what the visitor typed
            $alert.append($('<p>', { 'class': 'mb-1' }).text(line));
        });

        $box.stop(true, true).empty().append($alert.hide());
        $alert.fadeIn(300);
    }

    function hideMessage($box) {
        $box.children().stop(true, true).fadeOut(150, function () {
            $(this).remove();
        });
    }

    // Brings a result into view; the animation is the visible feedback after a long form
    function scrollToBox($box) {
        $('html, body').stop(true).animate({ scrollTop: Math.max($box.offset().top - 120, 0) }, 400);
    }

    /* ---------- Shared date rule (booking and trial forms) ---------- */

    function visitDateError(value) {
        if (value === '') {
            return 'Choose the day of your visit.';
        }
        const visit = parseDateValue(value);
        if (visit === null || Number.isNaN(visit.getTime())) {
            return 'Enter a valid date.';
        }
        const today = getToday();
        if (visit < today) {
            return 'The visit date cannot be in the past.';
        }
        if (visit > addDays(today, BOOKING_WINDOW_DAYS)) {
            return 'Booking is possible up to ' + BOOKING_WINDOW_DAYS + ' days ahead.';
        }
        return '';
    }

    function makeOption(text, value) {
        return $('<option>').val(value).text(text);
    }

    return {
        BOOKING_WINDOW_DAYS: BOOKING_WINDOW_DAYS,
        DAY_NAMES: DAY_NAMES,
        showFieldError: showFieldError,
        clearFieldError: clearFieldError,
        clearFormErrors: clearFormErrors,
        validate: validate,
        clearErrorsWhileTyping: clearErrorsWhileTyping,
        showMessage: showMessage,
        hideMessage: hideMessage,
        scrollToBox: scrollToBox,
        visitDateError: visitDateError,
        makeOption: makeOption
    };
}(jQuery));
