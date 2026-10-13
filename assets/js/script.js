$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        const href = $(this).attr('href');
        if (href && href.startsWith('#') && href.length > 1) {
            const target = $(href);
            if (target.length) {
                e.preventDefault();
                const headerHeight = $('header').outerHeight() || 65;
                const targetPosition = href === '#home' ? 0 : Math.max(0, target.offset().top - headerHeight);
                $('html, body').animate({
                    scrollTop: targetPosition,
                }, 500, 'linear');
            }
        }
    });

});

// --- BUG FINDINGS FILTER & FETCH LOGIC ---
const severityRank = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
};

let cachedFindingsDoc = null;

async function getFindingsDocument() {
    if (cachedFindingsDoc) return cachedFindingsDoc;
    try {
        const response = await fetch('./findings.html');
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const html = await response.text();
        const parser = new DOMParser();
        cachedFindingsDoc = parser.parseFromString(html, 'text/html');
        return cachedFindingsDoc;
    } catch (err) {
        console.warn('Could not fetch findings.html:', err);
        return null;
    }
}

// Handler for home page (index.html): dynamically displays the top 3 highest severity reports from findings.html
async function initHomeFindings() {
    const homeGrid = document.getElementById('home-findings-grid');
    if (!homeGrid) return; // Not on home page

    const doc = await getFindingsDocument();
    if (!doc) return; // Retain static fallback cards if fetch fails

    const allCards = Array.from(doc.querySelectorAll('#findings-grid .finding-card'));
    if (!allCards.length) return;

    // Sort all cards by severity rank (Critical -> High -> Medium -> Low)
    allCards.sort((a, b) => {
        const aSev = (a.getAttribute('data-severity') || '').toLowerCase();
        const bSev = (b.getAttribute('data-severity') || '').toLowerCase();
        return (severityRank[bSev] || 0) - (severityRank[aSev] || 0);
    });

    // Take top 3 highest severity reports
    const top3 = allCards.slice(0, 3);
    homeGrid.innerHTML = '';
    top3.forEach(card => {
        homeGrid.appendChild(card.cloneNode(true));
    });
}

// Handler for dedicated findings page (findings.html): shows all findings with filter controls
function initFindingsPage() {
    const findingsGrid = document.getElementById('findings-grid');
    if (!findingsGrid || document.getElementById('home-findings-grid')) return;

    function filterFindings() {
        const severity = ($('#filter-severity').val() || 'all').toLowerCase();
        const type = ($('#filter-type').val() || 'all').toLowerCase();
        const program = ($('#filter-program').val() || 'all').toLowerCase();

        const $cards = $('#findings-grid .finding-card');
        let visibleCount = 0;

        $cards.each(function () {
            const cardSeverity = ($(this).data('severity') || '').toString().toLowerCase();
            const cardType = ($(this).data('type') || '').toString().toLowerCase();
            const cardProgram = ($(this).data('program') || '').toString().toLowerCase();

            const matchSeverity = (severity === 'all' || cardSeverity === severity);
            const matchType = (type === 'all' || cardType === type);
            const matchProgram = (program === 'all' || cardProgram === program);

            if (matchSeverity && matchType && matchProgram) {
                $(this).fadeIn(200);
                visibleCount++;
            } else {
                $(this).hide();
            }
        });

        $('#findings-count').text(`Showing ${visibleCount} of ${$cards.length} findings`);

        if (visibleCount === 0) {
            $('#findings-no-results').fadeIn(200);
        } else {
            $('#findings-no-results').hide();
        }
    }

    $('#filter-severity, #filter-type, #filter-program').on('change', filterFindings);
    $('#reset-findings-filter, #clear-findings-filters').on('click', function () {
        $('#filter-severity').val('all');
        $('#filter-type').val('all');
        $('#filter-program').val('all');
        filterFindings();
    });
}

async function fetchMediumBlogs() {
    // --- CONFIGURATION ---
    const mediumUsername = 'yousuf06';
    const blogContainer = document.querySelector('.blog-section .box-container');

    // Determine the number of posts to show based on screen width
    // On screens 768px or less, show 4 posts. Otherwise, show 6.
    const postsToShow = window.innerWidth <= 768 ? 4 : 6;

    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${mediumUsername}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        blogContainer.innerHTML = ''; // Clear the "Loading..." message

        // Use the dynamic postsToShow variable to slice the array
        const recentPosts = data.items.slice(0, postsToShow);

        recentPosts.forEach(item => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.description;
            const descriptionText = tempDiv.textContent || tempDiv.innerText || "";
            const snippet = descriptionText.substring(0, 120) + '...';
            const pubDate = new Date(item.pubDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Blog Card HTML (no images)
            const blogCardHTML = `
                <div class="box">
                    <div class="blog-content">
                        <h3>
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                        </h3>
                        <p>${snippet}</p>
                    </div>
                    <div class="blog-meta">
                        <span>${pubDate}</span>
                        <span>${Math.ceil(descriptionText.length / 1500)} min read</span>
                    </div>
                </div>
            `;
            blogContainer.innerHTML += blogCardHTML;
        });

    } catch (error) {
        blogContainer.innerHTML = `<p class="loading-blogs" style="color: #ff6b6b;">Failed to load blog posts. Please try again later.</p>`;
        console.error("Error fetching Medium posts:", error);
    }
}

// Call functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchMediumBlogs();
    initHomeFindings();
    initFindingsPage();
});