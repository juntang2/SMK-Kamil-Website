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
 * 2. Premium Navigation & Drawer Menu
 */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
    });

    // Close menu drawer when navigation links are clicked
    document.querySelectorAll('#mainNav a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });

    // Dismiss drawer when clicking outside bounds
    document.addEventListener('click', (e) => {
        const isMenuOpen = mainNav.classList.contains('active');
        const clickedInside = mainNav.contains(e.target);
        const clickedToggle = menuToggle.contains(e.target);

        if (isMenuOpen && !clickedInside && !clickedToggle) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });

    // Close drawer automatically on viewport expansion to avoid desktop state conflicts
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });
}

/**
 * 3. Premium Live Search Engine & Highlighting Panel
 */
const searchOverlay = document.getElementById('searchOverlay');
const openBtn = document.getElementById('openSearch');
const closeBtn = document.getElementById('closeSearch');
const searchInput = document.getElementById('mainSearchInput');
const searchForm = document.getElementById('actualSearchForm');
const searchStatus = document.getElementById('searchStatus');
const searchResults = document.getElementById('searchResults');
const clearSearchInput = document.getElementById('clearSearchInput');

let searchIndex = [];

// Indexing pages structures, cards, content blocks, and announcements
function buildSearchIndex() {
    searchIndex = [];

    // Index Static Information Sections
    const staticTargets = [
        { id: 'search-misi', title: 'Misi Sekolah', type: 'maklumat', content: 'Melestarikan sistem pendidikan yang berkualiti untuk membangunkan potensi individu bagi memenuhi aspirasi negara.' },
        { id: 'search-visi', title: 'Visi Sekolah', type: 'maklumat', content: 'Pendidikan Berkualiti, Insan Terdidik, Negara Sejahtera.' },
        { id: 'search-moto', title: 'Moto Sekolah', type: 'maklumat', content: 'Pengetahuan Tangga Kemajuan. Tunjang semangat warga Kamilian sejak tahun 1954.' },
        { id: 'search-slogan', title: 'Slogan Sekolah', type: 'maklumat', content: 'KAMIL TERSOHOR. Identiti kecemerlangan yang melambangkan kebanggaan sekolah.' },
        { id: 'search-program-stem', title: 'Program: STEM & Inovasi', type: 'program', content: 'STEM & Inovasi. Peneraju kreativiti sains, robotik, dan pengekodan bagi menyediakan Kamilian ke arah cabaran teknologi masa hadapan.' },
        { id: 'search-program-sukan', title: 'Program: Sukan Cemerlang', type: 'program', content: 'Sukan Cemerlang. Membina jaguh olahraga dan ragbi elit melalui program latihan sistematik serta kejohanan berprestasi tinggi.' },
        { id: 'search-program-seni', title: 'Program: Seni & Kebudayaan', type: 'program', content: 'Seni & Kebudayaan. Mengasah bakat seni visual, muzik, persembahan kreatif, serta kepintaran berdebat di persada kebangsaan.' },
        { id: 'search-program-kepimpinan', title: 'Program: Kepimpinan Lestari', type: 'program', content: 'Kepimpinan Lestari. Melahirkan pemimpin berwibawa melalui program kokurikulum berimpak tinggi dan modul sahsiah unggul.' },
        { id: 'search-akademik-sains-tulen', title: 'Akademik: Aliran Sains Tulen', type: 'akademik', content: 'Aliran Sains Tulen. Fizik, Kimia, Biologi, Matematik Tambahan. Fokus kepada pemahaman mendalam tentang alam semula jadi, fizik, dan kimia untuk melahirkan saintis dan doktor masa depan.' },
        { id: 'search-akademik-sains-sosial', title: 'Akademik: Sains Sosial & Bahasa', type: 'akademik', content: 'Aliran Sains Sosial & Bahasa. Menekankan aspek kemanusiaan, geografi, sastera, dan kemahiran komunikasi berimpak tinggi dalam masyarakat. Kesusasteraan Melayu/Inggeris, Sejarah, Geografi.' },
        { id: 'search-akademik-teknikal', title: 'Akademik: Teknikal & Vokasional', type: 'akademik', content: 'Aliran Teknikal & Vokasional. Membina kemahiran praktikal dalam pengaturcaraan, reka cipta kreatif, perakaunan, dan pengurusan perniagaan moden. Sains Komputer, Reka Cipta, Prinsip Perakaunan, Perniagaan.' }
    ];

    staticTargets.forEach(target => {
        const element = document.getElementById(target.id);
        if (element) {
            searchIndex.push({
                id: target.id,
                title: target.title,
                type: target.type,
                content: target.content,
                element: element
            });
        }
    });

    // Index Location & Contact
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        searchIndex.push({
            id: 'contact',
            title: 'Lokasi & Perhubungan (Hubungi Kami)',
            type: 'hubungi',
            content: 'Alamat Rasmi: Sekolah Menengah Kebangsaan Kamil, 16800 Pasir Puteh, Kelantan. No Telefon / Faks pejabat: +609-785 5300. Alamat Emel Rasmi: dee4289@moe.edu.my.',
            element: contactSection
        });
    }

    // Index Dynamic Announcements (Google Sheets / Fallback JSON array)
    if (window.allAnnouncements && window.allAnnouncements.length > 0) {
        window.allAnnouncements.forEach((ann, idx) => {
            const grid = document.getElementById('announcementsGrid');
            let element = document.getElementById('pengumuman');
            if (grid && grid.children[idx]) {
                element = grid.children[idx];
            }
            searchIndex.push({
                id: 'pengumuman',
                title: `Pengumuman: ${ann.title}`,
                type: 'pengumuman',
                content: `Kategori: ${ann.category} (${ann.date}) - ${ann.content}`,
                element: element
            });
        });
    }
}

