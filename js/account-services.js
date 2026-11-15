'use strict';

$(function() {
    const host = $('#profile-host');

    function renderServices(user) {
        host.find('.my-services').remove();
        if (!user) {
            return;
        }
        const mine = loadFromStorage('rixfit-services', {})[user.email] || {};

        const box = $('<div>');
        box.addClass('my-services mt-4');
        const title = $('<h3>');
        title.addClass('h5');
        title.text('My services');
        box.append(title);

        const list = $('<ul>');
        list.addClass('list-unstyled mb-0');
        for (const area in mine) {
            if (mine[area].length > 0) {
                const line = $('<li>');
                line.addClass('small py-1 border-bottom border-secondary');
                line.text(`${area.charAt(0).toUpperCase()}${area.slice(1)}: ${mine[area].join(', ')}`);
                list.append(line);
            }
        }

        if (list.children().length === 0) {
            const empty = $('<p>');
            empty.addClass('small mb-0');
            empty.append('No services chosen yet. Pick them on the ');
            const link = $('<a>');
            link.attr('href', 'services.html').text('Services page');
            empty.append(link, '.');
            box.append(empty);
        } else {
            box.append(list);
        }

        host.find('[data-action="signout"]').before(box);
    }

    RixFitSite.onChange(renderServices);
    renderServices(RixFitSite.getUser());
});
