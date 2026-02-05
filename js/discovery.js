// JS Logic for Discovery Page
document.addEventListener('DOMContentLoaded', async () => {
    const cardContainer = document.getElementById('cardContainer');
    const btnLike = document.getElementById('btnLike');
    const btnPass = document.getElementById('btnPass');

    let currentProfileIndex = 0;
    let profiles = [];

    async function init() {
        try {
            // Use the API Service
            profiles = await window.api.getProfiles();

            // AUTO-SEED CHECK
            if (window.api.useFirebase && (!profiles || profiles.length === 0)) {
                showSeedButton();
                return;
            }

            renderCard(profiles[currentProfileIndex]);
        } catch (e) {
            console.error(e);
            cardContainer.innerHTML = '<p>Erreur chargement profils.</p>';
        }
    }

    function showSeedButton() {
        const seedBtn = document.createElement('button');
        seedBtn.innerText = "Initialiser la Base de Données";
        seedBtn.className = "btn btn-primary";
        seedBtn.style.position = "absolute";
        seedBtn.style.zIndex = "1000";
        seedBtn.style.top = "50%";
        seedBtn.style.left = "50%";
        seedBtn.style.transform = "translate(-50%, -50%)";
        seedBtn.onclick = () => window.api.seedDatabase();
        document.body.appendChild(seedBtn);
        cardContainer.innerHTML = `<p style="text-align:center; padding:20px;">Aucun profil.<br>Initialisez la base.</p>`;
    }

    function renderCard(profile) {
        cardContainer.innerHTML = ''; // Clear previous

        if (!profile) {
            cardContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Plus de profils !</h3>
                    <p>Revenez plus tard.</p>
                </div>
            `;
            return;
        }

        const card = document.createElement('div');
        card.className = 'profile-card animate-fade-in';
        // Handle various image property names
        const img = profile.image || profile.avatar || 'assets/default-avatar.png';
        card.style.backgroundImage = `url('${img}')`;

        const content = document.createElement('div');
        content.className = 'profile-content';

        const badges = profile.badges || [];
        const badgesHtml = badges.map(b => `<span class="badge">${b}</span>`).join('');

        content.innerHTML = `
            <div class="profile-info">
                <h2>${profile.name || profile.firstName}</h2>
                <p class="profile-type">${profile.type || 'Agriculteur'} • ${profile.location || 'France'}</p>
                <div class="badges-row">${badgesHtml}</div>
                <p class="profile-bio">"${profile.bio || '...'}"</p>
            </div>
        `;

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

    // --- BUTTON EVENT LISTENERS ---

    // LIKE
    btnLike.addEventListener('click', async () => {
        const profile = profiles[currentProfileIndex];
        if (!profile) return;

        // Visual Animation First
        const card = document.querySelector('.profile-card');
        if (card) {
            card.style.transform = 'translate(100vw, 50px) rotate(30deg)';
            card.style.opacity = '0';
        }

        // Logic
        try {
            const result = await window.api.likeProfile(profile.id);
            console.log("Like Result:", result);

            if (result && result.status === 'MATCH') {
                // Use a slight timeout to let the animation start
                setTimeout(() => {
                    alert(`❤️ IT'S A MATCH ! ❤️\n\nVous avez matché avec ${profile.firstName || profile.name} !`);
                }, 300);
            }
        } catch (e) {
            console.error("Like error:", e);
        }

        // Next card
        setTimeout(handleNext, 300);
    });

    // PASS
    btnPass.addEventListener('click', async () => {
        const profile = profiles[currentProfileIndex];
        if (!profile) return;

        const card = document.querySelector('.profile-card');
        if (card) {
            card.style.transform = 'translate(-100vw, 50px) rotate(-30deg)';
            card.style.opacity = '0';
        }

        await window.api.passProfile(profile.id);
        setTimeout(handleNext, 300);
    });

    // Filter Logic
    const filterModal = document.getElementById('filterModal');
    const btnOpenFilter = document.querySelector('.filters-icon');
    if (btnOpenFilter) {
        // ... (Filter logic kept simple or omitted if standard)
        btnOpenFilter.addEventListener('click', () => { if (filterModal) filterModal.style.display = 'flex'; });
        const closeBtn = document.getElementById('closeFilter');
        if (closeBtn) closeBtn.addEventListener('click', () => { filterModal.style.display = 'none'; });
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', async () => {
                const gender = document.getElementById('filterGender').value;
                const role = document.getElementById('filterRole').value;
                const location = document.getElementById('filterLocation').value;
                applyBtn.innerText = "Application...";
                profiles = await window.api.getProfiles({ gender, role, location });
                currentProfileIndex = 0;
                renderCard(profiles[currentProfileIndex]);
                applyBtn.innerText = "Appliquer";
                filterModal.style.display = 'none';
            });
        }
    }

    // Start
    init();
});