// Open Search Overlay
if (openBtn) {
    openBtn.addEventListener('click', () => {
        // Close menu drawer if currently open on mobile
        if (menuToggle && mainNav) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
        
        // Assemble searchable tokens
        buildSearchIndex();

        searchOverlay.classList.add('active');
        if (searchStatus) searchStatus.innerText = "";
        if (searchResults) searchResults.innerHTML = "";
        if (clearSearchInput) clearSearchInput.classList.remove('visible');
        setTimeout(() => searchInput.focus(), 400);
    });
}

// Close Search Overlay
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
    });
}

// Clear Search Input Action
if (clearSearchInput) {
    clearSearchInput.addEventListener('click', () => {
        searchInput.value = '';
        executeLiveSearch();
        searchInput.focus();
    });
}

// Substring Escaping Regex Utility
function highlightQueryText(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Live Typing Carian Handler
function executeLiveSearch() {
    const query = searchInput.value.trim();
    if (!searchResults) return;

    if (!query) {
        searchResults.innerHTML = '';
        if (clearSearchInput) clearSearchInput.classList.remove('visible');
        if (searchStatus) searchStatus.innerText = '';
        return;
    }

    if (clearSearchInput) clearSearchInput.classList.add('visible');

    const lowerQuery = query.toLowerCase();
    const results = searchIndex.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.content.toLowerCase().includes(lowerQuery)
    );

    renderSearchResults(results, query);
}

