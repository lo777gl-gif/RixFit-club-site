// -------------------------------------------------------------------------------------------------------------------------------------------------------
// Dynamic select changing

const servicesConfig = {
    lose_weight: {
        requiresTrainer: true,
        trainers: [
            { id: 't1', name: 'Vera'},
            { id: 't2', name: 'Chingis'},
            { id: 't3', name: 'Ulan'},
            { id: 't4', name: 'Dmitriy'}
        ]
    },
    gain_muscle: {
        requiresTrainer: true,
        trainers: [
            { id: 't1', name: 'Vera'},
            { id: 't2', name: 'Chingis'},
            { id: 't3', name: 'Ulan'},
            { id: 't4', name: 'Dmitriy'}
        ]
    },
    pool_swimming: {
        requiresTrainer: true,
        trainers: [
            { id: 't5', name: 'Dmitriy'},
            { id: 't6', name: 'Sergey Mikhailovich'},
            { id: 't7', name: 'Sabina'},
            { id: 't8', name: 'Samat'}
        ]
    },
    sauna: {
        requiresTrainer: false, 
        trainers: []
    },
    spa: {
        requiresTrainer: false, 
        trainers: []
    }
};

const serviceSelect = document.querySelector('.service-select');
const trainerSelect = document.querySelector('.trainer-select');

serviceSelect.addEventListener('change', (e) => {
    const selectedKey = e.target.value;
    const config = servicesConfig[selectedKey];

    trainerSelect.textContent = '';

    if (!config) {
        trainerSelect.disabled = true;
        trainerSelect.appendChild(new Option('- Choose trainer -', 'none'));
        return;
    }

    if (!config.requiresTrainer) {
        trainerSelect.disabled = true;
        trainerSelect.appendChild(new Option('- For Sauna and Spa trainer not requiered -', 'none'));
        return;
    }

    trainerSelect.disabled = false;
    trainerSelect.appendChild(new Option('- Choose trainer -', 'none'));

    const fragment = document.createDocumentFragment();
    config.trainers.forEach((trainer) => {
        fragment.appendChild(new Option(trainer.name, trainer.id));
    });

    trainerSelect.appendChild(fragment);
});


// -------------------------------------------------------------------------------------------------------------------------------------------------------
// Form Validator

'use strict';

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#booking-form");
    const errorBox = document.querySelector("#booking-error");
    const confirmBox = document.querySelector("#booking-confirmation");

    // Список услуг, не требующих тренера
    const servicesWithoutTrainer = ["spa", "sauna"];

    function validate() {
        const errors = [];
        let firstInvalidField = null;

        // Вспомогательная функция регистрации ошибки и запоминания первого фокуса
        function addError(field, message) {
            errors.push(message);
            if (!firstInvalidField && field) {
                firstInvalidField = field;
            }
        }

        const name = form.userName.value.trim();
        const email = form.userEmail.value.trim();
        const phone = form.userPhone.value.trim();
        const age = form.age.value.trim();
        const gender = form.querySelector('input[name="gender"]:checked');
        
        // Новые select элементы
        const serviceSelect = form.service;
        const trainerSelect = form.trainer;
        const selectedService = serviceSelect ? serviceSelect.value : "";
        const selectedTrainer = trainerSelect ? trainerSelect.value : "";

        // 1. Name
        if (!/^[\p{L}][\p{L}\s'-]+$/u.test(name)) {
            addError(form.userName, "Name: write at least 2 letters.");
        }

        // 2. Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            addError(form.userEmail, "Email: write correct address (for example: name@mail.com).");
        }

        // 3. Phone
        const phoneDigits = phone.replace(/\D/g, "");
        if (!/^\+?[0-9\s()-]+$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
            addError(form.userPhone, "Phone number: write from 10 to 15 numbers (for example, +7 700 700 70 70).");
        }

        // 4. Age
        const ageNum = Number(age);
        if (age === "" || !Number.isInteger(ageNum) || ageNum < 12) {
            addError(form.age, "Age: allowed from 12 without trustee.");
        }

        // 5. Gender
        if (!gender) {
            const firstGenderRadio = form.querySelector('input[name="gender"]');
            addError(firstGenderRadio, "Gender: choose one of the variants.");
        }

        // 6. Service select (Обязательный выбор направления)
        if (!selectedService) {
            addError(serviceSelect, "Service: please select a training direction or service.");
        }

        // 7. Trainer select (Комбинированное правило: зависимость от выбранной услуги)
        if (selectedService && !servicesWithoutTrainer.includes(selectedService)) {
            // Если селект тренера заблокирован — значит, для выбранной услуги тренер не нужен
            const isTrainerRequired = !trainerSelect.disabled && !servicesWithoutTrainer.includes(selectedService);

            if (selectedService && isTrainerRequired) {
                if (!selectedTrainer || selectedTrainer === "none") {
                    addError(trainerSelect, "Trainer: please select an available coach for this service.");
                }
            }
        }

        // 8. Agree with rules
        if (!form.agree.checked) {
            addError(form.agree, "Must agree with club rules.");
        }

        return { errors, firstInvalidField };
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Очищаем предыдущие сообщения перед повторным сабмитом
        errorBox.textContent = "";
        confirmBox.textContent = "";

        const { errors, firstInvalidField } = validate();

        if (errors.length > 0) {
            const alert = document.createElement("div");
            alert.className = "alert alert-danger mt-3";

            const title = document.createElement("strong");
            title.textContent = "Filled out incorrectly:";
            alert.appendChild(title);

            const ul = document.createElement("ul");
            ul.className = "mb-0";
            errors.forEach(function (msg) {
                const li = document.createElement("li");
                li.textContent = msg;
                ul.appendChild(li);
            });
            alert.appendChild(ul);

            errorBox.appendChild(alert);

            // Перенос фокуса на первое поле с ошибкой согласно критериям задания
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        } else {
            // Генерация демонстрационного ID заявки через Math.random() 
            const demoRefNumber = Math.floor(100000 + Math.random() * 900000);
            const userName = form.userName.value.trim();
            const serviceLabel = form.service.options[form.service.selectedIndex].text;
            
            let trainerDetails = "No trainer required";
            if (!servicesWithoutTrainer.includes(form.service.value)) {
                trainerDetails = form.trainer.options[form.trainer.selectedIndex].text;
            }

            const alert = document.createElement("div");
            alert.className = "alert alert-success mt-3";

            // Сводка по выбранным полям и демонстрационный дисклеймер
            const confirmationTitle = document.createElement("h5");
            confirmationTitle.className = "alert-heading";
            confirmationTitle.textContent = `Application #${demoRefNumber} received!`;

            const summaryText = document.createElement("p");
            summaryText.textContent = `Client: ${userName} | Service: ${serviceLabel} | Coach: ${trainerDetails}`;

            const disclaimer = document.createElement("small");
            disclaimer.className = "d-block text-muted mt-2 border-top pt-2";
            disclaimer.textContent = "Demo mode: No data was sent to a real server. No actual booking or payment was created.";

            alert.appendChild(confirmationTitle);
            alert.appendChild(summaryText);
            alert.appendChild(disclaimer);

            confirmBox.appendChild(alert);
        }
    });

    form.addEventListener("reset", function () {
        errorBox.textContent = "";
        confirmBox.textContent = "";
    });
});



// -------------------------------------------------------------------------------------------------------------------------------------------------------
//

