// Logic for Messages Page
document.addEventListener('DOMContentLoaded', async () => {
    const messageList = document.getElementById('messageList');
    // Admirers list might be wrapped in the section, ensure we target the list itself
    const admirersList = document.getElementById('admirersList');

    // 1. Load Admirers
    try {
        if (window.api && window.api.getAdmirers) {
            const admirers = await window.api.getAdmirers();
            renderAdmirers(admirers);
        } else {
            console.error("API getAdmirers not found");
        }
    } catch (e) {
        console.error("Error loading admirers:", e);
        if (admirersList) admirersList.innerHTML = '<p style="font-size:0.8rem; color:#999; padding:10px;">Erreur chargement</p>';
    }

    // 2. Load Conversations (Matches)
    try {
        // Use getMatches if available, generic fallback if needed (though we expect getMatches now)
        const matchMethod = window.api.getMatches ? window.api.getMatches.bind(window.api) : window.api.getConversations.bind(window.api);

        if (matchMethod) {
            const conversations = await matchMethod();
            renderConversations(conversations);
        } else {
            console.warn("No match fetching method found on API");
        }
    } catch (e) {
        console.error("Error loading conversations:", e);
        messageList.innerHTML = '<p style="text-align:center; margin-top:20px; color:#999;">Erreur chargement discussions</p>';
    }

    function renderAdmirers(admirers) {
        if (!admirersList) return;

        admirersList.innerHTML = '';
        if (!admirers || admirers.length === 0) {
            admirersList.innerHTML = '<p style="font-size:0.9rem; color:#999; padding: 10px;">Personne pour le moment...</p>';
            return;
        }

        admirers.forEach(adm => {
            const el = document.createElement('div');
            el.className = 'admirer-item';
            // Use image or avatar property safely
            const img = adm.image || adm.avatar || 'assets/default-avatar.png';
            el.innerHTML = `
                <div class="admirer-avatar" style="background-image: url('${img}');"></div>
                <span class="admirer-name">${adm.firstName || 'Inconnu'}</span>
            `;
            el.onclick = () => alert(`C'est ${adm.firstName} ! Allez dans Découverte pour le/la retrouver.`);
            admirersList.appendChild(el);
        });
    }

    function renderConversations(conversations) {
        messageList.innerHTML = ''; // Clear

        if (!conversations || conversations.length === 0) {
            messageList.innerHTML = `
                <div class="empty-state" style="border:none; padding-top:20px;">
                    <p>Aucune discussion.</p>
                    <p style="font-size: 0.9rem;">Swipez pour matcher !</p>
                </div>
            `;
            return;
        }

        conversations.forEach(conv => {
            // Support both data structures (direct object or nested otherUser)
            const otherUser = conv.otherUser || conv;
            const name = otherUser.firstName || otherUser.name || 'Utilisateur';
            const img = otherUser.image || otherUser.avatar || 'assets/default-avatar.png';
            const lastMsg = conv.lastMessage || conv.preview || "Nouvelle conversation";

            const el = document.createElement('div');
            el.className = `message-item`;
            el.innerHTML = `
                <div class="avatar" style="background-image: url('${img}'); background-size: cover; background-position: center;"></div>
                <div class="message-content">
                    <div class="message-header">
                        <h3>${name}</h3>
                        <span class="message-time">${formatTime(conv.lastMessageTime || conv.time)}</span>
                    </div>
                    <p class="message-preview">${lastMsg}</p>
                </div>
            `;

            el.onclick = () => {
                // Navigate to Chat Page
                const encodedName = encodeURIComponent(name);
                const encodedImg = encodeURIComponent(img);
                window.location.href = `chat.html?id=${conv.id}&name=${encodedName}&img=${encodedImg}`;
            };
            messageList.appendChild(el);
        });
    }

    function formatTime(timestamp) {
        if (!timestamp) return '';
        try {
            // Handle Firestore Timestamp
            if (timestamp.toDate) return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Handle Date object
            if (timestamp instanceof Date) return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Handle string
            return timestamp;
        } catch (e) {
            return '';
        }
    }
});
