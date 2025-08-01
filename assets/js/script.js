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
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

});

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

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchMediumBlogs);

// pre loader start
// function loader() {
//     document.querySelector('.loader-container').classList.add('fade-out');
// }
// function fadeOut() {
//     setInterval(loader, 500);
// }
// window.onload = fadeOut;
// pre loader end
