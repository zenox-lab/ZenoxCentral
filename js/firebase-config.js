// Firebase Configuration
// IMPORTANTE: Substitua os valores abaixo pela sua configuração do Firebase Console
// Acesse: Configurações do Projeto > Geral > Seus aplicativos > SDK setup and configuration > Config
const firebaseConfig = {
    apiKey: "AIzaSyAawklUT8Ua0uk16AkhcPaoz8Q7jwhd3nQ",
    authDomain: "zenoxcentral.firebaseapp.com",
    projectId: "zenoxcentral",
    storageBucket: "zenoxcentral.firebasestorage.app",
    messagingSenderId: "384239113508",
    appId: "1:384239113508:web:b978b53be4b56a88a28fb1",
    measurementId: "G-B6LS3TMC6F"
};

// Initialize Firebase
let app, auth, db;

try {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Enable offline persistence
        db.enablePersistence()
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('Firebase persistence failed: Multiple tabs open');
                } else if (err.code == 'unimplemented') {
                    console.warn('Firebase persistence not supported in this browser');
                }
            });

        console.log("Firebase initialized successfully");
    } else {
        console.error("Firebase SDK not loaded");
    }
} catch (e) {
    console.error("Error initializing Firebase:", e);
}
