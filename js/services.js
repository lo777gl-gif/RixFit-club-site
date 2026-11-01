'use strict';

const services = [
    {id: 1, name: 'Adult Pool', area: 'pool', minutes: 60},
    {id: 2, name: 'Kids Pool', area: 'pool', minutes: 45},
    {id: 3, name: 'Turkish Hammam', area: 'sauna', minutes: 30},
    {id: 4, name: 'Vaporarium', area: 'sauna', minutes: 30},
    {id: 5, name: 'Infrared Sauna', area: 'sauna', minutes: 30},
    {id: 6, name: 'Deck Chair Sunbathing', area: 'terrace', minutes: 60},
    {id: 7, name: 'Massage', area: 'spa', minutes: 45}
];

$(function() {
    function createPanel(area) {
        const panel = $('<div>');
        panel.addClass('service-fact hidden');
        const message = $('<p>');
        message.attr('role', 'status');
        const saved = loadFromStorage('rixfit-services', {})[area] || [];

        for (const service of services) {
            if (service.area === area) {
                const label = $('<label>');
                label.addClass('d-block mb-2');
                const checkbox = $('<input>');
                checkbox.attr('type', 'checkbox');
                checkbox.addClass('form-check-input me-2');
                checkbox.val(service.name);
                checkbox.prop('checked', saved.includes(service.name));
                const text = $('<span>');
                text.text(`${service.name} (${service.minutes} min)`);
                label.append(checkbox, text);
                panel.append(label);
            }
        }

        const saveButton = $('<button>');
        saveButton.attr('type', 'button');
        saveButton.addClass('btn btn-primary');
        saveButton.text('Save my choice');

        saveButton.on('click', () => {
            const chosen = loadFromStorage('rixfit-services', {});
            chosen[area] = panel.find('input:checked').map(function() {
                return $(this).val();
            }).get();
            saveToStorage('rixfit-services', chosen);
            message.addClass('success');
            if (chosen[area].length === 0) {
                message.text('Choice cleared. Nothing saved for this area.');
            } else {
                message.text(`Saved on this device: ${chosen[area].join(', ')}. See it in My Account.`);
            }
        });

        panel.append(saveButton, message);
        return panel;
    }

    $('.service-card').each(function() {
        const area = $(this).find('h3').attr('id');
        const panel = createPanel(area);
        const toggleButton = $('<button>');
        toggleButton.attr('type', 'button').attr('aria-expanded', 'false');
        toggleButton.addClass('btn btn-outline-light mt-3');
        toggleButton.text('Choose a service type');

        toggleButton.on('click', () => {
            panel.toggleClass('hidden');
            toggleButton.attr('aria-expanded', String(!panel.hasClass('hidden')));
        });

        $(this).append(toggleButton, panel);
    });
});
