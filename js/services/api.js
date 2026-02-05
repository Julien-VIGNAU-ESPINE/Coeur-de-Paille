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
     * Get conversations (matches)
     */
    async getMatches() {
        if (this.useFirebase) {
            try {
                const currentUser = window.firebaseAuth.currentUser;
                if (!currentUser) return [];

                // Fetch conversations where I am a participant
                const snapshot = await window.firebaseDb.collection('conversations')
                    .where('participants', 'array-contains', currentUser.uid)
                    .orderBy('lastMessageTime', 'desc')
                    .get();

                const conversations = await Promise.all(snapshot.docs.map(async doc => {
                    const data = doc.data();
                    // Find the other user ID
                    const otherUserId = data.participants.find(uid => uid !== currentUser.uid);

                    // Fetch other user profile
                    const otherProfileDoc = await window.firebaseDb.collection('profiles').doc(otherUserId).get();
                    const otherProfile = otherProfileDoc.exists ? otherProfileDoc.data() : { firstName: 'Utilisateur', avatar: '' };

                    return {
                        id: doc.id,
                        otherUser: otherProfile,
                        ...data
                    };
                }));

                return conversations;
            } catch (e) {
                console.error("Error fetching conversations:", e);
                return [];
            }
        }
        return new Promise(resolve => setTimeout(() => resolve(this.mockMessages), 300));
    }

    /**
     * Get Admirers (People who liked me but I haven't liked back yet)
     */
    async getAdmirers() {
        if (this.useFirebase) {
            try {
                const currentUser = window.firebaseAuth.currentUser;
                if (!currentUser) return [];

                // 1. Get all likes TARGETING me
                const likesSnapshot = await window.firebaseDb.collection('likes')
                    .where('targetId', '==', currentUser.uid)
                    .get();

                if (likesSnapshot.empty) return [];

                // 2. Filter out those I already matched (Optimization: Could be done better with a "matches" collection)
                // For MVP: We assume if there is a like targeting me, and no conversation exists, it's an admirer.
                // We need to fetch profiles.

                const admirers = [];
                for (const doc of likesSnapshot.docs) {
                    const likeData = doc.data();
                    // Check if I already liked them (Mutual = Match, not admirer)
                    // This check is heavy for client side, ideally backend function does this.
                    // Simplified: We just show them. Logic elsewhere handles the "Match" status.

                    const profileDoc = await window.firebaseDb.collection('profiles').doc(likeData.authorId).get();
                    if (profileDoc.exists) {
                        admirers.push({ id: profileDoc.id, ...profileDoc.data() });
                    }
                }
                return admirers;
            } catch (e) {
                console.error("Error fetching admirers:", e);
                return [];
            }
        }
        // Return Mock
        return new Promise((resolve) => {
            console.log("Mock getAdmirers returning 2 users");
            resolve([
                { id: 'adm1', firstName: 'Julie', age: 24, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', bio: 'Fermière en herbe' },
                { id: 'adm2', firstName: 'Sophie', age: 29, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80', bio: 'Amoureuse de la nature' }
            ]);
        });
    }

    /**
     * Like a profile
     * Returns: { status: 'LIKED' | 'MATCH' }
     */
    async likeProfile(targetId) {
        if (this.useFirebase) {
            try {
                const currentUser = window.firebaseAuth.currentUser;
                if (!currentUser) throw new Error("Not logged in");

                // 1. Save the Like
                await window.firebaseDb.collection('likes').add({
                    authorId: currentUser.uid,
                    targetId: targetId,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
                });

                // 2. Check for Mutual Like (Did targetId already like me?)
                const mutualLikeSnapshot = await window.firebaseDb.collection('likes')
                    .where('authorId', '==', targetId)
                    .where('targetId', '==', currentUser.uid)
                    .get();

                if (!mutualLikeSnapshot.empty) {
                    // MUTUAL MATCH! -> Create Conversation
                    await this.createConversation(currentUser.uid, targetId);
                    return { status: 'MATCH' };
                }

                return { status: 'LIKED' };

            } catch (e) {
                console.error("Error liking profile:", e);
                throw e;
            }
        }

        console.log(`[Mock] Liked profile ${targetId}`);
        // FORCE MATCH for testing
        return { status: 'MATCH' };
    }

    /**
     * Create a conversation between two users
     */
    async createConversation(userA, userB) {
        // Check if exists first? (Skipped for MVP speed)
        await window.firebaseDb.collection('conversations').add({
            participants: [userA, userB],
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: "C'est un match ! Dites bonjour 👋",
            lastMessageTime: window.firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId) {
        if (this.useFirebase) {
            try {
                const snapshot = await window.firebaseDb.collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .orderBy('timestamp', 'asc')
                    .limit(50)
                    .get();

                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (e) {
                console.error("Error fetching messages:", e);
                return [];
            }
        }

        // Mock Messages
        return Promise.resolve([
            { id: 1, senderId: 'other', text: "Salut ! Ton profil m'a beaucoup plu.", timestamp: new Date(Date.now() - 3600000) },
            { id: 2, senderId: 'me', text: "Merci ! Le tien aussi, tu es du coin ?", timestamp: new Date(Date.now() - 1800000) }
        ]);
    }

    /**
     * Send a message
     */
    async sendMessage(conversationId, text) {
        if (this.useFirebase) {
            try {
                const currentUser = window.firebaseAuth.currentUser;
                if (!currentUser) throw new Error("Not logged in");

                const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();

                // 1. Add to messages subcollection
                await window.firebaseDb.collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .add({
                        senderId: currentUser.uid,
                        text: text,
                        timestamp: timestamp
                    });

                // 2. Update conversation summary
                await window.firebaseDb.collection('conversations').doc(conversationId).update({
                    lastMessage: text,
                    lastMessageTime: timestamp
                });

                return true;
            } catch (e) {
                console.error("Error sending message:", e);
                return false;
            }
        }

        console.log(`[Mock] Sent message to ${conversationId}: ${text}`);
        return Promise.resolve(true);
    }

    async passProfile(profileId) {
        if (this.useFirebase) {
            console.log("Saving PASS to Firebase...");
            const currentUser = window.firebaseAuth.currentUser;
            if (currentUser) {
                return window.firebaseDb.collection('passes').add({
                    authorId: currentUser.uid,
                    targetId: profileId,
                    timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        console.log(`[Mock] Passed profile ${profileId}`);
        return Promise.resolve(true);
    }

    /**
     * Login user
     */
    async loginUser(email, password) {
        if (this.useFirebase) {
            return window.firebaseAuth.signInWithEmailAndPassword(email, password);
        }
        // Mock Login
        console.log("Mock Login with", email);
        return Promise.resolve({ user: { uid: 'mock-user-123', email } });
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
