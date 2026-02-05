document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btnSubmit = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        // Show loading state
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "Connexion en cours...";
        btnSubmit.disabled = true;

        try {
            await window.api.loginUser(email, password);
            // Redirect will be handled by auth state observer within API or simple redirect here
            window.location.href = 'discovery.html';
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion : " + error.message);
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    });
});
