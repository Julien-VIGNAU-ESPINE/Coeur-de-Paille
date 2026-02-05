const MOCK_PROFILES = [
    {
        id: 1,
        name: 'Julien, 32 ans',
        location: 'Normandie',
        type: 'Éleveur Vachier',
        bio: "Passionné par mes Brunes des Alpes. Je cherche quelqu'un qui n'a pas peur de se lever à 5h du mat' pour la traite !",
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80', // Placeholder
        badges: ['Bio', 'Lève-tôt', 'Fromage']
    },
    {
        id: 2,
        name: 'Marie, 28 ans',
        location: 'Bretagne',
        type: 'Maraîchère',
        bio: "Les mains dans la terre et la tête dans les étoiles. J'ai repris l'exploitation familiale en permaculture.",
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Placeholder
        badges: ['Permaculture', 'Nature', 'Vélo']
    },
    {
        id: 3,
        name: 'Paul, 45 ans',
        location: 'gers',
        type: 'Céréalier',
        bio: "Simple, bon vivant. J'aime les grandes étendues et les repas en famille le dimanche.",
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Placeholder
        badges: ['Bon vivant', 'Tradition', 'Rugby']
    }
];

const MOCK_MESSAGES = [
    {
        id: 1,
        sender: 'Marie',
        lastMessage: "C'est super intéressant ton approche du bio !",
        time: '14:30',
        unread: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
        id: 2,
        sender: 'Paul',
        lastMessage: "On se voit au salon de l'agriculture ?",
        time: 'Hier',
        unread: false,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
];
