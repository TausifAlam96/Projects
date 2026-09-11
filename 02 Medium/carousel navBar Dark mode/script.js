/* =========================================================
       A. RESPONSIVE MOBILE MENU
       ========================================================= */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  const isOpen = navLinks.classList.contains("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close menu when clicking outside or on a link
document.addEventListener("click", (e) => {
  if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
    navLinks.classList.remove("open");
  }
});

/* =========================================================
       B. CAROUSEL ENGINE
       ========================================================= */
const track = document.getElementById("carouselTrack");
const slides = Array.from(track.children);
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const indicatorsContainer = document.getElementById("indicators");
const carouselWrapper = document.getElementById("carouselWrapper");

let currentSlide = 0;
const slideCount = slides.length;
let autoPlayInterval = null;

// Create dynamic dot indicators
slides.forEach((_, idx) => {
  const dot = document.createElement("button");
  dot.classList.add("dot");
  if (idx === 0) dot.classList.add("active");
  dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
  dot.addEventListener("click", () => {
    goToSlide(idx);
    restartAutoPlay();
  });
  indicatorsContainer.appendChild(dot);
});

const dots = Array.from(indicatorsContainer.children);

function updateCarousel() {
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = (index + slideCount) % slideCount;
  updateCarousel();
}

prevBtn.addEventListener("click", () => {
  goToSlide(currentSlide - 1);
  restartAutoPlay();
});

nextBtn.addEventListener("click", () => {
  goToSlide(currentSlide + 1);
  restartAutoPlay();
});

// Auto-advance every 5 seconds
function startAutoPlay() {
  autoPlayInterval = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

function restartAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// Pause on hover for accessibility
carouselWrapper.addEventListener("mouseenter", stopAutoPlay);
carouselWrapper.addEventListener("mouseleave", startAutoPlay);

startAutoPlay();

/* =========================================================
       C. BONUS: DARK / LIGHT MODE TOGGLE
       ========================================================= */
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

// Check system preference or default
const savedTheme = localStorage.getItem("site_theme") || "dark";
applyTheme(savedTheme);

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem("site_theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  applyTheme(current === "light" ? "dark" : "light");
});
