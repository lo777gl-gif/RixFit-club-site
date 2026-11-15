/* login.js - login form, plain JavaScript (no jQuery on this page).
   Needs main.js (checkEmail, showFieldError, validateFields, showMessage, createElement)
   loaded before it. There is no server, so a correct form only proves the values have
   the right shape: nobody is signed in and the password is never stored or shown. */

onReady(function () {
    const form = document.getElementById('loginForm');
    if (form === null) {
        return;
    }

    const message = document.getElementById('message');
    const identifier = document.getElementById('loginIdentifier');
    const password = document.getElementById('password');
    const submitButton = form.querySelector('button[type="submit"]');

    const USERNAME_PATTERN = /^[\p{L}\d_.-]{3,}$/u;
    const PASSWORD_MIN_LENGTH = 6;
    const MAX_FAILED_ATTEMPTS = 3;
    let failedAttempts = 0;

    // The HTML keeps required/minlength; novalidate lets our own per-field messages replace the browser bubble
    form.noValidate = true;

    // Returns '' when the value is fine, otherwise the message for the field.
    // A value with "@" is treated as an email, anything else as a username.
    function checkIdentifier(value) {
        const text = value.trim();
        if (text === '') {
            return 'Enter your username or email.';
        }
        if (text.includes('@')) {
            return checkEmail(text);
        }
        return USERNAME_PATTERN.test(text) ? '' : 'A username has at least 3 characters: letters, digits and _ . -';
    }

    function checkPassword(value) {
        if (value === '') {
            return 'Enter your password.';
        }
        return value.length >= PASSWORD_MIN_LENGTH ? '' : 'The password has at least ' + PASSWORD_MIN_LENGTH + ' characters.';
    }

    function showResult(type, title, lines) {
        message.classList.remove('d-none');
        showMessage(message, type, title, lines);
    }

    function hideResult() {
        message.classList.add('d-none');
        hideMessage(message);
    }

    // Show/hide password button, created in code
    const toggle = createElement('button', 'btn btn-outline-light btn-sm mb-3 d-block', 'Show password');
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-controls', 'password');
    password.insertAdjacentElement('afterend', toggle);

    toggle.addEventListener('click', function () {
        const willShow = password.type === 'password';
        password.type = willShow ? 'text' : 'password';
        toggle.textContent = willShow ? 'Hide password' : 'Show password';
        toggle.setAttribute('aria-pressed', String(willShow));
    });

    form.addEventListener('submit', function (event) {
        // Without preventDefault() the browser would POST to "/api/login", which does not exist
        event.preventDefault();
        hideResult();

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            showResult('error', 'Too many invalid attempts.', ['Reload the page to try again.']);
            return;
        }

        const errors = validateFields([
            { field: identifier, check: function () { return checkIdentifier(identifier.value); } },
            { field: password, check: function () { return checkPassword(password.value); } }
        ]);

        if (errors.length > 0) {
            failedAttempts += 1;
            const left = MAX_FAILED_ATTEMPTS - failedAttempts;
            showResult('error', 'Please fix ' + errors.length + ' field(s) marked above.',
                left > 0 ? [left + ' attempt(s) left before the form locks.'] : ['The form is now locked.']);
            if (left === 0) {
                submitButton.disabled = true;
            }
            return;
        }

        const name = identifier.value.trim();
        form.reset(); // the password is cleared at once
        password.type = 'password';
        toggle.textContent = 'Show password';
        toggle.setAttribute('aria-pressed', 'false');
        clearFormErrors(form);
        showResult('success', 'Form for "' + name + '" is valid', [
            'Front-end demonstration only: no server checked the password and nobody was signed in.'
        ]);
    });

    // Clear a field's error as soon as the visitor edits it (delegated to the form)
    form.addEventListener('input', function (event) {
        if (event.target.matches('input')) {
            clearFieldError(event.target);
        }
    });
});
