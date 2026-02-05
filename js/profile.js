document.addEventListener('DOMContentLoaded', async () => {
    // Check auth state
    if (window.api.useFirebase) {
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                // Fetch profile
                try {
                    const doc = await window.firebaseDb.collection('profiles').doc(user.uid).get();
                    if (doc.exists) {
                        const data = doc.data();
                        populateProfile(data, user.email);
                    }
                } catch (e) { console.error(e); }
            } else {
                // Not logged in
                window.location.href = 'index.html';
            }
        });
    } else {
        // Mock
        populateProfile({
            name: "Julien Vignau",
            bio: "Passionné par l'agro-écologie et les grands espaces. Je cherche quelqu'un pour partager ma ferme dans le Gers.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
            location: "Auch, Gers",
            type: "Éleveur Ovin",
            stats: { views: 254, likes: 42, matches: 8 }
        }, "julien@exemple.com");
    }

    function populateProfile(data, email) {
        document.getElementById('myName').innerText = data.name || "Utilisateur";
        document.getElementById('myBio').innerText = data.bio || "Aucune bio renseignée.";

        const avatarUrl = data.image || "assets/default-avatar.png";
        document.getElementById('myAvatar').style.backgroundImage = `url('${avatarUrl}')`;

        // Details
        document.getElementById('infoLoc').innerText = data.location || "Non renseigné";
        document.getElementById('infoRole').innerText = data.type || "Non renseigné";
        document.getElementById('infoEmail').innerText = email;

        // Stats (Mock logic for now if not in data)
        const stats = data.stats || { views: Math.floor(Math.random() * 500), likes: Math.floor(Math.random() * 50), matches: Math.floor(Math.random() * 10) };
        document.getElementById('statViews').innerText = stats.views;
        document.getElementById('statLikes').innerText = stats.likes;
        document.getElementById('statMatches').innerText = stats.matches;
    }
});

async function handleLogout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        await window.api.logout();
        window.location.href = 'index.html';
    }
}
