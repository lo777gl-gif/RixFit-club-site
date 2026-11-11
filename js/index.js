'use strict';

$(function () {
    const MAX_GUESTS = 4;
    const $form = $('#booking-form');
    if ($form.length === 0) {
        return;
    }

    const $errorBox = $('#booking-error');
    const $confirmBox = $('#booking-confirmation');
    const $service = $('#service');
    const $trainer = $('#trainer');
    const $trainerColumn = $trainer.closest('.col-md-6');

    function buildField(id, label, type) {
        return $('<div>', { 'class': 'col-md-6' }).append(
            $('<label>', { 'class': 'form-label', 'for': id }).text(label),
            $('<input>', { 'class': 'form-control', id: id, name: id, type: type })
        );
    }

    const $guestsColumn = buildField('guests', 'Guests (1-' + MAX_GUESTS + '):', 'number');
    $guestsColumn.find('input').attr({ min: 1, max: MAX_GUESTS, value: 1 });
    $('#comments').closest('.col-12').before($guestsColumn);

    const $guests = $('#guests');
    const $summary = $('<div>', { id: 'booking-summary', 'class': 'alert alert-secondary mt-3' });
    $('#btn-submit').parent().before($summary);

    function fillTrainerOptions(service, animate) {
        const needsTrainer = Boolean(service) && service.needsTrainer;
        const showColumn = !service || service.needsTrainer;

        $trainer.empty().append(RixFitUI.makeOption('- Choose trainer -', 'none'));
        $trainer.prop('disabled', !needsTrainer);

        if (needsTrainer) {
            $.each(TRAINERS, function (_, trainer) {
                if (trainer.area === service.area) {
                    $trainer.append(RixFitUI.makeOption(trainer.name, trainer.id));
                }
            });
        }

        $trainerColumn.stop(true, true);
        if (!animate) {
            $trainerColumn.toggle(showColumn);
        } else if (showColumn) {
            $trainerColumn.slideDown(200);
        } else {
            $trainerColumn.slideUp(200);
        }
    }

    function getService(key) {
        return $.grep(SERVICES, function (service) {
            return service.key === key;
        })[0];
    }

    function getTrainer(id) {
        return $.grep(TRAINERS, function (trainer) {
            return trainer.id === id;
        })[0];
    }

    function readBookingData() {
        // Attribute selector + the :checked filter: the radio button that is selected right now
        const $gender = $form.find('input[name="gender"]:checked');
        return {
            name: $('#userName').val().trim(),
            email: $('#userEmail').val().trim(),
            phone: $('#userPhone').val().trim(),
            age: $('#age').val().trim(),
            gender: $gender.length > 0 ? $gender.val() : '',
            service: getService($service.val()),
            trainerId: $trainer.val(),
            guests: Number($guests.val()),
            // .prop() reads the CURRENT state of the checkbox; .attr('checked') would only show the
            // initial attribute from the HTML and stay the same after the visitor clicks
            agreed: $('#agree').prop('checked')
        };
    }

    function guestsAreValid(guests) {
        return Number.isInteger(guests) && guests >= 1 && guests <= MAX_GUESTS;
    }

    function ageError(data) {
        const age = Number(data.age);
        if (data.age === '' || !Number.isInteger(age) || age < 12 || age > 90) {
            return 'Enter a whole number from 12 to 90 (younger visitors are not admitted).';
        }
        // Rule that combines two fields: the minimum age of the chosen service vs the visitor's age
        if (data.service && age < data.service.minAge) {
            return data.service.label + ' is available from ' + data.service.minAge + ' years.';
        }
        return '';
    }

    // One rule per field: check() returns '' when the value is fine, or the message for that field
    const rules = [
        { $field: $('#userName'), check: function () { return checkPersonName(readBookingData().name, 'name'); } },
        { $field: $('#userEmail'), check: function () { return checkEmail(readBookingData().email); } },
        { $field: $('#userPhone'), check: function () { return checkPhone(readBookingData().phone, true); } },
        { $field: $('#age'), check: function () { return ageError(readBookingData()); } },
        {
            $field: $form.find('input[name="gender"]').first(),
            check: function () { return readBookingData().gender === '' ? 'Choose one of the variants.' : ''; }
        },
        {
            $field: $service,
            check: function () { return readBookingData().service ? '' : 'Please select a training direction or service.'; }
        },
        {
            $field: $trainer,
            check: function () {
                const data = readBookingData();
                const missing = data.trainerId === '' || data.trainerId === 'none';
                return data.service && data.service.needsTrainer && missing ? 'Please select an available coach for this service.' : '';
            }
        },
        {
            $field: $guests,
            check: function () { return guestsAreValid(readBookingData().guests) ? '' : 'Choose from 1 to ' + MAX_GUESTS + ' people.'; }
        },
        {
            $field: $('#agree'),
            check: function () { return readBookingData().agreed ? '' : 'You must agree with the club rules.'; }
        }
    ];

    function renderSummary() {
        const data = readBookingData();
        $summary.empty().append($('<strong>').text('Booking summary'));

        if (!data.service) {
            $summary.append($('<p>', { 'class': 'mb-0 mt-1' }).text('Choose a service to see your estimate.'));
            return;
        }

        const trainer = getTrainer(data.trainerId);
        let coachText = 'not required';
        if (data.service.needsTrainer) {
            coachText = trainer ? trainer.name : 'not chosen yet';
        }
        const validGuests = guestsAreValid(data.guests);
        const lines = [
            'Service: ' + data.service.label,
            'Coach: ' + coachText,
            'Guests: ' + (validGuests ? data.guests : 'enter 1-' + MAX_GUESTS),
            'Estimated total: ' + (validGuests ? formatPrice(data.service.price * data.guests) : '-')
        ];
        $.each(lines, function (_, line) {
            $summary.append($('<p>', { 'class': 'mb-1 mt-1' }).text(line));
        });
        $summary.append($('<small>', { 'class': 'd-block text-muted' }).text('Estimate only: the final price is confirmed by the club.'));
    }


    $service.on('change', function () {
        fillTrainerOptions(getService($(this).val()), true);
    });

    // "input" fires on every keystroke, "change" on selects, radios and checkboxes: one handler for both
    $form.on('input change', renderSummary);
    RixFitUI.clearErrorsWhileTyping($form, rules);

    function showMaxGuestsError() {
        RixFitUI.showFieldError($guests, 'The maximum is ' + MAX_GUESTS + ' guests per booking.');
    }

    $guests.on('keydown', function (event) {
        if (event.key === 'ArrowUp' && Number($(this).val()) >= MAX_GUESTS) {
            showMaxGuestsError();
        }
    });

    $guests.on('mousedown', function (event) {
        const box = this.getBoundingClientRect();
        const onSpinner = event.clientX > box.right - 30;
        const onUpArrow = event.clientY < box.top + box.height / 2;
        if (onSpinner && onUpArrow && Number($(this).val()) >= MAX_GUESTS) {
            showMaxGuestsError();
        }
    });

    // Leaving the field with a valid number removes the leftover message
    $guests.on('blur', function () {
        if (guestsAreValid(Number($(this).val()))) {
            RixFitUI.clearFieldError($(this), true);
        }
    });

    
    $form.on('submit', function (event) {
        // Without preventDefault() the browser would send the form: the page would reload (action="#" with
        // method GET adds the field values to the address) and every message below would disappear at once
        event.preventDefault();
        $confirmBox.empty();

        const failed = RixFitUI.validate(rules);
        if (failed.length > 0) {
            RixFitUI.showMessage($errorBox, 'error', 'Please fix ' + failed.length + ' field(s) marked above and send the form again.');
            return;
        }

        $errorBox.empty();
        const data = readBookingData();
        const trainer = getTrainer(data.trainerId);
        const lines = [
            'Client: ' + data.name + ' | Guests: ' + data.guests,
            'Service: ' + data.service.label + ' | Coach: ' + (data.service.needsTrainer ? trainer.name : 'not required'),
            'Estimated total: ' + formatPrice(data.service.price * data.guests),
            'Demo mode: no data was sent to a server. No real booking, payment or order was created.'
        ];

        // Reset first (its handler clears both boxes), then show the confirmation built from the saved data
        $form.get(0).reset();
        RixFitUI.showMessage($confirmBox, 'success', 'Request #' + generateRefNumber() + ' received!', lines);
        RixFitUI.scrollToBox($confirmBox);
    });

    $form.on('reset', function () {
        $errorBox.empty();
        $confirmBox.empty();
        RixFitUI.clearFormErrors($form);
        // The browser restores the field values after the reset event, so refresh the dependent parts afterwards
        setTimeout(function () {
            fillTrainerOptions(undefined, false);
            renderSummary();
        }, 0);
    });

    fillTrainerOptions(undefined, false);
    renderSummary();
});