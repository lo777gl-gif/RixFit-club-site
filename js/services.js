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

function createPanel(area) {
    const panel = document.createElement('div');
    panel.classList.add('service-fact', 'hidden');
    const message = document.createElement('p');
    message.setAttribute('role', 'status');
    const saved = loadFromStorage('rixfit-services', {})[area] || [];
    const checkboxes = [];

    for (const service of services) {
        if (service.area === area) {
            const label = document.createElement('label');
            label.classList.add('d-block', 'mb-2');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input', 'me-2');
            checkbox.value = service.name;
            checkbox.checked = saved.includes(service.name);
            label.append(checkbox, `${service.name} (${service.minutes} min)`);
            checkboxes.push(checkbox);
            panel.append(label);
        }
    }

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.classList.add('btn', 'btn-primary');
    saveButton.textContent = 'Save my choice';

    saveButton.addEventListener('click', () => {
        const chosen = loadFromStorage('rixfit-services', {});
        chosen[area] = checkboxes.filter(box => box.checked).map(box => box.value);
        saveToStorage('rixfit-services', chosen);
        message.classList.add('success');
        message.textContent = chosen[area].length === 0
            ? 'Choice cleared. Nothing saved for this area.'
            : `Saved on this device: ${chosen[area].join(', ')}. See it in My Account.`;
    });

    panel.append(saveButton, message);
    return panel;
}

for (const card of document.querySelectorAll('.service-card')) {
    const area = card.querySelector('h3').id;
    const panel = createPanel(area);
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.classList.add('btn', 'btn-outline-light', 'mt-3');
    toggleButton.textContent = 'Choose a service type';
    toggleButton.setAttribute('aria-expanded', 'false');

    toggleButton.addEventListener('click', () => {
        const isHidden = panel.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', String(!isHidden));
    });

    card.append(toggleButton, panel);
}
