// Navigation controls for hamburger menu, verse toggle, and meditation mode
(function() {
    const SHOW_VERSES_KEY = 'showVerses';
    const MEDITATION_MODE_KEY = 'alcyMeditationMode';
    const MEDITATION_SCRIPT_PATH = 'js/meditation-mode.js';

    const navMenu = document.getElementById('navMenu');
    const menuDropdown = document.getElementById('menuDropdown');
    const aboutLink = document.getElementById('aboutLink');
    const navRibbon = document.getElementById('navRibbon');
    const sourceArticle = document.querySelector('article');

    const verseOn = document.getElementById('verseOn');
    const verseOff = document.getElementById('verseOff');

    let meditationScriptPromise = null;
    let meditationOn = null;
    let meditationOff = null;

    function isChapterPage() {
        return Boolean(
            navRibbon &&
            navRibbon.dataset &&
            navRibbon.dataset.book &&
            navRibbon.dataset.chapter &&
            sourceArticle
        );
    }

    if (navMenu && menuDropdown) {
        navMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            menuDropdown.classList.toggle('visible');
        });

        document.addEventListener('click', function(e) {
            if (!menuDropdown.contains(e.target) && e.target !== navMenu) {
                menuDropdown.classList.remove('visible');
            }
        });
    }

    if (aboutLink) {
        aboutLink.addEventListener('click', function() {
            window.location.href = 'about.htm';
        });
    }

    if (verseOn && verseOff) {
        const savedPref = localStorage.getItem(SHOW_VERSES_KEY);
        if (savedPref === 'true') {
            document.body.classList.add('show-verses');
            addVerseNumbers();
            verseOn.classList.add('active');
            verseOff.classList.remove('active');
        }

        verseOn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (document.body.classList.contains('meditation-mode')) {
                return;
            }
            document.body.classList.add('show-verses');
            localStorage.setItem(SHOW_VERSES_KEY, 'true');
            addVerseNumbers();
            verseOn.classList.add('active');
            verseOff.classList.remove('active');
        });

        verseOff.addEventListener('click', function(e) {
            e.stopPropagation();
            if (document.body.classList.contains('meditation-mode')) {
                return;
            }
            document.body.classList.remove('show-verses');
            localStorage.setItem(SHOW_VERSES_KEY, 'false');
            verseOff.classList.add('active');
            verseOn.classList.remove('active');
        });
    }

    if (menuDropdown && isChapterPage()) {
        addMeditationToggle();

        if (localStorage.getItem(MEDITATION_MODE_KEY) === 'true') {
            applyMeditationMode(true);
        }
    }

    function addMeditationToggle() {
        const meditationToggle = document.createElement('div');
        meditationToggle.className = 'menu-option meditation-toggle-row';
        meditationToggle.innerHTML = [
            'Meditation Mode',
            '<span class="toggle-options">',
            '<span class="toggle-choice" id="meditationOn">On</span>',
            '<span class="toggle-choice active" id="meditationOff">Off</span>',
            '</span>'
        ].join('');

        const verseToggle = menuDropdown.querySelector('.menu-option.verse-toggle');
        if (verseToggle) {
            menuDropdown.insertBefore(meditationToggle, verseToggle);
        } else {
            menuDropdown.appendChild(meditationToggle);
        }

        meditationOn = document.getElementById('meditationOn');
        meditationOff = document.getElementById('meditationOff');

        meditationOn.addEventListener('click', function(e) {
            e.stopPropagation();
            applyMeditationMode(true);
        });

        meditationOff.addEventListener('click', function(e) {
            e.stopPropagation();
            applyMeditationMode(false);
        });
    }

    async function applyMeditationMode(shouldEnable) {
        syncMeditationToggleState(shouldEnable);
        localStorage.setItem(MEDITATION_MODE_KEY, shouldEnable ? 'true' : 'false');

        if (!shouldEnable) {
            if (window.AlcyMeditationMode) {
                window.AlcyMeditationMode.disable();
            } else {
                document.body.classList.remove('meditation-mode');
            }
            return;
        }

        try {
            const meditationMode = await loadMeditationMode();
            if (!meditationMode || !meditationMode.isSupported()) {
                syncMeditationToggleState(false);
                localStorage.setItem(MEDITATION_MODE_KEY, 'false');
                return;
            }

            meditationMode.enable();
            syncMeditationToggleState(meditationMode.isActive());
        } catch (error) {
            console.error('Failed to initialize meditation mode', error);
            syncMeditationToggleState(false);
            localStorage.setItem(MEDITATION_MODE_KEY, 'false');
        }
    }

    function syncMeditationToggleState(isActive) {
        if (!meditationOn || !meditationOff) {
            return;
        }
        meditationOn.classList.toggle('active', isActive);
        meditationOff.classList.toggle('active', !isActive);
    }

    function loadMeditationMode() {
        if (window.AlcyMeditationMode) {
            return Promise.resolve(window.AlcyMeditationMode);
        }

        if (meditationScriptPromise) {
            return meditationScriptPromise;
        }

        meditationScriptPromise = new Promise(function(resolve, reject) {
            const script = document.createElement('script');
            script.src = MEDITATION_SCRIPT_PATH;
            script.async = true;
            script.onload = function() {
                if (window.AlcyMeditationMode) {
                    resolve(window.AlcyMeditationMode);
                    return;
                }
                reject(new Error('Meditation mode runtime was not registered'));
            };
            script.onerror = function() {
                reject(new Error('Unable to load meditation mode runtime'));
            };
            document.head.appendChild(script);
        });

        return meditationScriptPromise;
    }

    function addVerseNumbers() {
        const verses = document.querySelectorAll('span.verse');
        verses.forEach(function(verse) {
            const verseId = verse.getAttribute('id');
            if (verseId && verseId.startsWith('V')) {
                const verseNumber = verseId.substring(1);
                verse.setAttribute('data-verse-number', verseNumber);
            }
        });
    }
})();
