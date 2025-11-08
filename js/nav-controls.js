// Navigation controls for hamburger menu and verse toggle
(function() {
    const navMenu = document.getElementById('navMenu');
    const menuDropdown = document.getElementById('menuDropdown');
    const aboutLink = document.getElementById('aboutLink');
    const verseToggle = document.getElementById('verseToggle');

    // Toggle menu dropdown
    if (navMenu && menuDropdown) {
        navMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            menuDropdown.classList.toggle('visible');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuDropdown.contains(e.target) && e.target !== navMenu) {
                menuDropdown.classList.remove('visible');
            }
        });
    }

    // About link - navigate to about page
    if (aboutLink) {
        aboutLink.addEventListener('click', function() {
            window.location.href = 'about.htm';
        });
    }

    // Verse number toggle
    const verseOn = document.getElementById('verseOn');
    const verseOff = document.getElementById('verseOff');

    if (verseOn && verseOff) {
        // Load saved preference
        const savedPref = localStorage.getItem('showVerses');
        if (savedPref === 'true') {
            document.body.classList.add('show-verses');
            addVerseNumbers();
            verseOn.classList.add('active');
            verseOff.classList.remove('active');
        }

        // Handle ON click
        verseOn.addEventListener('click', function(e) {
            e.stopPropagation();
            document.body.classList.add('show-verses');
            localStorage.setItem('showVerses', 'true');
            addVerseNumbers();
            verseOn.classList.add('active');
            verseOff.classList.remove('active');
        });

        // Handle OFF click
        verseOff.addEventListener('click', function(e) {
            e.stopPropagation();
            document.body.classList.remove('show-verses');
            localStorage.setItem('showVerses', 'false');
            verseOff.classList.add('active');
            verseOn.classList.remove('active');
        });
    }

    // Add verse numbers (extract number from ID like "V1" -> "1")
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
