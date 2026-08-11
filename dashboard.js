/* ===================================
   FOREVER HUB DASHBOARD - SEARCH
=================================== */

document.addEventListener('DOMContentLoaded', function () {

    const searchInput = document.getElementById('appSearch');
    const appCards = document.querySelectorAll('.app-card');
    const noResults = document.getElementById('noResults');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {

        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        appCards.forEach(function (card) {

            // Search against the data-name attribute, falling back to
            // the card's visible title text if it's missing.
            const searchText = (
                card.dataset.name ||
                card.querySelector('h2')?.textContent ||
                ''
            ).toLowerCase();

            const isMatch = searchText.includes(query);

            card.style.display = isMatch ? '' : 'none';

            if (isMatch) visibleCount++;
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    });

});
