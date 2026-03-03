const { initializeApp } = require('firebase/app');
const { getAuth, onAuthStateChanged } = require('firebase/auth');

const app = initializeApp({ apiKey: '', authDomain: '', projectId: '' });
const auth = getAuth(app);

let timeout = setTimeout(() => {
    console.log('Timeout! onAuthStateChanged never resolved.');
    process.exit(1);
}, 3000);

onAuthStateChanged(auth, (user) => {
    clearTimeout(timeout);
    console.log('Auth state changed:', user);
    process.exit(0);
}, (error) => {
    clearTimeout(timeout);
    console.error('Auth error:', error.message);
    process.exit(1);
});
