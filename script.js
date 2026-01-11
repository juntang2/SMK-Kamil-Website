/**
 * 1. Live Clock & Date Function
 * Displays time in Malaysian format (en-MY)
 */
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    };
    const clockElement = document.getElementById('liveClock');
    if (clockElement) {
        clockElement.innerText = now.toLocaleString('en-MY', options);
    }
}
setInterval(updateClock, 1000);
updateClock();

/**
 * 2. Search Overlay Functionality
 * Taylor's Style Full-Screen Toggle
 */
const searchOverlay = document.getElementById('searchOverlay');
const openBtn = document.getElementById('openSearch');
const closeBtn = document.getElementById('closeSearch');
const searchInput = document.getElementById('mainSearchInput');
const searchForm = document.getElementById('actualSearchForm');
const searchStatus = document.getElementById('searchStatus');

openBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    if (searchStatus) searchStatus.innerText = "";
    setTimeout(() => searchInput.focus(), 500);
});

closeBtn.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
});

// Keyword-based search logic
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.toLowerCase().trim();
    
    const routes = {
        "visi": "search-visi",
        "misi": "search-misi",
        "moto": "search-moto",
        "slogan": "search-slogan",
        "alamat": "contact",
        "hubungi": "contact",
        "maklumat": "maklumat"
    };

    if (routes[query]) {
        searchOverlay.classList.remove('active');
        document.getElementById(routes[query]).scrollIntoView({ behavior: 'smooth' });
        searchInput.value = "";
    } else {
        searchStatus.innerText = `Tiada keputusan untuk "${query}". Cuba 'Visi' atau 'Alamat'.`;
        searchStatus.style.color = "#cc0000";
        searchStatus.style.marginTop = "20px";
    }
});

/**
 * 3. Fade-in Animations
 * Intersection Observer triggers the .active class on scroll
 */
const observerOptions = { threshold: 0.1 };
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
