'use strict';

/* RixFit — register.js
   register.html: registration form (front-end demonstration only), rewritten with jQuery
   (plain-JavaScript version: old-js-version.js, initRegisterForm).
   Needs: jQuery 4.0.0, main.js (checkEmail) and nuraly-common.js (RixFitUI) loaded before it.
   Passwords are never stored, printed, put into a URL or shown after the check. */

$(function () {
    const $form = $('#registerForm');
    if ($form.length === 0) {
        return;
    }

    const $errorBox = $('#register-error');
    const $confirmBox = $('#register-confirmation');
    const $username = $('#username');
    const $email = $('#email');
    const $password = $('#password');
    const $confirm = $('#confirmPassword');

    // The HTML keeps required and minlength as the first line of defence. novalidate (set here) only stops the
    // browser's single bubble so that every invalid field gets its own message. A check in the browser never
    // replaces a check on the server: JavaScript can be switched off or edited in DevTools, and a request can
    // be sent without a browser at all, so the real account rules must be checked again on the server.
    $form.prop('noValidate', true);

    // One entry per rule: the live checklist and the final check both use this array
    const PASSWORD_RULES = [
        { label: 'At least 8 characters', test: function (value) { return value.length >= 8; } },
        { label: 'An uppercase letter (A-Z)', test: function (value) { return /[A-Z]/.test(value); } },
        { label: 'A lowercase letter (a-z)', test: function (value) { return /[a-z]/.test(value); } },
        { label: 'A digit (0-9)', test: function (value) { return /\d/.test(value); } },
        { label: 'A special character (! ? # $ ...)', test: function (value) { return /[^A-Za-z0-9\s]/.test(value); } }
    ];

    function isStrongPassword(value) {
        return $.grep(PASSWORD_RULES, function (rule) { return !rule.test(value); }).length === 0;
    }

    /* FEATURE 3 of 3 — the live password checklist (a list built from an array) and the Show/Hide button.
       $.each + .append() + chained .toggleClass() replace PASSWORD_RULES.map, createEl, appendChild and two
       classList.toggle calls. The checklist and the hints are a little shorter and clearer (one chain instead of
       separate statements). The Show/Hide button is about the same length as before (.add() lets one .prop()
       change both fields), so there the gain is only the consistent style. */
    const $checklist = $('<ul>', { id: 'password-checklist', 'class': 'list-unstyled small mt-2' });
    const checklistItems = [];
    $.each(PASSWORD_RULES, function () {
        const $item = $('<li>').appendTo($checklist);
        checklistItems.push($item);
    });
    $password.after($checklist);

    const $matchHint = $('<p>', { id: 'confirm-hint', 'class': 'small mt-2 mb-0', 'aria-live': 'polite' });
    $confirm.after($matchHint);

    const $toggle = $('<button>', {
        type: 'button',
        'class': 'btn btn-outline-light btn-sm mt-2',
        'aria-pressed': 'false',
        'aria-controls': 'password confirmPassword'
    }).text('Show passwords');
    $matchHint.after($toggle);

    function renderChecklist() {
        const value = $password.val();
        $.each(PASSWORD_RULES, function (index, rule) {
            const passed = rule.test(value);
            checklistItems[index].text((passed ? '✓ ' : '✗ ') + rule.label)
                .toggleClass('text-success', passed)
                .toggleClass('text-secondary', !passed);
        });
    }

    function renderMatchHint() {
        if ($confirm.val() === '') {
            $matchHint.text('');
            return;
        }
        const matches = $confirm.val() === $password.val();
        $matchHint.text(matches ? '✓ Passwords match' : '✗ Passwords do not match')
            .toggleClass('text-success', matches)
            .toggleClass('text-secondary', !matches);
    }

    $password.on('input', function () {
        renderChecklist();
        renderMatchHint();
    });
    $confirm.on('input', renderMatchHint);

    $toggle.on('click', function () {
        const willShow = $password.prop('type') === 'password';
        // .add() joins both fields into one set, so one .prop() call changes them together
        $password.add($confirm).prop('type', willShow ? 'text' : 'password');
        $(this).text(willShow ? 'Hide passwords' : 'Show passwords').attr('aria-pressed', String(willShow));
    });

    /* ---------- Validation ---------- */

    function usernameError() {
        const value = $username.val().trim();
        return /^[\p{L}\d_.-]{3,}$/u.test(value) ? '' : 'At least 3 characters, only letters, digits and _ . -';
    }

    const rules = [
        { $field: $username, check: usernameError },
        { $field: $email, check: function () { return checkEmail($email.val()); } },
        {
            $field: $password,
            check: function () { return isStrongPassword($password.val()) ? '' : 'It must satisfy every point of the checklist below.'; },
            $anchor: $checklist
        },
        {
            $field: $confirm,
            check: function () {
                return $confirm.val() !== '' && $confirm.val() === $password.val() ? '' : 'It must exactly match the password.';
            },
            $anchor: $matchHint
        }
    ];

    RixFitUI.clearErrorsWhileTyping($form, rules);

    $form.on('submit', function (event) {
        // Without preventDefault() the browser would POST the form to "/api/register", which does not exist:
        // the visitor would land on an error page, and the password would travel in the request
        event.preventDefault();
        $confirmBox.empty();

        const failed = RixFitUI.validate(rules);
        if (failed.length > 0) {
            RixFitUI.showMessage($errorBox, 'error', 'Please fix ' + failed.length + ' field(s) marked above.');
            return;
        }

        $errorBox.empty();
        const username = $username.val().trim();

        $form.get(0).reset(); // the passwords are cleared at once and are never kept or shown
        RixFitUI.showMessage($confirmBox, 'success', 'Form for "' + username + '" is valid', [
            'Front-end demonstration only: no account was created, no data was sent and nobody was signed in.'
        ]);
        RixFitUI.scrollToBox($confirmBox);
    });

    $form.on('reset', function () {
        $errorBox.empty();
        $confirmBox.empty();
        RixFitUI.clearFormErrors($form);
        $password.add($confirm).prop('type', 'password');
        $toggle.text('Show passwords').attr('aria-pressed', 'false');
        setTimeout(function () {
            renderChecklist();
            renderMatchHint();
        }, 0);
    });

    renderChecklist();
});
