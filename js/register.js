/**
 * Logic for Registration Page
 */

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btnSubmit');
    const originalText = btn.innerText;
    btn.innerText = "Création du profil...";
    btn.disabled = true;

    // 1. Gather Data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const profileData = {
        name: document.getElementById('name').value,
        gender: document.getElementById('gender').value,
        role: document.getElementById('role').value,
        location: document.getElementById('location').value,
        preference: document.getElementById('preference').value,
        bio: document.getElementById('bio').value,
        image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Default Avatar
        farmType: document.getElementById('farmType').value || null,
        badges: ["Nouveau"] // Default badge to prevent crash
        // Note: farmType is only relevant if role is 'farmer'
    };

    try {
        // 2. Register via API
        await window.api.registerUser(email, password, profileData);

        alert("Compte créé avec succès ! Bienvenue au cœur de la meule.");
        window.location.href = 'discovery.html';

    } catch (error) {
        console.error(error);
        alert("Erreur lors de l'inscription : " + error.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
