/* jq-helpers.js - jQuery versions of the form helpers used by the equipment,
   reviews and account pages.
   jQuery 4.0.0 from the CDN must be linked BEFORE this file, because every
   function here calls $(). main.js still supplies the pure value checks
   (checkEmail, checkPhone, checkPersonName ...), which do not touch the DOM. */

/* Builds { $wrapper, $control } : a label + select/input pair, created in code. */
function jqLabeledControl(tagName, id, labelText, wrapperClasses) {
  const $control = $('<' + tagName + '>', {
    id: id,
    class: tagName === 'select' ? 'form-select' : 'form-control'
  });
  const $label = $('<label>', { class: 'form-label', for: id, text: labelText });
  const $wrapper = $('<div>', { class: wrapperClasses }).append($label, $control);
  return { $wrapper: $wrapper, $control: $control };
}

function jqAddOptions($select, options) {
  $.each(options, function (index, option) {
    $('<option>', { value: option.value, text: option.label }).appendTo($select);
  });
}

/* ---------- field-level errors (a message next to each invalid field) ---------- */

function jqErrorId($field) {
  return ($field.attr('id') || $field.attr('name')) + '-error';
}

function jqShowFieldError($field, message) {
  const errorId = jqErrorId($field);
  let $error = $('#' + errorId);
  if ($error.length === 0) {
    $error = $('<p>', { id: errorId, class: 'error small mb-0 hidden' });
    // Radios and checkboxes: put the message after the whole group, not between the options
    const $anchor = $field.is(':radio, :checkbox')
      ? $field.closest('.form-check').parent().children().last()
      : $field;
    $anchor.after($error);
  }
  $error.text('Error: ' + message).removeClass('hidden');
  $field.removeClass('success').addClass('error').attr('aria-invalid', 'true');

  const described = ($field.attr('aria-describedby') || '').split(' ').filter(Boolean);
  if (described.indexOf(errorId) === -1) {
    described.push(errorId);
    $field.attr('aria-describedby', described.join(' '));
  }
}

function jqClearFieldError($field) {
  $('#' + jqErrorId($field)).text('').addClass('hidden');
  $field.removeClass('error success').removeAttr('aria-invalid');
}

function jqMarkFieldValid($field) {
  jqClearFieldError($field);
  $field.addClass('success');
}

function jqClearFormState($form) {
  $form.find('input, select, textarea').each(function () {
    jqClearFieldError($(this));
  });
}

/* rules: [{ $field, check: () => '' or message }]. Shows each error beside its field,
   focuses the first invalid field and returns the list of messages (empty = valid). */
function jqValidateFields(rules) {
  const errors = [];
  let $firstInvalid = null;

  $.each(rules, function (index, rule) {
    const message = rule.check();
    if (message !== '') {
      jqShowFieldError(rule.$field, message);
      errors.push(message);
      if ($firstInvalid === null) {
        $firstInvalid = rule.$field;
      }
    } else {
      jqMarkFieldValid(rule.$field);
    }
  });

  if ($firstInvalid !== null) {
    $firstInvalid.trigger('focus');
  }
  return errors;
}

/* ---------- result messages ---------- */

// type is 'success' or 'error'; lines is an optional list of strings
function jqShowMessage($container, type, title, lines) {
  $container
    .empty()
    .removeClass('hidden error success')
    .addClass(type)
    .attr('role', type === 'error' ? 'alert' : 'status')
    .append($('<p>', { class: 'fw-bold mb-1', text: title }));

  if (lines && lines.length > 0) {
    const $list = $('<ul>', { class: 'mb-0' }).appendTo($container);
    $.each(lines, function (index, line) {
      $('<li>').text(line).appendTo($list);
    });
  }
}

function jqHideMessage($container) {
  $container.empty().removeClass('error success').addClass('hidden');
}

// pairs: [['Label', 'Value'], ...] -> a Bootstrap-grid description list
function jqSummaryList(pairs) {
  const $list = $('<dl>', { class: 'row mb-0 mt-2' });
  $.each(pairs, function (index, pair) {
    $list.append(
      $('<dt>', { class: 'col-sm-4', text: pair[0] }),
      $('<dd>', { class: 'col-sm-8', text: pair[1] })
    );
  });
  return $list;
}
