/* equipment.js - gym equipment page, written with jQuery. */

$(function () {
  'use strict';

  const equipmentCatalog = [
    { name: 'Treadmill', area: 'cardio', fact: '2 machines in the archived listing', tip: 'Start walking, then raise the speed gradually.' },
    { name: 'Exercise bike', area: 'cardio', fact: 'Listed as an available type', tip: 'Set the saddle at hip height.' },
    { name: 'Elliptical trainer', area: 'cardio', fact: 'Listed as an available type', tip: 'Keep your feet flat on the pedals.' },
    { name: 'Rowing machine', area: 'cardio', fact: 'Listed as an available type', tip: 'Push with the legs first, then pull with the arms.' },
    { name: 'Technogym machines', area: 'strength', fact: 'Listed as gym equipment', tip: 'Check the machine label and adjust the seat first.' },
    { name: 'Dumbbells and free weights', area: 'strength', fact: 'Listed as gym equipment', tip: 'Return dumbbells to the rack by weight.' },
    { name: 'Lifting platform', area: 'strength', fact: 'Listed as gym equipment', tip: 'Ask a trainer to spot heavy lifts.' },
    { name: 'Benches', area: 'strength', fact: 'Named in the equipment families list', tip: 'Use your own towel on the bench.' },
    { name: 'Swimming pool', area: 'pool', fact: 'Pool access included in the archived offer', tip: 'Shower first and wear a swim cap.', image: 'images/Pool.jpg', alt: 'The indoor pool at RixFit' }
  ];
  const areaLabels = { all: 'All', cardio: 'Cardio', strength: 'Strength', pool: 'Pool' };

  const passes = [
    { key: 'lose_weight', description: 'A gym visit with a trainer focused on fat loss.' },
    { key: 'gain_muscle', description: 'A gym visit with a trainer focused on strength and muscle.' },
    { key: 'pool_swimming', description: 'A pool visit with a swimming coach.' }
  ];

  let areaFilter = 'all';

  const $filters = $('#equipment-filters');
  const $search = $('#equipment-search');
  const $list = $('#equipment-list');
  const $empty = $('#equipment-empty');

  /* ---------- equipment ---------- */

  $.each(areaLabels, function (value, label) {
    $('<button>', { type: 'button', class: 'btn btn-sm ' + (value === 'all' ? 'btn-light' : 'btn-outline-light'), 'data-area': value, 'aria-pressed': String(value === 'all'), text: label }).appendTo($filters);
  });

  function createEquipmentCard(item) {
    const $body = $('<div>', { class: 'body' }).append(
      $('<span>', { class: 'badge-area', text: areaLabels[item.area] }),
      $('<h3>', { class: 'h5 mb-0', text: item.name }),
      $('<p>', { class: 'mb-0', text: item.tip }),
      $('<p>', { class: 'small text-white-50 mt-auto mb-0', text: item.fact })
    );
    const $card = $('<article>', { class: 'equip-card' });
    if (item.image) { $card.append($('<img>', { src: item.image, alt: item.alt, loading: 'lazy' })); }
    return $('<div>', { class: 'col-12 col-sm-6 col-lg-4' }).append($card.append($body));
  }

  function renderEquipment() {
    const query = $search.val().trim().toLowerCase();
    const matches = $.grep(equipmentCatalog, function (item) {
      return (areaFilter === 'all' || item.area === areaFilter) && (item.name + ' ' + item.tip).toLowerCase().indexOf(query) !== -1;
    });
    $list.empty();
    $.each(matches, function (index, item) { createEquipmentCard(item).appendTo($list); });
    $empty.toggleClass('hidden', matches.length > 0);
    $filters.children().each(function () {
      const active = $(this).attr('data-area') === areaFilter;
      $(this).toggleClass('btn-light', active).toggleClass('btn-outline-light', !active).attr('aria-pressed', String(active));
    });
  }

  $filters.on('click', 'button', function () {
    areaFilter = $(this).attr('data-area');
    renderEquipment();
  });
  $search.on('input', renderEquipment);
  $('#equipment-reset').on('click', function () {
    areaFilter = 'all';
    $search.val('');
    renderEquipment();
  });

  /* ---------- trainer sessions (cart) ---------- */

  $.each(passes, function (index, pass) {
    const service = $.grep(SERVICES, function (entry) { return entry.key === pass.key; })[0];
    const item = { id: service.key, name: service.label + ' session', price: service.price };
    $('<div>', { class: 'col-12 col-sm-6 col-xl-4' }).append(
      $('<article>', { class: 'panel-card pass-card' }).append(
        $('<h3>', { class: 'h5 mb-0', text: service.label }),
        $('<p>', { class: 'mb-0 flex-grow-1', text: pass.description }),
        $('<p>', { class: 'pass-price mb-0', text: formatPrice(service.price) }),
        $('<button>', { type: 'button', class: 'btn btn-primary', text: 'Add to cart', 'data-pass': service.key }).data('item', item)
      )
    ).appendTo('#pass-list');
  });

  $('#pass-list').on('click', 'button[data-pass]', function () {
    RixFitSite.addToCart($(this).data('item'));
  });

  /* ---------- sign-up right here ---------- */

  const $join = $('#join-panel');

  let renderedFor;

  function renderJoin() {
    const user = RixFitSite.getUser();
    const key = user ? user.id + user.name : '';
    if (key === renderedFor) { return; }
    renderedFor = key;
    $join.empty();
    if (user) {
      $join.append(
        $('<h3>', { class: 'h5', text: 'Hi, ' + user.name.split(' ')[0] + '!' }),
        $('<p>', { text: 'You are signed in. Add a session to your cart and place your order — no extra steps.' }),
        $('<div>', { class: 'd-flex flex-wrap gap-2' }).append(
          $('<button>', { type: 'button', class: 'btn btn-primary', 'data-open': 'cart', text: 'Open cart' }),
          $('<button>', { type: 'button', class: 'btn btn-outline-light', 'data-open': 'account', text: 'My account' })
        )
      );
      return;
    }
    const $auth = $('<div>');
    $join.append(
      $('<h3>', { class: 'h5', text: 'Create your account' }),
      $('<p>', { class: 'small text-white-50', text: 'Sign up here to order sessions and post reviews under your name.' }),
      $auth
    );
    RixFitSite.mountAuth($auth, {});
  }

  $join.on('click', 'button[data-open]', function () {
    if ($(this).attr('data-open') === 'cart') { RixFitSite.openCart(); } else { RixFitSite.openAccount(); }
  });

  RixFitSite.onChange(renderJoin);
  renderJoin();
  renderEquipment();
});
