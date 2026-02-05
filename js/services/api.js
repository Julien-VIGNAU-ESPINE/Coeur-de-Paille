/**
 * ApiService
 * Abstraction layer for data access.
 * Handles switch between Mock Data and Firebase.
 */
class ApiService {
    constructor() {
        this.useFirebase = false; // TOGGLE THIS TO TRUE WHEN FIREBASE IS CONFIGURED
        this.mockProfiles = window.MOCK_PROFILES || [];
        this.mockMessages = window.MOCK_MESSAGES || [];

        // Auto-detect if firebase is actually ready (keys replaced)
        if (window.firebaseDb && !window.firebaseConfig?.apiKey.includes("YOUR_API_KEY")) {
            console.log("Valid Firebase Config detected. Switching to LIVE mode.");
            this.useFirebase = true;
        }
    }

    /**
     * Get profiles active
     * @param {Object} filters - { gender, role, location }
     */
    async getProfiles(filters = {}) {
        if (this.useFirebase) {
            try {
                // Determine query
                let query = window.firebaseDb.collection('profiles');

                // Note: Simple filtering client-side for MVP as composite indexes might be needed for server-side
                const snapshot = await query.get();
                let profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Filter out current user
                const currentUser = window.firebaseAuth.currentUser;
                if (currentUser) {
                    profiles = profiles.filter(p => p.id !== currentUser.uid);
                }

                // Apply Custom Filters
                if (filters.gender && filters.gender !== 'all') {
                    profiles = profiles.filter(p => p.gender === filters.gender);
                }
                if (filters.role && filters.role !== 'all') {
                    profiles = profiles.filter(p => p.role === filters.role);
                }
                if (filters.location && filters.location.trim() !== '') {
                    const loc = filters.location.toLowerCase();
                    profiles = profiles.filter(p => p.location && p.location.toLowerCase().includes(loc));
                }

                return profiles;
            } catch (e) {
                console.error("Error fetching profiles from Firebase:", e);
                return [];
            }
        }

        // Return Mock
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.mockProfiles);
            }, 300);
        });
    }

    /**
     * Get conversations
     */
    async getConversations() {
        if (this.useFirebase) {
            try {
                // Example: For now return empty
                console.log("Fetching conversations from Firebase...");
                return [];
            } catch (e) {
                console.error("Error fetching conversations:", e);
                return [];
            }
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.mockMessages);
            }, 300);
        });
    }

    async likeProfile(profileId) {
        if (this.useFirebase) {
            console.log("Saving LIKE to Firebase...");
            // return window.firebaseDb.collection('likes').add({ profileId, timestamp: new Date() });
            return Promise.resolve(true);
        }

        console.log(`[Mock] Liked profile ${profileId}`);
        return Promise.resolve(true);
    }

    async passProfile(profileId) {
        if (this.useFirebase) {
            console.log("Saving PASS to Firebase...");
            // return window.firebaseDb.collection('passes').add({ profileId, timestamp: new Date() });
            return Promise.resolve(true);
        }

        console.log(`[Mock] Passed profile ${profileId}`);
        return Promise.resolve(true);
    }

    /**
     * Register a new user
     */
    async registerUser(email, password, profileData) {
        if (!this.useFirebase) {
            console.warn("Mock Registration - Data passed:", profileData);
            return new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
            // 1. Create Auth User
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. Create Profile in Firestore
            await window.firebaseDb.collection('profiles').doc(user.uid).set({
                ...profileData,
                id: user.uid,
                createdAt: new Date()
            });

            console.log("User registered and profile created:", user.uid);
            return user;

        } catch (error) {
            console.error("Registration Error:", error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        if (!this.useFirebase) {
            console.log("Mock Logout");
            return Promise.resolve();
        }
        return window.firebaseAuth.signOut();
    }

    /**
     * Helper to populate Firestore with Mock Data
     */
    async seedDatabase() {
        if (!this.useFirebase) {
            console.error("Not connected to Firebase.");
            return;
        }

        console.log("Seeding database...");
        const batch = window.firebaseDb.batch();

        // Seed Profiles
        this.mockProfiles.forEach(profile => {
            const ref = window.firebaseDb.collection('profiles').doc(String(profile.id));
            batch.set(ref, profile);
        });

        await batch.commit();
        console.log("Database seeded successfully!");
        alert("Base de données remplie avec succès ! Rechargez la page.");
        window.location.reload();
    }
}

window.api = new ApiService();
