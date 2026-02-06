// JS Logic for Discovery Page
document.addEventListener('DOMContentLoaded', async () => {
    const cardContainer = document.getElementById('cardContainer');
    const btnLike = document.getElementById('btnLike');
    const btnPass = document.getElementById('btnPass');
    const btnSuper = document.getElementById('btnSuper'); // Optional super like

    // Match Modal Elements
    const matchModal = document.getElementById('matchModal');
    const matchName = document.getElementById('matchName');
    const myMatchAvatar = document.getElementById('myMatchAvatar');
    const theirMatchAvatar = document.getElementById('theirMatchAvatar');
    const btnCloseMatch = document.getElementById('btnCloseMatch');
    const btnSendMessage = document.getElementById('btnSendMessage');

    let currentProfileIndex = 0;
    let profiles = [];
    let currentUser = null;

    // --- 1. init ---
    async function init() {
        try {
            // Get Current User (for match avatar)
            if (window.api.useFirebase && window.firebaseAuth.currentUser) {
                // Try to fetch real profile image
                const uid = window.firebaseAuth.currentUser.uid;
                const doc = await window.firebaseDb.collection('profiles').doc(uid).get();
                if (doc.exists) currentUser = doc.data();
            }
            if (!currentUser) {
                // Fallback mock
                currentUser = { image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" };
            }

            // Fetch Profiles
            profiles = await window.api.getProfiles();

            // AUTO-SEED CHECK
            if (window.api.useFirebase && (!profiles || profiles.length === 0)) {
                showSeedButton();
                return;
            }

            renderCard(profiles[currentProfileIndex]);
        } catch (e) {
            console.error(e);
            cardContainer.innerHTML = '<div class="empty-state"><p>Erreur chargement profils.</p></div>';
        }
    }

    function showSeedButton() {
        cardContainer.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'empty-state';
        div.innerHTML = `
            <h3>Base de données vide</h3>
            <p>Cliquez pour générer des profils.</p>
            <button class="btn btn-primary" id="seedBtn" style="margin-top:20px;">Générer</button>
        `;
        cardContainer.appendChild(div);

        document.getElementById('seedBtn').onclick = async () => {
            await window.api.seedDatabase();
            window.location.reload();
        };
    }

    // --- 2. Render Card ---
    function renderCard(profile) {
        cardContainer.innerHTML = ''; // Clear previous

        if (!profile) {
            cardContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding-top: 100px; opacity: 0.6;">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <h3>Plus de profils !</h3>
                    <p>Revenez plus tard pour découvrir<br>de nouvelles personnes.</p>
                </div>
            `;
            return;
        }

        const card = document.createElement('div');
        card.className = 'profile-card animate-fade-in';

        // Handle various image property names
        const img = profile.image || profile.avatar || 'assets/default-avatar.png';
        card.style.backgroundImage = `url('${img}')`;

        const badges = profile.badges || [];
        // Only show first 3 badges
        const badgesHtml = badges.slice(0, 3).map(b => `<span class="badge">${b}</span>`).join('');

        card.innerHTML = `
            <div class="profile-overlay"></div>
            <div class="profile-content">
                <h2>${profile.name || profile.firstName}, <span style="font-size:1.5rem; font-weight:400;">${profile.age || 25}</span></h2>
                <p class="profile-type">
                    📍 ${profile.location || 'France'} • ${profile.type || 'Agriculteur'}
                </p>
                <div class="badges-row">${badgesHtml}</div>
                <p class="profile-bio">"${profile.bio || '...'}"</p>
            </div>
        `;

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

    // --- 3. Match Logic ---
    function showMatch(profile) {
        // Set info
        matchName.innerText = profile.name || profile.firstName;

        const myImg = currentUser.image || "assets/default-avatar.png";
        const theirImg = profile.image || profile.avatar || "assets/default-avatar.png";

        myMatchAvatar.style.backgroundImage = `url('${myImg}')`;
        theirMatchAvatar.style.backgroundImage = `url('${theirImg}')`;

        // Show Modal
        matchModal.style.display = 'flex';

        // Handlers
        btnCloseMatch.onclick = () => {
            matchModal.style.display = 'none';
            handleNext(); // Move next after closing
        };
        btnSendMessage.onclick = () => {
            // Ideally go to chat with this user
            window.location.href = 'messages.html';
        };
    }

    // --- 4. Event Listeners ---

    // LIKE
    btnLike.addEventListener('click', async () => {
        const profile = profiles[currentProfileIndex];
        if (!profile) return;

        // Visual Animation
        const card = document.querySelector('.profile-card');
        if (card) {
            card.style.transition = 'transform 0.5s ease, opacity 0.5s';
            card.style.transform = 'translate(150%, 20px) rotate(20deg)';
            card.style.opacity = '0';
        }

        try {
            const result = await window.api.likeProfile(profile.id);
            console.log("Like Result:", result);

            if (result && result.status === 'MATCH') {
                // Show match modal logic
                setTimeout(() => showMatch(profile), 300);
            } else {
                // Valid like but no match yet
                setTimeout(handleNext, 300);
            }
        } catch (e) {
            console.error("Like error:", e);
            setTimeout(handleNext, 300);
        }
    });

    // PASS
    btnPass.addEventListener('click', async () => {
        const profile = profiles[currentProfileIndex];
        if (!profile) return;

        const card = document.querySelector('.profile-card');
        if (card) {
            card.style.transition = 'transform 0.5s ease, opacity 0.5s';
            card.style.transform = 'translate(-150%, 20px) rotate(-20deg)';
            card.style.opacity = '0';
        }

        await window.api.passProfile(profile.id);
        setTimeout(handleNext, 300);
    });

    // FILTER LOGIC
    const btnOpenFilter = document.getElementById('btnOpenFilter');
    const filterModal = document.getElementById('filterModal');
    const closeFilter = document.getElementById('closeFilter');
    const applyFilters = document.getElementById('applyFilters');

    if (btnOpenFilter) {
        btnOpenFilter.onclick = () => filterModal.style.display = 'flex';
    }
    if (closeFilter) {
        closeFilter.onclick = () => filterModal.style.display = 'none';
        // Close on outside click
        window.onclick = (event) => {
            if (event.target == filterModal) filterModal.style.display = 'none';
        };
    }

    if (applyFilters) {
        applyFilters.onclick = async () => {
            const gender = document.getElementById('filterGender').value;
            const role = document.getElementById('filterRole').value;
            const location = document.getElementById('filterLocation').value;

            applyFilters.innerText = "Recherche...";

            profiles = await window.api.getProfiles({ gender, role, location });
            currentProfileIndex = 0;
            renderCard(profiles[currentProfileIndex]);

            applyFilters.innerText = "Appliquer";
            filterModal.style.display = 'none';
        };
    }

    // Start
    init();
});
