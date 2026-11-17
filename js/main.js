
import { destinations } from "./data.js";
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
if (menuToggle && navMenu) {
    const closeMenu = () => {
        navMenu.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    };
    menuToggle.addEventListener("click", () => {
        const isOpen =
            menuToggle.getAttribute("aria-expanded") === "true";
        navMenu.classList.toggle("active", !isOpen);
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" &&
            menuToggle.getAttribute("aria-expanded") === "true") {
            closeMenu();
            menuToggle.focus();
        }
    });
    navMenu.addEventListener("keydown", (event) => {
        if (event.key === "Tab" &&
            menuToggle.getAttribute("aria-expanded") === "true") {
            const focusable = navMenu.querySelectorAll(
                'a[href], button:not([disabled])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey &&
                document.activeElement === first) {
                event.preventDefault();
                menuToggle.focus();
            }
            if (!event.shiftKey &&
                document.activeElement === last) {
                event.preventDefault();
                menuToggle.focus();
            }
        }
    });
}
const destinationGrid =
    document.querySelector("#destination-grid");
const formatPrice = (price) => {
    return `KES ${price.toLocaleString("en-KE")}`;
};
const createDestinationCard = (destination) => {
    const card = document.createElement("article");
    card.className = "destination-card";
    card.innerHTML = `
        <img class="destination-image">
        <div class="destination-content">
            <span class="availability-badge"></span>
            <h3 class="destination-name"></h3>
            <p class="destination-region"></p>
            <p class="destination-description"></p>
            <p class="destination-price"></p>
            <p class="destination-total"></p>
            <a class="book-link">Book now</a>
        </div>
    `;
    const image = card.querySelector("img");
    image.src = destination.image;
    image.alt = destination.imageAlt;
    card.querySelector(".destination-name").textContent =
        destination.name;
    card.querySelector(".destination-region").textContent =
        destination.region;
    card.querySelector(".destination-description").textContent =
        destination.description;
    card.querySelector(".destination-price").textContent =
        `${formatPrice(destination.pricePerNight)} per night`;
    const totalCost =
        destination.pricePerNight * destination.nights;
    card.querySelector(".destination-total").textContent =
        `Total for ${destination.nights} nights: ${formatPrice(totalCost)}`;
    const badge = card.querySelector(".availability-badge");
    badge.textContent = destination.isAvailable
        ? "Available"
        : "Sold out";
    badge.classList.add(
        destination.isAvailable ? "available" : "sold-out"
    );
    const bookLink = card.querySelector(".book-link");
    if (destination.isAvailable) {
        bookLink.href =
            `contact.html?destination=${encodeURIComponent(destination.name)}`;
    } else {
        bookLink.removeAttribute("href");
        bookLink.setAttribute("aria-disabled", "true");
        bookLink.classList.add("disabled");
        bookLink.textContent = "Unavailable";
    }
    return card;
};
const renderDestinations = (items) => {
    if (!destinationGrid) return;
    destinationGrid.replaceChildren();
    for (const destination of items) {
        const card = createDestinationCard(destination);
        destinationGrid.appendChild(card);
    }
};
const filterContainer =
    document.querySelector("#filter-buttons");
const searchInput =
    document.querySelector("#destination-search");
const resultCount =
    document.querySelector("#result-count");
if (destinationGrid && !filterContainer) {
    renderDestinations(destinations);
}
if (destinationGrid && filterContainer && searchInput) {
    let activeRegion = "All";
    const updateDestinations = () => {
        const searchTerm =
            searchInput.value.trim().toLowerCase();
        const filteredDestinations = destinations.filter(
            (destination) => {
                const matchesRegion =
                    activeRegion === "All" ||
                    destination.region === activeRegion;
                const matchesSearch =
                    destination.name.toLowerCase()
                        .includes(searchTerm);
                return matchesRegion && matchesSearch;
            }
        );
        renderDestinations(filteredDestinations);
        resultCount.textContent =
            filteredDestinations.length === 0
                ? "No destinations match."
                : `${filteredDestinations.length} destinations found.`;
    };
    filterContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button || !filterContainer.contains(button)) {
            return;
        }
        activeRegion = button.dataset.region;
        const buttons =
            filterContainer.querySelectorAll("button");
        for (const filterButton of buttons) {
            const isActive =
                filterButton.dataset.region === activeRegion;
            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        }
        updateDestinations();
    });
    searchInput.addEventListener("input", updateDestinations);
    updateDestinations();
}
const contactForm =
    document.querySelector("#contact-form");
if (contactForm) {
    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");
    const messageInput = document.querySelector("#message");
    const formStatus =
        document.querySelector("#form-status");
    const fields = [
        {
            input: nameInput,
            error: document.querySelector("#name-error"),
            validate: (value) => value.trim().length > 0,
            message: "Please enter your name."
        },
        {
            input: emailInput,
            error: document.querySelector("#email-error"),
            validate: (value) => {
                return value.trim().length > 0 &&
                    value.includes("@");
            },
            message: "Please enter a valid email containing @."
        },
        {
            input: messageInput,
            error: document.querySelector("#message-error"),
            validate: (value) => value.trim().length >= 20,
            message: "Your message must contain at least 20 characters."
        }
    ];
    const clearError = (field) => {
        field.error.textContent = "";
        field.input.setAttribute("aria-invalid", "false");
    };
    const validateField = (field) => {
        const isValid = field.validate(field.input.value);
        if (!isValid) {
            field.error.textContent = field.message;
            field.input.setAttribute("aria-invalid", "true");
            return false;
        }
        clearError(field);
        return true;
    };
    for (const field of fields) {
        field.input.addEventListener("input", () => {
            validateField(field);
            formStatus.textContent = "";
        });
    }
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formStatus.textContent = "";
        let firstInvalidField = null;
        for (const field of fields) {
            const isValid = validateField(field);
            if (!isValid && !firstInvalidField) {
                firstInvalidField = field.input;
            }
        }
        if (firstInvalidField) {
            firstInvalidField.focus();
            return;
        }
        contactForm.reset();
        for (const field of fields) {
            clearError(field);
        }
        formStatus.textContent =
            "Thank you! Your message has been received.";
    });
}
if (destinationGrid && !filterContainer) {
    const featuredDestinations = destinations.slice(0, 4);

    renderDestinations(featuredDestinations);
}