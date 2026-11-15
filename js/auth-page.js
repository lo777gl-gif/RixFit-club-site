/* auth-page.js - sign in / sign up forms on login.html and register.html (shared account from site.js). */

$(function () {
  'use strict';

  const $host = $('#auth-host');
  let renderedFor;

  function nextPage() {
    const next = new URLSearchParams(window.location.search).get('next') || '';
    return /^[\w-]+\.html(#[\w-]*)?$/.test(next) ? next : 'index.html';
  }

  function render() {
    const user = RixFitSite.getUser();
    const key = user ? user.id : '';
    if (key === renderedFor) { return; }
    renderedFor = key;

    if (user) {
      $host.empty().append(
        $('<p>', { class: 'lead', text: 'You are signed in as ' + user.name + '.' }),
        $('<div>', { class: 'd-flex flex-wrap gap-2' }).append(
          $('<a>', { class: 'btn btn-primary', href: nextPage(), text: 'Continue' }),
          $('<a>', { class: 'btn btn-outline-light', href: 'account.html', text: 'My account' })
        )
      );
      return;
    }
    RixFitSite.mountAuth($host, { mode: $host.attr('data-mode'), onSuccess: function () { setTimeout(function () { window.location.href = nextPage(); }, 800); } });
  }

  RixFitSite.onChange(render);
  render();
});
