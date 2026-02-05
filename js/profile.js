document.addEventListener('DOMContentLoaded', async () => {
    console.log("Profile Script Loaded");

    // Buttons & UI Elements
    const btnEditProfile = document.getElementById('btnOpenEdit');
    const btnSettings = document.getElementById('btnOpenSettings');

    // Modals
    const editModal = document.getElementById('editProfileModal');
    const settingsModal = document.getElementById('settingsModal');

    // Close Buttons
    const closeEdit = document.getElementById('closeEditProfile');
    const closeSettings = document.getElementById('closeSettings');

    // Save Buttons
    const btnSaveProfile = document.getElementById('saveProfile');

    let currentUserData = {};

    // --- 1. Load Profile Data ---
    if (window.api && window.api.useFirebase) {
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const doc = await window.firebaseDb.collection('profiles').doc(user.uid).get();
                    if (doc.exists) {
                        currentUserData = doc.data();
                        populateProfile(currentUserData, user.email);
                    }
                } catch (e) { console.error("Error fetching profile:", e); }
            } else {
                console.log("User not logged in, redirecting...");
                // window.location.href = 'index.html'; 
            }
        });
    } else {
        // Mock Data
        console.log("Using Mock Data");
        currentUserData = {
            name: "Julien Vignau",
            bio: "Passionné par l'agro-écologie et les grands espaces. Je cherche quelqu'un pour partager ma ferme dans le Gers.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            location: "Auch, Gers",
            activity: "Éleveur Ovin",
            dob: "1995-05-15",
            banner: "https://images.unsplash.com/photo-1595960009667-fe6240292728?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", // Default Banner
            stats: { views: 254, likes: 42, matches: 8 }
        };
        populateProfile(currentUserData, "julien@exemple.com");
    }

    // --- 2. Populate UI ---
    function populateProfile(data, email) {
        document.getElementById('myName').innerText = data.name || "Utilisateur";
        document.getElementById('myBio').innerText = data.bio || "Aucune bio renseignée.";

        const avatarUrl = data.image || "assets/default-avatar.png";
        document.getElementById('myAvatar').style.backgroundImage = `url('${avatarUrl}')`;

        if (data.banner) {
            document.getElementById('coverImage').style.backgroundImage = `url('${data.banner}')`;
        }

        // Details
        document.getElementById('infoLoc').innerText = data.location || "Non renseigné";
        document.getElementById('infoRole').innerText = data.activity || data.type || "Non renseigné";
        document.getElementById('infoEmail').innerText = email;

        // Calculate Age
        if (data.dob) {
            const age = calculateAge(data.dob);
            document.getElementById('infoAge').innerText = `${age} ans`;
        } else {
            document.getElementById('infoAge').innerText = "Age inconnu";
        }

        // Stats
        const stats = data.stats || { views: 0, likes: 0, matches: 0 };
        document.getElementById('statViews').innerText = stats.views;
        document.getElementById('statLikes').innerText = stats.likes;
        document.getElementById('statMatches').innerText = stats.matches;
    }

    function calculateAge(dobString) {
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    }

    // --- 3. Event Listeners ---

    // Avatar Upload Logic
    const editAvatarFile = document.getElementById('editAvatarFile');
    const previewAvatar = document.getElementById('previewAvatar');
    let newAvatarFile = null;

    if (editAvatarFile && previewAvatar) {
        editAvatarFile.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                newAvatarFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewAvatar.style.backgroundImage = `url('${e.target.result}')`;
                }
                reader.readAsDataURL(file);
            }
        };
    }

    // Banner Selection Logic
    const bannerOptions = document.querySelectorAll('.banner-option');
    let selectedBannerUrl = currentUserData.banner || null;

    bannerOptions.forEach(option => {
        option.onclick = () => {
            // Remove active class from all
            bannerOptions.forEach(opt => opt.classList.remove('selected'));
            // Add to clicked
            option.classList.add('selected');
            selectedBannerUrl = option.dataset.url;
            console.log("Selected banner:", selectedBannerUrl);
        };
    });


    // Open Edit Modal
    if (btnEditProfile) {
        btnEditProfile.onclick = () => {
            console.log("Edit Button Clicked");
            document.getElementById('editName').value = currentUserData.name || "";
            document.getElementById('editBio').value = currentUserData.bio || "";
            document.getElementById('editLoc').value = currentUserData.location || "";
            document.getElementById('editActivity').value = currentUserData.activity || currentUserData.type || "";
            document.getElementById('editDob').value = currentUserData.dob || "1995-01-01";

            // Init Avatar Preview
            const currentAvatar = currentUserData.image || "assets/default-avatar.png";
            if (previewAvatar) previewAvatar.style.backgroundImage = `url('${currentAvatar}')`;

            // Init Banner Selection
            selectedBannerUrl = currentUserData.banner || null;
            bannerOptions.forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.url === selectedBannerUrl) {
                    opt.classList.add('selected');
                }
            });

            if (editModal) editModal.style.display = 'flex';
        };
    } else {
        console.error("Edit Button not found in DOM");
    }

    // Open Settings Modal
    if (btnSettings) {
        btnSettings.onclick = () => {
            if (settingsModal) settingsModal.style.display = 'flex';
        };
    }

    // Close Modals
    if (closeEdit) closeEdit.onclick = () => editModal.style.display = 'none';
    if (closeSettings) closeSettings.onclick = () => settingsModal.style.display = 'none';

    // Close on outside click
    window.onclick = (event) => {
        if (event.target == editModal) editModal.style.display = 'none';
        if (event.target == settingsModal) settingsModal.style.display = 'none';
    };

    // Save Profile
    if (btnSaveProfile) {
        btnSaveProfile.onclick = async () => {
            const newName = document.getElementById('editName').value;
            const newBio = document.getElementById('editBio').value;
            const newLoc = document.getElementById('editLoc').value;
            const newActivity = document.getElementById('editActivity').value;
            const newDob = document.getElementById('editDob').value;

            // Optimistic Update
            document.getElementById('myName').innerText = newName;
            document.getElementById('myBio').innerText = newBio;
            document.getElementById('infoLoc').innerText = newLoc;
            document.getElementById('infoRole').innerText = newActivity;

            if (newDob) {
                const age = calculateAge(newDob);
                document.getElementById('infoAge').innerText = `${age} ans`;
            }

            // Handle Avatar Update
            let finalAvatar = currentUserData.image;
            if (previewAvatar && previewAvatar.style.backgroundImage) {
                const styleUrl = previewAvatar.style.backgroundImage;
                // Regex to capture url content: url("...") or url('...') or url(...)
                const match = styleUrl.match(/url\(["']?(.*?)["']?\)/);
                if (match && match[1]) {
                    finalAvatar = match[1];
                }

                // Update DOM immediately if we found a URL
                if (finalAvatar) {
                    document.getElementById('myAvatar').style.backgroundImage = `url('${finalAvatar}')`;
                }
            }

            // Handle Banner Update
            let finalBanner = selectedBannerUrl || currentUserData.banner;
            if (finalBanner) {
                document.getElementById('coverImage').style.backgroundImage = `url('${finalBanner}')`;
            }

            // Update local state
            currentUserData = {
                ...currentUserData,
                name: newName,
                bio: newBio,
                location: newLoc,
                activity: newActivity,
                dob: newDob,
                image: finalAvatar,
                banner: finalBanner
            };

            if (window.api && window.api.useFirebase && window.firebaseAuth.currentUser) {
                try {
                    await window.firebaseDb.collection('profiles').doc(window.firebaseAuth.currentUser.uid).update({
                        name: newName,
                        bio: newBio,
                        location: newLoc,
                        type: newActivity,
                        dob: newDob,
                        banner: finalBanner,
                        image: finalAvatar
                    });
                } catch (e) { console.error("Error saving profile", e); alert("Erreur de sauvegarde"); }
            }

            if (editModal) editModal.style.display = 'none';
        };
    }

    // Gallery "Add Photo" Logic
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        const addPhotoBtn = galleryGrid.querySelector('.add-photo');
        if (addPhotoBtn) {
            addPhotoBtn.onclick = () => {
                const mockImages = [
                    'https://images.unsplash.com/photo-1595325510006-03c09b699c27?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1549557404-5f50ba59a295?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1587334274328-64186a80aeee?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
                ];
                const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];

                const newDiv = document.createElement('div');
                newDiv.className = 'gallery-item';
                newDiv.style.backgroundImage = `url('${randomImg}')`;
                newDiv.style.animation = 'fadeIn 0.5s';

                galleryGrid.insertBefore(newDiv, addPhotoBtn.nextSibling);
            };
        }
    }

    // Settings Toggles Logic (Mock Save)
    document.querySelectorAll('.switch input').forEach(toggle => {
        toggle.onchange = (e) => {
            console.log(`Setting ${e.target.id} changed to ${e.target.checked}`);
        };
    });

    // Menu Items Clicks
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item) => {
        if (!item.textContent.includes('Déconnexion')) {
            item.onclick = () => {
                if ((item.textContent.includes('Notifications') || item.textContent.includes('Confidentialité')) && settingsModal) {
                    settingsModal.style.display = 'flex';
                }
            };
        }
    });

});

async function handleLogout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        if (window.api) await window.api.logout();
        window.location.href = 'index.html';
    }
}
