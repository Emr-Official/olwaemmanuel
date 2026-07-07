import clientData from './data.js';

const app = document.getElementById('app');
const galleryOverlay = document.getElementById('gallery-overlay');
const galleryContent = document.getElementById('gallery-content');
const galleryTitle = document.getElementById('gallery-title');
const closeGallery = document.getElementById('close-gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const backToTop = document.getElementById('back-to-top');

// --- Routing ---
function handleRoute() {
    const hash = window.location.hash || '#home';
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === hash);
    });

    if (hash === '#home') {
        renderHome();
    } else if (hash === '#projects') {
        renderProjects();
    }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

// --- Pages ---

function renderHome() {
    app.innerHTML = `
        <section class="hero" id="home">
            <div class="hero-content">
                <h1>OLWA<br>EMMANUEL</h1>
                <p>Creator</p>
                <div class="hero-btns">
                    <a href="#projects" class="btn">GALLERY</a>
                    <a href="#contact" class="btn btn-outline">CONTACT</a>
                </div>
            </div>
            <div class="hero-image">
                <div class="image-container">
                    <img src="me.png" alt="Olwa Emmanuel">
                </div>
            </div>
        </section>
    `;
}

function renderProjects() {
    let clientCards = clientData.map((client, index) => `
        <div class="client-card" data-index="${index}">
            <div class="card-thumbnail">
                <img src="${client.logo}" alt="${client.name}" onerror="this.src='https://via.placeholder.com/300x300?text=${client.name}'">
            </div>
            <div class="card-info">
                ${client.name}
            </div>
        </div>
    `).join('');

    app.innerHTML = `
        <section class="section" id="projects">
            <div class="section-header">
                <h2>Clients</h2>
                <p>These are some of my clients and the work I did for/with them.</p>
            </div>
            <div class="client-grid">
                ${clientCards}
            </div>
        </section>
    `;

    // Add click events to cards
    document.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-index');
            openGallery(clientData[index]);
        });
    });
}

// --- Gallery Logic ---

function openGallery(client) {
    galleryTitle.innerText = client.name;
    galleryContent.innerHTML = '';

    client.files.forEach(file => {
        const filePath = `${client.folder}/${file}`;
        const isVideo = file.toLowerCase().endsWith('.mp4');
        
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = filePath;
            video.muted = true;
            video.loop = true;
            video.controls = true; 
            
            // Hover logic
            video.addEventListener('mouseenter', () => {
                // Pause all other videos first
                document.querySelectorAll('video').forEach(v => {
                    if (v !== video) v.pause();
                });
                video.play();
            });

            video.addEventListener('mouseleave', () => {
                video.pause();
            });

            // Click to fullscreen
            video.addEventListener('click', () => {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) { /* Safari */
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) { /* IE11 */
                    video.msRequestFullscreen();
                }
            });

            // Smart Muting: Only one unmuted at a time
            video.addEventListener('volumechange', () => {
                if (!video.muted) {
                    document.querySelectorAll('video').forEach(v => {
                        if (v !== video) v.muted = true;
                    });
                }
            });

            // Video Lightbox Logic for 'X' exit support
            video.addEventListener('click', (e) => {
                // If not already in fullscreen, maybe open in custom lightbox for X support
                // For direct request, we use fullscreen. For 'X' exit, we need a lightbox.
                // User asked for an 'X' for exiting video.
                openVideoLightbox(filePath);
                e.preventDefault();
            });

            item.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = filePath;
            img.alt = file;
            img.loading = 'lazy';
            img.addEventListener('click', () => openLightbox(filePath));
            item.appendChild(img);
        }
        
        galleryContent.appendChild(item);
    });

    galleryOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

// --- Lightbox Logic ---

const lightboxVideo = document.getElementById('lightbox-video');

function openLightbox(src) {
    lightboxImg.src = src;
    lightboxImg.style.display = 'block';
    lightboxVideo.style.display = 'none';
    lightbox.style.display = 'flex';
}

function openVideoLightbox(src) {
    lightboxVideo.src = src;
    lightboxVideo.style.display = 'block';
    lightboxImg.style.display = 'none';
    lightboxVideo.play();
    lightbox.style.display = 'flex';
}

lightboxClose.addEventListener('click', () => {
    lightbox.style.display = 'none';
    lightboxVideo.pause();
    lightboxVideo.src = '';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
        lightboxVideo.pause();
        lightboxVideo.src = '';
    }
});

closeGallery.addEventListener('click', () => {
    galleryOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    backToTop.style.display = 'none'; // Hide button on close
});

// --- Back to Top Logic ---

galleryOverlay.addEventListener('scroll', () => {
    if (galleryOverlay.scrollTop > 500) {
        backToTop.style.display = 'flex';
    } else {
        backToTop.style.display = 'none';
    }
});

backToTop.addEventListener('click', () => {
    galleryOverlay.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Close on escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        galleryOverlay.style.display = 'none';
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});
