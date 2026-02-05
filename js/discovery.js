// JS Logic for Discovery Page
// Depends on: js/services/mock-data.js, js/services/api.js

document.addEventListener('DOMContentLoaded', async () => {
    const cardContainer = document.getElementById('cardContainer');
    const btnLike = document.getElementById('btnLike');
    const btnPass = document.getElementById('btnPass');

    let currentProfileIndex = 0;
    let profiles = [];

    async function init() {
        // Use the API Service
        profiles = await window.api.getProfiles();

        // AUTO-SEED CHECK: If using Firebase but no profiles found
        if (window.api.useFirebase && profiles.length === 0) {
            const seedBtn = document.createElement('button');
            seedBtn.innerText = "Initialiser la Base de Données (Premier Lancement)";
            seedBtn.className = "btn btn-primary";
            seedBtn.style.position = "absolute";
            seedBtn.style.zIndex = "1000";
            seedBtn.style.top = "50%";
            seedBtn.style.left = "50%";
            seedBtn.style.transform = "translate(-50%, -50%)";
            seedBtn.onclick = () => window.api.seedDatabase();
            document.body.appendChild(seedBtn);

            cardContainer.innerHTML = `<p style="text-align:center; padding:20px;">Aucun profil trouvé.<br>Cliquez sur le bouton pour remplir la base.</p>`;
            return;
        }

        renderCard(profiles[currentProfileIndex]);
    }

    function renderCard(profile) {
        cardContainer.innerHTML = ''; // Clear previous

        if (!profile) {
            cardContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Plus de profils pour le moment !</h3>
                    <p>Revenez plus tard pour découvrir de nouveaux agriculteurs.</p>
                </div>
            `;
            return;
        }

        const card = document.createElement('div');
        card.className = 'profile-card animate-fade-in';
        card.style.backgroundImage = `url('${profile.image}')`;

        const content = document.createElement('div');
        content.className = 'profile-content';

        const badges = profile.badges || [];
        const badgesHtml = badges.map(b => `<span class="badge">${b}</span>`).join('');

        content.innerHTML = `
            <div class="profile-info">
                <h2>${profile.name}</h2>
                <p class="profile-type">${profile.type} • ${profile.location}</p>
                <div class="badges-row">${badgesHtml}</div>
                <p class="profile-bio">"${profile.bio}"</p>
            </div>
        `;

        // Add linear gradient overlay
        const overlay = document.createElement('div');
        overlay.className = 'profile-overlay';

        card.appendChild(overlay);
        card.appendChild(content);
        cardContainer.appendChild(card);
    }

    function handleNext() {
        currentProfileIndex++;
        if (currentProfileIndex < profiles.length) {
            renderCard(profiles[currentProfileIndex]);
        } else {
            renderCard(null); // End of list
        }
    }

    // Event Listeners
    btnLike.addEventListener('click', async () => {
        const profile = profiles[currentProfileIndex];
        if (profile) {
            // Call API
            await window.api.likeProfile(profile.id);

            // Animation
            const card = document.querySelector('.profile-card');
            if (card) {
                card.style.transform = 'translateX(100px) rotate(10deg)';
                card.style.opacity = '0';
            }
            setTimeout(handleNext, 300);
        }
    });

    btnPass.addEventListener('click', async () => {
        const profile = profiles[currentProfileIndex];
        if (profile) {
            await window.api.passProfile(profile.id);

            const card = document.querySelector('.profile-card');
            if (card) {
                card.style.transform = 'translateX(-100px) rotate(-10deg)';
                card.style.opacity = '0';
            }
            setTimeout(handleNext, 300);
        }
    });

    // Filter Logic
    const filterModal = document.getElementById('filterModal');
    const btnOpenFilter = document.querySelector('.filters-icon');
    const btnCloseFilter = document.getElementById('closeFilter');
    const btnApplyFilters = document.getElementById('applyFilters');

    btnOpenFilter.addEventListener('click', () => {
        filterModal.style.display = 'flex';
    });

    btnCloseFilter.addEventListener('click', () => {
        filterModal.style.display = 'none';
    });

    // Close on click outside
    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) filterModal.style.display = 'none';
    });

    btnApplyFilters.addEventListener('click', async () => {
        const gender = document.getElementById('filterGender').value;
        const role = document.getElementById('filterRole').value;
        const location = document.getElementById('filterLocation').value;

        // Visual feedback
        btnApplyFilters.innerText = "Application...";

        // Reload profiles with filters
        profiles = await window.api.getProfiles({ gender, role, location });
        currentProfileIndex = 0;

        // Reset view
        cardContainer.innerHTML = '';
        renderCard(profiles[currentProfileIndex]); // Safe usage (updated profiles)

        btnApplyFilters.innerText = "Appliquer";
        filterModal.style.display = 'none';
    });

    // Start
    init();
});
