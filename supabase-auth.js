// supabase-auth.js
// Initialize Supabase Client
const _supabase = supabase.createClient(
    'https://olmumjarhohohrjaltwc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbXVtamFyaG9ob2hyamFsdHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjIzNjQsImV4cCI6MjA4NzgzODM2NH0.5eNnXwHYpF8ozPmTCw4eQo4dR06zZ7K-RicsxPTZ88w'
);

// Function to initiate Discord Login
async function loginWithDiscord() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    
    if (error) {
        console.error("Error logging in with Discord:", error.message);
        alert("Failed to login with Discord. Please try again.");
    }
}

// Function to handle Email/Password Sign Up
async function signUpWithEmail(email, password) {
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password
    });
    
    if (error) {
        console.error("Error signing up:", error.message);
        alert(error.message);
    } else {
        alert("Sign up successful! Please check your email to verify your account if required, or log in.");
        closeAuthModal();
    }
}

// Function to handle Email/Password Login
async function loginWithEmail(email, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        console.error("Error logging in:", error.message);
        alert(error.message);
    } else {
        // Successful login
        closeAuthModal();
        updateUIForUser(data.user);
    }
}

// Function to Logout
async function logout() {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error.message);
    } else {
        updateUIForLoggedOut();
    }
}

// Update UI based on User State
function updateUIForUser(user) {
    const loginBtns = document.querySelectorAll('.nav-login-btn, .mobile-login-btn');
    loginBtns.forEach(btn => {
        btn.textContent = 'Sign Out';
        btn.onclick = logout; // Change function to logout
    });
}

function updateUIForLoggedOut() {
    const loginBtns = document.querySelectorAll('.nav-login-btn, .mobile-login-btn');
    loginBtns.forEach(btn => {
        btn.textContent = 'Login / Sign Up';
        btn.onclick = openAuthModal; // Change function back to open modal
    });
}

// Check if user is already logged in on page load
_supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session && session.user) {
            updateUIForUser(session.user);
        }
    } else if (event === 'SIGNED_OUT') {
        updateUIForLoggedOut();
    }
});

// Setup Event Listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Discord Button
    const discordBtns = document.querySelectorAll('.discord-login-btn');
    discordBtns.forEach(btn => {
        btn.addEventListener('click', loginWithDiscord);
    });

    // Email/Password Form
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;
            
            // Basic logic: if they click submit, try to log in. 
            // In a real app we'd have a toggle between "Login" and "Sign up" states on the modal.
            // For now, let's try login first.
            loginWithEmail(email, password);
        });
    });
});
