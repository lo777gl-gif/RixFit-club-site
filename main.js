const catalogue = document.getElementById('bar-section');

const categories = ["All", "Tea", "Juice", "Milkshake"];
const filters = document.createElement('div');
filters.classList.add("d-flex", "gap-2", "flex-wrap", "mb-3");

categories.forEach(category => {
    const button = document.createElement('button');

    button.type = "button";
    button.textContent = category;
    button.classList.add("btn", "btn-outline-primary");
    
    const section = document.querySelector("section");
    section.prepend(filters);

    button.addEventListener("click", () => {
        document.querySelectorAll(".bar-table").forEach(table => {
            const matches = categories === "all" || table.dataset.category === categories.toLowerCase();
            table.closest("table-responsive").hidden() = !matches;
        });
    });
})