/* site.js - shared account and cart for the Reviews and Gym Equipment pages.
   Needs jQuery, Bootstrap, main.js and jq-helpers.js loaded before it. */

const RixFitSite = (function () {
  'use strict';

  const USERS_KEY = 'rixfit-users';
  const SESSION_KEY = 'rixfit-session';
  const CART_KEY = 'rixfit-cart';
  const ORDERS_KEY = 'rixfit-orders';
  const REVIEWS_KEY = 'rixfit-reviews';

  let users = loadFromStorage(USERS_KEY, []);
  let sessionEmail = loadFromStorage(SESSION_KEY, null);
  let cart = loadFromStorage(CART_KEY, []);
  let orders = loadFromStorage(ORDERS_KEY, []);
  const listeners = [];
  let fieldCounter = 0;
  let cartView = 'items';
  let lastOrder = null;

  const checks = {
    name: function (value) { return checkPersonName(value, 'name'); },
    email: function (value) { return checkEmail(value); },
    phone: function (value) { return checkKzPhone(value, false); },
    password: function (value) {
      if (value.length < 8) { return 'Use at least 8 characters.'; }
      if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) { return 'Include at least one letter and one digit.'; }
      return '';
    },
    loginPassword: function (value) { return value === '' ? 'Enter your password.' : ''; }
  };

  /* ---------- data ---------- */

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);
    if (window.crypto && window.crypto.subtle) {
      const buffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buffer)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    let hash = 5381;
    for (let i = 0; i < data.length; i += 1) { hash = ((hash << 5) + hash + data[i]) | 0; }
    return 'x' + hash;
  }

  function getUser() {
    if (sessionEmail === null) { return null; }
    return $.grep(users, function (user) { return user.email === sessionEmail; })[0] || null;
  }

  function notify() {
    renderHeader();
    renderCartPanel();
    renderAccountPanel();
    $.each(listeners, function (index, callback) { callback(getUser()); });
  }

  function onChange(callback) {
    listeners.push(callback);
  }

  function signIn(email) {
    sessionEmail = email;
    saveToStorage(SESSION_KEY, sessionEmail);
    notify();
  }

  function signOut() {
    sessionEmail = null;
    saveToStorage(SESSION_KEY, null);
    cartView = 'items';
    notify();
  }

  function cartCount() {
    let count = 0;
    $.each(cart, function (index, line) { count += line.qty; });
    return count;
  }

  function cartTotal() {
    let total = 0;
    $.each(cart, function (index, line) { total += line.qty * line.price; });
    return total;
  }

  function saveCart() {
    saveToStorage(CART_KEY, cart);
    notify();
  }

  function addToCart(item) {
    const line = $.grep(cart, function (entry) { return entry.id === item.id; })[0];
    if (line) {
      line.qty = Math.min(line.qty + 1, 20);
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    }
    cartView = 'items';
    saveCart();
    toast(item.name + ' added to your cart.');
  }

  /* ---------- toast ---------- */

  let toastTimer = null;
  const $toast = $('<div>', { id: 'site-toast', class: 'site-toast', role: 'status', 'aria-live': 'polite' }).appendTo('body');

  function toast(message) {
    clearTimeout(toastTimer);
    $toast.text(message).addClass('show');
    toastTimer = setTimeout(function () { $toast.removeClass('show'); }, 3500);
  }

  /* ---------- header ---------- */

  const $cartBadge = $('#cart-badge');

  function renderHeader() {
    const user = getUser();
    $('#nav-signin-item, #nav-signup-item').toggleClass('hidden', user !== null);
    $('#nav-account').text(user ? user.name.split(' ')[0] : 'My account');
    const count = cartCount();
    $cartBadge.text(count).toggleClass('hidden', count === 0);
  }

  /* ---------- auth forms (used in the account panel, the cart and inline on pages) ---------- */

  function buildField(prefix, key, label, attrs) {
    const id = prefix + key;
    const $input = $('<input>', $.extend({ id: id, class: 'form-control', 'data-check': key }, attrs));
    return {
      $input: $input,
      $group: $('<div>', { class: 'mb-3' }).append($('<label>', { class: 'form-label', for: id, text: label }), $input)
    };
  }

  function buildPasswordToggle(prefix, $inputs) {
    const id = prefix + 'show';
    const $box = $('<input>', { type: 'checkbox', class: 'form-check-input', id: id });
    $box.on('change', function () {
      $.each($inputs, function (index, $input) { $input.attr('type', $box.prop('checked') ? 'text' : 'password'); });
    });
    return $('<div>', { class: 'form-check mb-3' }).append($box, $('<label>', { class: 'form-check-label', for: id, text: 'Show password' }));
  }

  function bindLiveValidation($form) {
    $form.on('focusout', 'input[data-check]', function () {
      const $field = $(this);
      if ($field.val() === '') { return; }
      const message = checks[$field.attr('data-check')]($field.val());
      if (message !== '') { jqShowFieldError($field, message); } else { jqMarkFieldValid($field); }
    });
    $form.on('input', 'input[data-check]', function () {
      const $field = $(this);
      if ($field.hasClass('error')) {
        const message = checks[$field.attr('data-check')]($field.val());
        if (message === '') { jqMarkFieldValid($field); }
      }
    });
  }

  function mountAuth($host, options) {
    options = options || {};
    fieldCounter += 1;
    const prefix = 'auth' + fieldCounter + '-';

    const $modeUp = $('<button>', { type: 'button', class: 'btn btn-sm', text: 'Create account' });
    const $modeIn = $('<button>', { type: 'button', class: 'btn btn-sm', text: 'Sign in' });
    const $modes = $('<div>', { class: 'btn-group w-100 mb-3', role: 'group', 'aria-label': 'Account options' }).append($modeUp, $modeIn);

    /* create account */
    const up = {
      name: buildField(prefix + 'up-', 'name', 'Name', { type: 'text', autocomplete: 'name', maxlength: 80 }),
      email: buildField(prefix + 'up-', 'email', 'Email', { type: 'email', autocomplete: 'email', maxlength: 254, placeholder: 'name@example.com' }),
      phone: buildField(prefix + 'up-', 'phone', 'Phone (optional)', { type: 'tel', autocomplete: 'tel', maxlength: 30, placeholder: '+7 700 000 00 00' }),
      password: buildField(prefix + 'up-', 'password', 'Password', { type: 'password', autocomplete: 'new-password', maxlength: 100 })
    };
    up.password.$group.append($('<p>', { class: 'small text-white-50 mb-0 mt-1', text: 'At least 8 characters, with a letter and a digit.' }));
    const $up = $('<form>', { class: 'auth-form', novalidate: true }).append(
      up.name.$group, up.email.$group, up.phone.$group, up.password.$group,
      buildPasswordToggle(prefix + 'up-', [up.password.$input]),
      $('<button>', { type: 'submit', class: 'btn btn-primary w-100', text: 'Create account' })
    );

    /* sign in */
    const inn = {
      email: buildField(prefix + 'in-', 'email', 'Email', { type: 'email', autocomplete: 'email', maxlength: 254 }),
      password: buildField(prefix + 'in-', 'loginPassword', 'Password', { type: 'password', autocomplete: 'current-password', maxlength: 100 })
    };
    const $in = $('<form>', { class: 'auth-form hidden', novalidate: true }).append(
      inn.email.$group, inn.password.$group,
      buildPasswordToggle(prefix + 'in-', [inn.password.$input]),
      $('<button>', { type: 'submit', class: 'btn btn-primary w-100', text: 'Sign in' })
    );

    function setMode(mode) {
      const signup = mode === 'up';
      $up.toggleClass('hidden', !signup);
      $in.toggleClass('hidden', signup);
      $modeUp.toggleClass('btn-light', signup).toggleClass('btn-outline-light', !signup).attr('aria-pressed', String(signup));
      $modeIn.toggleClass('btn-light', !signup).toggleClass('btn-outline-light', signup).attr('aria-pressed', String(!signup));
    }
    $modeUp.on('click', function () { setMode('up'); });
    $modeIn.on('click', function () { setMode('in'); });
    setMode(options.mode === 'in' ? 'in' : 'up');

    bindLiveValidation($up);
    bindLiveValidation($in);

    $up.on('submit', async function (event) {
      event.preventDefault();
      const errors = jqValidateFields([
        { $field: up.name.$input, check: function () { return checks.name(up.name.$input.val()); } },
        { $field: up.email.$input, check: function () { return checks.email(up.email.$input.val()); } },
        { $field: up.phone.$input, check: function () { return checks.phone(up.phone.$input.val()); } },
        { $field: up.password.$input, check: function () { return checks.password(up.password.$input.val()); } }
      ]);
      if (errors.length > 0) { return; }

      const email = up.email.$input.val().trim().toLowerCase();
      if ($.grep(users, function (user) { return user.email === email; }).length > 0) {
        jqShowFieldError(up.email.$input, 'An account with this email already exists. Choose Sign in.');
        up.email.$input.trigger('focus');
        return;
      }
      const salt = uid();
      const user = {
        id: uid(),
        name: up.name.$input.val().trim(),
        email: email,
        phone: up.phone.$input.val().trim(),
        salt: salt,
        hash: await hashPassword(up.password.$input.val(), salt),
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveToStorage(USERS_KEY, users);
      $up[0].reset();
      jqClearFormState($up);
      signIn(email);
      toast('Welcome to RixFit, ' + user.name.split(' ')[0] + '!');
      if (options.onSuccess) { options.onSuccess(user); }
    });

    $in.on('submit', async function (event) {
      event.preventDefault();
      const errors = jqValidateFields([
        { $field: inn.email.$input, check: function () { return checks.email(inn.email.$input.val()); } },
        { $field: inn.password.$input, check: function () { return checks.loginPassword(inn.password.$input.val()); } }
      ]);
      if (errors.length > 0) { return; }

      const email = inn.email.$input.val().trim().toLowerCase();
      const user = $.grep(users, function (entry) { return entry.email === email; })[0];
      if (!user) {
        jqShowFieldError(inn.email.$input, 'No account with this email. Choose Create account.');
        inn.email.$input.trigger('focus');
        return;
      }
      if (await hashPassword(inn.password.$input.val(), user.salt) !== user.hash) {
        jqShowFieldError(inn.password.$input, 'Incorrect password.');
        inn.password.$input.trigger('focus');
        return;
      }
      $in[0].reset();
      jqClearFormState($in);
      signIn(email);
      toast('Welcome back, ' + user.name.split(' ')[0] + '!');
      if (options.onSuccess) { options.onSuccess(user); }
    });

    $host.empty().append($modes, $up, $in);
  }

  /* ---------- panels ---------- */

  function createPanel(id, title) {
    const $body = $('<div>', { class: 'offcanvas-body', id: id + '-body' });
    const $panel = $('<div>', { class: 'offcanvas offcanvas-end', id: id, tabindex: '-1', 'aria-labelledby': id + '-title', 'data-bs-theme': 'dark' }).append(
      $('<div>', { class: 'offcanvas-header' }).append(
        $('<h2>', { class: 'offcanvas-title h4', id: id + '-title', text: title }),
        $('<button>', { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'offcanvas', 'aria-label': 'Close' })
      ),
      $body
    ).appendTo('body');
    return { $panel: $panel, $body: $body, offcanvas: new bootstrap.Offcanvas($panel[0]) };
  }

  const cartPanel = createPanel('cart-panel', 'Your cart');
  const accountPanel = createPanel('account-panel', 'Account');

  function showPanel(panel) {
    panel.offcanvas.show();
  }

  /* cart */

  function renderCartPanel() {
    const $body = cartPanel.$body.empty();
    const user = getUser();

    if (cartView === 'done' && lastOrder) {
      $body.append(
        $('<div>', { class: 'success-box' }).append(
          $('<h3>', { class: 'h5', text: 'Order #' + lastOrder.number + ' placed' }),
          $('<p>', { class: 'mb-2', text: 'Thank you, ' + lastOrder.name.split(' ')[0] + '! ' + formatPrice(lastOrder.total) + ' to pay at the club reception. A confirmation was saved in your account.' })
        ),
        $('<button>', { type: 'button', class: 'btn btn-outline-light', text: 'Continue browsing', 'data-bs-dismiss': 'offcanvas' })
      );
      return;
    }

    if (cart.length === 0) {
      $body.append(
        $('<p>', { class: 'text-white-50', text: 'Your cart is empty.' }),
        $('<button>', { type: 'button', class: 'btn btn-outline-light', text: 'Back to the page', 'data-bs-dismiss': 'offcanvas' })
      );
      return;
    }

    const $list = $('<ul>', { class: 'list-unstyled cart-lines' });
    $.each(cart, function (index, line) {
      $('<li>', { class: 'cart-line' }).append(
        $('<div>', { class: 'flex-grow-1' }).append(
          $('<p>', { class: 'mb-0 fw-bold', text: line.name }),
          $('<p>', { class: 'mb-0 small text-white-50', text: formatPrice(line.price) + ' each' })
        ),
        $('<div>', { class: 'qty', role: 'group', 'aria-label': 'Quantity for ' + line.name }).append(
          $('<button>', { type: 'button', class: 'btn btn-outline-light btn-sm', 'data-qty': -1, 'data-id': line.id, 'aria-label': 'Decrease', text: '−' }),
          $('<span>', { class: 'qty-value', text: line.qty }),
          $('<button>', { type: 'button', class: 'btn btn-outline-light btn-sm', 'data-qty': 1, 'data-id': line.id, 'aria-label': 'Increase', text: '+' })
        ),
        $('<p>', { class: 'mb-0 line-total', text: formatPrice(line.qty * line.price) })
      ).appendTo($list);
    });
    $body.append($list, $('<p>', { class: 'cart-total d-flex justify-content-between fw-bold' }).append($('<span>', { text: 'Total' }), $('<span>', { text: formatPrice(cartTotal()) })));

    if (!user) {
      if (cartView === 'auth') {
        const $auth = $('<div>', { class: 'panel-card' });
        $body.append($('<h3>', { class: 'h5', text: 'Almost there — create an account' }), $('<p>', { class: 'small', text: 'It takes a few seconds and keeps your orders and reviews in one place.' }), $auth);
        mountAuth($auth, { onSuccess: function () { cartView = 'items'; renderCartPanel(); } });
      } else {
        $body.append($('<button>', { type: 'button', class: 'btn btn-primary w-100', 'data-action': 'checkout', text: 'Checkout' }));
      }
    } else {
      $body.append(
        $('<p>', { class: 'small text-white-50 mb-3', text: 'Ordering as ' + user.name + ' (' + user.email + ')' }),
        $('<button>', { type: 'button', class: 'btn btn-primary w-100', 'data-action': 'place', text: 'Place order · ' + formatPrice(cartTotal()) })
      );
    }
  }

  cartPanel.$body.on('click', 'button[data-qty]', function () {
    const id = $(this).attr('data-id');
    const delta = Number($(this).attr('data-qty'));
    const line = $.grep(cart, function (entry) { return entry.id === id; })[0];
    line.qty = Math.min(line.qty + delta, 20);
    if (line.qty <= 0) { cart = $.grep(cart, function (entry) { return entry.id !== id; }); }
    saveCart();
  });

  cartPanel.$body.on('click', 'button[data-action]', function () {
    if ($(this).attr('data-action') === 'checkout') {
      cartView = 'auth';
      renderCartPanel();
      cartPanel.$body.find('input').first().trigger('focus');
      return;
    }
    const user = getUser();
    lastOrder = { number: String(generateRefNumber()), email: user.email, name: user.name, items: cart.slice(), total: cartTotal(), createdAt: new Date().toISOString() };
    orders.push(lastOrder);
    saveToStorage(ORDERS_KEY, orders);
    cart = [];
    cartView = 'done';
    saveCart();
  });

  /* account */

  let accountMode = 'up';

  function renderAccountPanel() {
    const $body = accountPanel.$body.empty();
    const user = getUser();

    if (!user) {
      const $auth = $('<div>');
      $body.append($('<p>', { class: 'text-white-50', text: 'Create an account to keep your orders and reviews together.' }), $auth);
      mountAuth($auth, { mode: accountMode, onSuccess: function () { accountPanel.offcanvas.hide(); } });
      return;
    }

    const myOrders = $.grep(orders, function (order) { return order.email === user.email; });
    const myReviews = $.grep(loadFromStorage(REVIEWS_KEY, []), function (review) { return review.userEmail === user.email; });

    fieldCounter += 1;
    const prefix = 'profile' + fieldCounter + '-';
    const name = buildField(prefix, 'name', 'Name', { type: 'text', maxlength: 80, value: user.name, autocomplete: 'name' });
    const phone = buildField(prefix, 'phone', 'Phone', { type: 'tel', maxlength: 30, value: user.phone, autocomplete: 'tel' });
    const $form = $('<form>', { novalidate: true }).append(
      name.$group,
      $('<div>', { class: 'mb-3' }).append($('<p>', { class: 'form-label mb-1', text: 'Email' }), $('<p>', { class: 'mb-0 text-white-50', text: user.email })),
      phone.$group,
      $('<button>', { type: 'submit', class: 'btn btn-primary', text: 'Save changes' })
    );
    bindLiveValidation($form);
    $form.on('submit', function (event) {
      event.preventDefault();
      const errors = jqValidateFields([
        { $field: name.$input, check: function () { return checks.name(name.$input.val()); } },
        { $field: phone.$input, check: function () { return checks.phone(phone.$input.val()); } }
      ]);
      if (errors.length > 0) { return; }
      user.name = name.$input.val().trim();
      user.phone = phone.$input.val().trim();
      saveToStorage(USERS_KEY, users);
      notify();
      toast('Your details were saved.');
    });

    const $stats = $('<div>', { class: 'row g-2 mb-4' }).append(
      $('<div>', { class: 'col-6' }).append($('<div>', { class: 'panel-card text-center' }).append($('<p>', { class: 'h3 mb-0', text: myOrders.length }), $('<p>', { class: 'small mb-0', text: 'Orders' }))),
      $('<div>', { class: 'col-6' }).append($('<div>', { class: 'panel-card text-center' }).append($('<p>', { class: 'h3 mb-0', text: myReviews.length }), $('<p>', { class: 'small mb-0', text: 'Reviews' })))
    );

    $body.append($('<p>', { class: 'mb-3' }).append('Signed in as ', $('<strong>', { text: user.name })), $stats, $('<h3>', { class: 'h5', text: 'Your details' }), $form);

    if (myOrders.length > 0) {
      const $orders = $('<ul>', { class: 'list-unstyled mb-0' });
      $.each(myOrders.slice(-3).reverse(), function (index, order) {
        $('<li>', { class: 'd-flex justify-content-between small py-1 border-bottom border-secondary' }).append(
          $('<span>', { text: '#' + order.number + ' · ' + formatDateTime(order.createdAt) }),
          $('<span>', { text: formatPrice(order.total) })
        ).appendTo($orders);
      });
      $body.append($('<h3>', { class: 'h5 mt-4', text: 'Recent orders' }), $orders);
    }

    $body.append($('<button>', { type: 'button', class: 'btn btn-outline-light mt-4', 'data-action': 'signout', text: 'Sign out' }));
  }

  accountPanel.$body.on('click', 'button[data-action="signout"]', function () {
    signOut();
    toast('You have been signed out.');
  });

  $('#cart-button').on('click', function () { showPanel(cartPanel); });
  function openAccount(mode) {
    accountMode = mode || 'up';
    renderAccountPanel();
    showPanel(accountPanel);
  }
  $('#nav-signin').on('click', function (event) { event.preventDefault(); openAccount('in'); });
  $('#nav-signup').on('click', function (event) { event.preventDefault(); openAccount('up'); });
  $('#nav-account').on('click', function (event) { event.preventDefault(); openAccount(getUser() ? 'up' : 'in'); });

  notify();

  return {
    addToCart: addToCart,
    getUser: getUser,
    onChange: onChange,
    mountAuth: mountAuth,
    openCart: function () { showPanel(cartPanel); },
    openAccount: openAccount,
    toast: toast
  };
}());
