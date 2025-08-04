document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    });
});

window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (window.scrollY > 100) {
        header.style.background = "rgba(26, 26, 26, 0.95)";
        header.style.backdropFilter = "blur(10px)";
    } else {
        header.style.background = "rgba(26, 26, 26, 0.95)";
        header.style.backdropFilter = "none";
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll(".feature-card, .screenshot-item").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
});

function toggleMobileMenu() {
    const navLinks = document.querySelector(".nav-links");
    navLinks.classList.toggle("active");
}

document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
        console.log("Download button clicked:", this.textContent.trim());
    });
});

function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('show');
}

document.addEventListener('click', function (event) {
    const selector = document.querySelector('.language-selector');
    if (!selector.contains(event.target)) {
        document.getElementById('languageDropdown').classList.remove('show');
    }
});