// JS Logic for Messages Page
// Depends on: js/services/mock-data.js, js/services/api.js

document.addEventListener('DOMContentLoaded', async () => {
    const messageList = document.getElementById('messageList');

    async function init() {
        // Use the API Service
        const messages = await window.api.getConversations();
        renderMessages(messages);
    }

    function renderMessages(messages) {
        messageList.innerHTML = '';

        if (messages.length === 0) {
            messageList.innerHTML = `
                <div class="empty-state">
                    <p>Aucune discussion pour le moment. Allez swiper !</p>
                </div>
            `;
            return;
        }

        messages.forEach(msg => {
            const item = document.createElement('div');
            item.className = `message-item ${msg.unread ? 'unread' : ''}`;

            item.innerHTML = `
                <div class="avatar" style="background-image: url('${msg.avatar}')"></div>
                <div class="message-content">
                    <div class="message-header">
                        <h3>${msg.sender}</h3>
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <p class="message-preview">${msg.lastMessage}</p>
                </div>
            `;

            // Interaction sim
            item.addEventListener('click', () => {
                console.log(`Opening chat ${msg.id}`);
                // Simple navigation simulation could go here
                // window.location.href = `chat.html?id=${msg.id}`;
            });

            messageList.appendChild(item);
        });
    }

    init();
});
