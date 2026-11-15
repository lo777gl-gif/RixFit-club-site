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

  RixFitSite.mountTerms($('#terms-list'), [
    { question: 'Cardio', answer: 'Exercise that keeps the body moving continuously to train endurance.' },
    { question: 'Resistance', answer: 'The load that the muscles work against, such as a plate, cable or dumbbell.' },
    { question: 'Range of motion (ROM)', answer: 'The controlled distance a joint travels during an exercise.' },
    { question: 'Sets and reps (3 × 10)', answer: 'A plan written as 3 × 10 means three sets of ten repetitions, with a short rest between sets.' }
  ]);

  RixFitSite.mountFaq([
    {
      question: 'Do I need experience to use the equipment?',
      answer: 'No. Follow the steps in <strong>Before your first set</strong> and ask a trainer to show you the setup of any unfamiliar machine.'
    },
    {
      question: 'What equipment does the club have?',
      answer: 'Cardio machines (treadmills, bikes, ellipticals, rowing), strength equipment (Technogym machines, dumbbells, platform, benches) and a swimming pool. The list is based on an archived 2024 offer, so ask the club about current availability.'
    },
    {
      question: 'Can a trainer show me how to train?',
      answer: 'Yes. Send an application with the <strong>Booking form</strong> on the <a href="index.html#booking">main page</a> and choose Weight Loss or Muscle Gain with a coach.'
    },
    {
      question: 'What should I bring?',
      answer: 'Clean sports shoes and your own towel for the gym. For the pool bring swimwear and a swim cap, and shower first. Details are in the <a href="rules.html">club rules</a>.'
    },
    {
      question: 'How do I try the club before buying a pass?',
      answer: 'Use the <a href="index.html#booking">Booking form</a> on the main page or call <a href="tel:+77754385471">+7 775 438 54 71</a>. The club tells you the time to come by email or phone.'
    },
    {
      question: 'When is the club open?',
      answer: 'Workdays from <strong>07:00 to 23:00</strong>, weekends from <strong>09:00 to 22:00</strong>.'
    }
  ], 4);

  renderEquipment();
});