// Dynamic UI Renderers
function renderSearchResults(results, query) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        if (searchStatus) searchStatus.innerText = '';
        searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search-minus"></i>
                <h3>Tiada keputusan carian ditemui</h3>
                <p>Cuba gunakan kata kunci alternatif:</p>
                <div class="search-suggestions">
                    <span class="search-suggestion-chip">Visi</span>
                    <span class="search-suggestion-chip">Misi</span>
                    <span class="search-suggestion-chip">Sukan</span>
                    <span class="search-suggestion-chip">PIBG</span>
                    <span class="search-suggestion-chip">Alamat</span>
                    <span class="search-suggestion-chip">Anugerah</span>
                </div>
            </div>
        `;

        // Suggestion Chips Click Handler
        searchResults.querySelectorAll('.search-suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                searchInput.value = chip.innerText;
                executeLiveSearch();
                searchInput.focus();
            });
        });
        return;
    }

    if (searchStatus) {
        searchStatus.innerText = `${results.length} keputusan ditemui. Sila klik untuk navigasi.`;
        searchStatus.style.color = '#fff';
    }

    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        
        const boldTitle = highlightQueryText(item.title, query);
        const boldContent = highlightQueryText(item.content, query);

        card.innerHTML = `
            <div class="search-result-header">
                <span class="search-result-tag ${item.type}">${item.type}</span>
            </div>
            <h4 class="search-result-title">${boldTitle}</h4>
            <p class="search-result-snippet">${boldContent}</p>
        `;

        // Click on Search Card Result Handler
        card.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            
            setTimeout(() => {
                if (item.element) {
                    // Check if target is inside an SPA view container
                    const closestView = item.element.closest('.spa-view');
                    if (closestView) {
                        const viewName = closestView.id === 'view-akademik' ? 'akademik' : 'home';
                        if (window.navigateToSPA) {
                            window.navigateToSPA(viewName, item.id, true, true);
                        } else {
                            item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            triggerPulse(item.element);
                        }
                    } else {
                        item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        triggerPulse(item.element);
                    }
                }
            }, 350);

            function triggerPulse(el) {
                // Reset previous pulse animations
                document.querySelectorAll('.target-highlight-pulse').forEach(pulseEl => {
                    pulseEl.classList.remove('target-highlight-pulse');
                });

                // Pulse glow highlight on landing card
                el.classList.add('target-highlight-pulse');
                setTimeout(() => {
                    el.classList.remove('target-highlight-pulse');
                }, 1500);
            }

            // Clean values
            searchInput.value = '';
            searchResults.innerHTML = '';
            if (clearSearchInput) clearSearchInput.classList.remove('visible');
            if (searchStatus) searchStatus.innerText = '';
        });

        searchResults.appendChild(card);
    });
}

// Bind live search triggers
if (searchInput) {
    searchInput.addEventListener('input', executeLiveSearch);
}

if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Keyboard submit defaults to first search card click
        if (searchResults && searchResults.children.length > 0) {
            const firstCard = searchResults.querySelector('.search-result-card');
            if (firstCard) firstCard.click();
        }
    });
}

// Keyboard arrow key navigation & Escape closures
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
    }

    if (searchOverlay.classList.contains('active') && searchResults && searchResults.children.length > 0) {
        const cards = Array.from(searchResults.querySelectorAll('.search-result-card'));
        if (cards.length === 0) return;

        let activeIdx = cards.findIndex(c => c.classList.contains('keyboard-active'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIdx !== -1) {
                cards[activeIdx].classList.remove('keyboard-active');
                cards[activeIdx].style.background = ''; 
            }
            activeIdx = (activeIdx + 1) % cards.length;
            cards[activeIdx].classList.add('keyboard-active');
            cards[activeIdx].style.background = 'rgba(255, 255, 255, 0.15)';
            cards[activeIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIdx !== -1) {
                cards[activeIdx].classList.remove('keyboard-active');
                cards[activeIdx].style.background = '';
            }
            activeIdx = (activeIdx - 1 + cards.length) % cards.length;
            cards[activeIdx].classList.add('keyboard-active');
            cards[activeIdx].style.background = 'rgba(255, 255, 255, 0.15)';
            cards[activeIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (e.key === 'Enter' && activeIdx !== -1) {
            e.preventDefault();
            cards[activeIdx].click();
        }
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

// Export to window so dynamic cards can be observed after loading
window.revealObserver = revealObserver;
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/**
 * 4. Dynamic Announcements System (Google Sheets + JSON Fallback)
 */
// Set your published Google Sheets CSV URL here. Example: 'https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv'
const GOOGLE_SHEET_CSV_URL = ''; 
const FALLBACK_JSON_URL = 'announcements.json';

async function loadAnnouncements() {
    const grid = document.getElementById('announcementsGrid');
    const loading = document.getElementById('announcementsLoading');
    
    if (!grid || !loading) return;
    
    try {
        let data = [];
        if (GOOGLE_SHEET_CSV_URL) {
            try {
                const response = await fetch(GOOGLE_SHEET_CSV_URL);
                if (response.ok) {
                    const csvText = await response.text();
                    data = parseCSV(csvText);
                } else {
                    throw new Error('Google Sheet response not ok');
                }
            } catch (err) {
                console.warn('Failed to load from Google Sheets, using fallback JSON...', err);
                data = await fetchFallbackJSON();
            }
        } else {
            data = await fetchFallbackJSON();
        }
        
        renderAnnouncements(data);
    } catch (error) {
        console.error('Error loading announcements:', error);
        showAnnouncementsError();
    }
}

async function fetchFallbackJSON() {
    const response = await fetch(FALLBACK_JSON_URL);
    if (!response.ok) throw new Error('Failed to fetch local announcements JSON');
    return await response.json();
}

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    // Attempt to parse headers to locate indices (supports any column order)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    
    const titleIdx = headers.indexOf('title') !== -1 ? headers.indexOf('title') : 0;
    const dateIdx = headers.indexOf('date') !== -1 ? headers.indexOf('date') : 1;
    const catIdx = headers.indexOf('category') !== -1 ? headers.indexOf('category') : 2;
    const contentIdx = headers.indexOf('content') !== -1 ? headers.indexOf('content') : 3;
    const imgIdx = headers.indexOf('imageurl') !== -1 ? headers.indexOf('imageurl') : 4;
    
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Accurate CSV splitter
        const row = [];
        let insideQuote = false;
        let entry = '';
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                row.push(entry.trim());
                entry = '';
            } else {
                entry += char;
            }
        }
        row.push(entry.trim());
        
        // Clean surrounding quotes
        const cleanRow = row.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        if (cleanRow[titleIdx]) {
            results.push({
                title: cleanRow[titleIdx],
                date: cleanRow[dateIdx] || '',
                category: cleanRow[catIdx] || 'Lain-lain',
                content: cleanRow[contentIdx] || '',
                imageUrl: cleanRow[imgIdx] || ''
            });
        }
    }
    return results;
}

function renderAnnouncements(data) {
    // Save announcements globally for live indexing
    window.allAnnouncements = data;
    
    const grid = document.getElementById('announcementsGrid');
    const loading = document.getElementById('announcementsLoading');
    
    if (!grid || !loading) return;
    
    loading.style.display = 'none';
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #777; padding: 40px 0;">Tiada pengumuman buat masa terkini</div>';
        return;
    }
    
    // Limit to latest 3 to ensure spacing & avoid cluttering
    const itemsToShow = data.slice(0, 3);
    
    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'announcement-card reveal';
        
        const catClass = item.category.toLowerCase().trim();
        
        // Image section (only if image url is provided)
        let imgHtml = '';
        if (item.imageUrl) {
            imgHtml = `
                <div class="announcement-img-wrapper">
                    <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
                </div>
            `;
        }
        
        card.innerHTML = `
            ${imgHtml}
            <div class="announcement-body">
                <div class="announcement-meta">
                    <span class="announcement-category ${catClass}">${item.category}</span>
                    <span class="announcement-date">${item.date}</span>
                </div>
                <h3 class="announcement-title">${item.title}</h3>
                <p class="announcement-text">${item.content}</p>
            </div>
        `;
        
        grid.appendChild(card);
        
        // Make sure the scroll reveal observer watches this new element
        if (window.revealObserver) {
            window.revealObserver.observe(card);
        }
    });
}

function showAnnouncementsError() {
    const grid = document.getElementById('announcementsGrid');
    const loading = document.getElementById('announcementsLoading');
    
    if (!grid || !loading) return;
    
    loading.style.display = 'none';
    grid.innerHTML = `
        <div class="announcements-empty-state">
            <div class="empty-state-graphic">
                <i class="far fa-calendar-alt floating-icon"></i>
                <div class="graphic-glow"></div>
            </div>
            <h3>Nantikan Kemas Kini</h3>
            <p>Tiada pengumuman buat masa terkini. Kekal bersama kami untuk informasi dan berita terbaharu SMK Kamil.</p>
        </div>
    `;
}

/**
 * 5. Premium Dark Mode Toggle Logic
 */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (!themeToggleBtn) return;
    
    const icon = themeToggleBtn.querySelector('i');
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme, icon);
    
    // Toggle theme on click
    themeToggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        updateThemeIcon(nextTheme, icon);
    });
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    if (theme === 'dark') {
        iconElement.className = 'fas fa-sun';
        iconElement.style.color = '#ffcc00'; // Premium golden sun icon
    } else {
        iconElement.className = 'fas fa-moon';
        iconElement.style.color = ''; // Reset to default theme color
    }
}

/**
 * 6. Hero Image Slider Logic
 */
function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval = null;
    const slideDuration = 6000; // 6 seconds for comfortable reading
    
    // 6a. Generate dot indicators
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = `dot ${idx === 0 ? 'active' : ''}`;
            dot.setAttribute('data-slide', idx);
            dot.addEventListener('click', () => {
                goToSlide(idx);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        });
    }
    
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    
    // 6b. Show specific slide function
    function goToSlide(index) {
        // Remove active class from old slide and text content
        slides[currentSlide].classList.remove('active');
        const oldContent = slides[currentSlide].querySelector('.slide-content');
        if (oldContent) {
            oldContent.classList.remove('reveal', 'active');
        }
        
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
        }
        
        // Wrap index around
        currentSlide = (index + slides.length) % slides.length;
        
        // Add active class to new slide and animate content
        slides[currentSlide].classList.add('active');
        const newContent = slides[currentSlide].querySelector('.slide-content');
        if (newContent) {
            newContent.classList.add('reveal', 'active');
            // Trigger transition reveal using the window revealObserver if exists
            if (window.revealObserver) {
                window.revealObserver.observe(newContent);
            }
        }
        
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }
    
    // 6c. Navigation handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            resetAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            resetAutoplay();
        });
    }
    
    // 6d. Autoplay functionality
    function startAutoplay() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, slideDuration);
    }
    
    function stopAutoplay() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }
    
    // Reset timer on user interaction
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }
    
    // Pause autoplay on mouse hover so users can easily read slides
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    
    // Start initial autoplay
    startAutoplay();
}

/**
 * 7. Premium Vanilla JS SPA Router
 * Handles smooth cross-fade routing, back/forward history, and deep-linking scroll states
 */
function initRouter() {
    const views = {
        'home': document.getElementById('view-home'),
        'akademik': document.getElementById('view-akademik')
    };

    function navigateToView(viewName, scrollTargetId = null, pushState = true, shouldPulse = false) {
        const targetView = views[viewName];
        if (!targetView) return;

        // If target view is already active, just scroll if target exists
        if (targetView.classList.contains('active')) {
            if (scrollTargetId) {
                const targetElement = document.getElementById(scrollTargetId);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (shouldPulse) triggerTargetPulse(targetElement);
                    }, 50);
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        // Cross-fade views
        const currentActiveView = document.querySelector('.spa-view.active');
        if (currentActiveView) {
            currentActiveView.style.transition = 'opacity 0.25s ease';
            currentActiveView.style.opacity = '0';
            
            setTimeout(() => {
                currentActiveView.classList.remove('active');
                currentActiveView.classList.add('hidden');
                currentActiveView.style.opacity = '';
                currentActiveView.style.transition = '';
                
                showTargetView();
            }, 250);
        } else {
            showTargetView();
        }

        function showTargetView() {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
            
            // Trigger Intersection Observer for revealed elements inside the view
            targetView.querySelectorAll('.reveal').forEach(el => {
                if (window.revealObserver) {
                    window.revealObserver.observe(el);
                }
            });

            // Update Navigation Menu Active State
            updateNavActiveState(viewName);

            // Push state to browser history
            if (pushState) {
                const newHash = viewName === 'home' ? (scrollTargetId ? '#' + scrollTargetId : '#') : '#akademik';
                history.pushState({ view: viewName, scrollTarget: scrollTargetId }, "", newHash);
            }

            // Scroll to top or specific target element
            if (scrollTargetId) {
                setTimeout(() => {
                    const targetElement = document.getElementById(scrollTargetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (shouldPulse) triggerTargetPulse(targetElement);
                    }
                }, 100);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    function updateNavActiveState(activeViewName) {
        document.querySelectorAll('#mainNav a').forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === activeViewName && !link.hasAttribute('data-scroll')) {
                link.classList.add('active-route');
            } else {
                link.classList.remove('active-route');
            }
        });
    }

    function triggerTargetPulse(element) {
        document.querySelectorAll('.target-highlight-pulse').forEach(el => {
            el.classList.remove('target-highlight-pulse');
        });
        element.classList.add('target-highlight-pulse');
        setTimeout(() => {
            element.classList.remove('target-highlight-pulse');
        }, 1500);
    }

    // Intercept clicks on links that are part of router
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const route = link.getAttribute('data-route');
        const scrollTarget = link.getAttribute('data-scroll');

        if (route) {
            e.preventDefault();
            
            // Close mobile menu drawer if open
            if (menuToggle && mainNav) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }

            navigateToView(route, scrollTarget);
        }
    });

    // Handle browser back/forward buttons (History API popstate)
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.view) {
            navigateToView(e.state.view, e.state.scrollTarget, false);
        } else {
            // Fallback parsing hash
            parseHashAndNavigate(false);
        }
    });

    function parseHashAndNavigate(pushState = true) {
        const hash = window.location.hash || '';
        if (hash === '#akademik') {
            navigateToView('akademik', null, pushState);
        } else if (hash.startsWith('#search-akademik')) {
            navigateToView('akademik', hash.replace('#', ''), pushState);
        } else if (hash) {
            // Check if hash belongs to home view sections
            const targetId = hash.replace('#', '');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const closestView = targetElement.closest('.spa-view');
                if (closestView && closestView.id === 'view-akademik') {
                    navigateToView('akademik', targetId, pushState);
                } else {
                    navigateToView('home', targetId, pushState);
                }
            } else {
                navigateToView('home', null, pushState);
            }
        } else {
            navigateToView('home', null, pushState);
        }
    }

    // Initial navigation based on loaded hash
    parseHashAndNavigate(false);

    // Export navigation method globally for deep-linking search
    window.navigateToSPA = navigateToView;
}

// Initialise all systems on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    initTheme();
    initHeroSlider();
    initRouter();
});