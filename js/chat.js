document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Conversation ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');
    const otherUserName = urlParams.get('name'); // Simple way to pass data for MVP
    const otherUserImg = urlParams.get('img');

    if (!conversationId) {
        alert("Erreur : Conversation introuvable");
        window.location.href = 'messages.html';
        return;
    }

    // 2. Setup UI
    const chatName = document.getElementById('chatName');
    const chatAvatar = document.getElementById('chatAvatar');
    const messageList = document.getElementById('messageList');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    if (otherUserName) chatName.innerText = otherUserName;
    if (otherUserImg) chatAvatar.style.backgroundImage = `url('${otherUserImg}')`;

    // 3. Load Messages
    let messages = [];
    try {
        messages = await window.api.getMessages(conversationId);
        renderMessages(messages);
    } catch (e) {
        console.error(e);
    }

    // 4. Send Message
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        messageInput.value = ''; // Clear immediately

        // Optimistic UI update
        renderSingleMessage({
            senderId: window.firebaseAuth?.currentUser?.uid || 'me',
            text: text,
            timestamp: new Date()
        });

        await window.api.sendMessage(conversationId, text);
        // In a real app, we would listen to firestore updates to see the message confirmed
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Render Logic
    function renderMessages(msgs) {
        messageList.innerHTML = '';
        msgs.forEach(renderSingleMessage);
        scrollToBottom();
    }

    function renderSingleMessage(msg) {
        const el = document.createElement('div');
        const isMe = msg.senderId === (window.firebaseAuth?.currentUser?.uid) || msg.senderId === 'me';

        el.className = `message-bubble ${isMe ? 'msg-me' : 'msg-other'}`;
        el.innerText = msg.text;

        messageList.appendChild(el);
        scrollToBottom();
    }

    function scrollToBottom() {
        messageList.scrollTop = messageList.scrollHeight;
    }
});
