let adminLink; // ✅ Declare at the top so it's accessible everywhere

document.addEventListener("DOMContentLoaded", function () {
    // ✅ Always run these features
    setupDarkModeToggle();
    startCountdown();
    ensureNavbarExists();

    // ✅ Get the admin link
    adminLink = document.getElementById("admin-link");

    // ✅ Show admin link if admin mode is active
    if (adminLink && localStorage.getItem("admin") === "true") {
        adminLink.style.display = "block";
    }

    // ✅ Menu scroll
    if (window.location.pathname.includes("menu.html")) {
        const viewMenuButton = document.querySelector(".btn");
        if (viewMenuButton) {
            viewMenuButton.addEventListener("click", () => {
                const menuSection = document.getElementById("menu");
                if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    // 🌙 Dark Mode Toggle
    function setupDarkModeToggle() {
        let darkModeToggle = document.getElementById("dark-mode-toggle");
        if (!darkModeToggle) {
            const newToggle = document.createElement("button");
            newToggle.id = "dark-mode-toggle";
            newToggle.textContent = "🌙";
            newToggle.style = `
                position: fixed; top: 10px; right: 10px;
                padding: 10px; cursor: pointer; font-size: 1.2em;
                border: none; border-radius: 50%;
                background: #333; color: #fff;
            `;
            document.body.appendChild(newToggle);
            darkModeToggle = newToggle;
        }

        const isDark = localStorage.getItem("theme") === "dark";
        document.body.classList.toggle("dark-mode", isDark);
        darkModeToggle.textContent = isDark ? "☀️" : "🌙";

        darkModeToggle.addEventListener("click", () => {
            const darkModeOn = document.body.classList.toggle("dark-mode");
            localStorage.setItem("theme", darkModeOn ? "dark" : "light");
            darkModeToggle.textContent = darkModeOn ? "☀️" : "🌙";
        });
    }

    // ⏲️ Countdown Timer
    function startCountdown() {
        const countdownTimer = document.getElementById("timer");
        if (!countdownTimer) return;

        function updateTimer() {
            const now = new Date();
            const nextUpdate = new Date();
            nextUpdate.setHours(24, 0, 0, 0);
            let diff = nextUpdate - now;
            if (diff <= 0) diff = 24 * 60 * 60 * 1000;

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            countdownTimer.textContent = `${hours}h ${minutes}m ${seconds}s`;
            setTimeout(updateTimer, 1000);
        }

        updateTimer();
    }

    // 🔄 Navbar Fallback
    function ensureNavbarExists() {
        let navbar = document.getElementById("navbar");
        if (!navbar) {
            navbar = document.createElement("nav");
            navbar.id = "navbar";
            navbar.innerHTML = `
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Menu</a></li>
                    <li><a href="#">Profile</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            `;
            document.body.prepend(navbar);
        }
    }
});

// 🔐 Ctrl + A: Toggle Admin Mode
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "a") {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
        e.preventDefault(); // Stop default "Select All"

        const isAdmin = localStorage.getItem("admin") === "true";
        localStorage.setItem("admin", !isAdmin);
        alert(`Admin Mode ${!isAdmin ? "Activated ✅" : "Deactivated ❌"}`);

        if (adminLink) {
            adminLink.style.display = !isAdmin ? "block" : "none";
        }
    }
});
// TYPE WRITER EFFECT
const typewriterText = document.getElementById("typewriter-text");
if (typewriterText) {
    const sentences = [
        "Welcome to our university cafeteria.",
        "We offer real-time updates on our menu, food prices and a feedback system...",
    ];
}

let sentenceIndex = 0;
let charIndex = 0;
let currentSentence = sentences[sentenceIndex];
let isDeleting = false;

function type() {
    if(!isDeleting) {
        typewriterText.textContent = currentSentence.substring(0, charIndex + 1);
        charIndex++;

        if(charIndex === currentSentence.length){
            isDeleting = true;
            setTimeout(type, 2000);
            return;
        }
    } else {
        typewriterText.textContent = currentSentence.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            isDeleting = false;
            sentenceIndex = (sentenceIndex + 1) % sentences.length;
            currentSentence = sentences[sentenceIndex];
        }
    }

    setTimeout(type. isDeleting ? 30:75);
}
