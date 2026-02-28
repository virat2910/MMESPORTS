// Initialize Supabase Client
if (typeof supabase === 'undefined') {
    console.error("Supabase library not loaded! Check your script tags.");
}

const _supabase = supabase.createClient(
    'https://olmumjarhohohrjaltwc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbXVtamFyaG9ob2hyamFsdHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjIzNjQsImV4cCI6MjA4NzgzODM2NH0.5eNnXwHYpF8ozPmTCw4eQo4dR06zZ7K-RicsxPTZ88w'
);

// Function to initiate Discord Login
async function loginWithDiscord() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: 'https://mmesports.in'
        }
    });

    if (error) {
        console.error("Error logging in with Discord:", error.message);
        alert("Failed to login with Discord. Please try again.");
    }
}

// Function to show Success Confirmation UI
function showAuthSuccess(message) {
    const modalContent = document.querySelector('.auth-modal-content');
    if (modalContent) {
        const originalContent = modalContent.innerHTML;
        modalContent.innerHTML = `
            <span class="close-modal" onclick="closeAuthModal()">&times;</span>
            <div class="success-message">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Success!</h2>
                <p>${message}</p>
                <button class="auth-submit-btn" onclick="closeAuthModal()">Great, Thanks!</button>
            </div>
        `;
    }
}

// Function to handle Email/Password Sign Up
async function signUpWithEmail(name, ign, bgmi_id, discord, phone, email, password) {
    const submitBtn = document.querySelector('.auth-submit-btn');
    const originalBtnText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name,
                ign: ign,
                bgmi_id: bgmi_id,
                discord_username: discord,
                phone_number: phone
            }
        }
    });

    if (error) {
        console.error("Full Sign Up Error Object:", error);
        alert("Sign Up Error: " + (error.message || "Fetch failed. Please check if you have an ad-blocker enabled or check your internet connection."));
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    } else {
        showAuthSuccess("Your account has been created! Please check your email inbox to verify your account before logging in.");
    }
}

// Function to handle Email/Password Login
async function loginWithEmail(email, password) {
    const submitBtn = document.querySelector('.auth-submit-btn');
    const originalBtnText = submitBtn.textContent;

    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error("Full Login Error Object:", error);
        alert("Login Error: " + (error.message || "Fetch failed. Please check your connection."));
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
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

// Auth Modal Logic (Global)
function openAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const authModal = document.getElementById('authModal');
    if (event.target === authModal) {
        closeAuthModal();
    }
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

    // Toggle Login/Sign Up Mode
    const toggleBtn = document.getElementById('toggleAuthMode');
    const toggleTextContainer = document.querySelector('.auth-footer');
    const authForms = document.querySelectorAll('.auth-form');

    if (toggleBtn && toggleTextContainer) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const authTitle = document.querySelector('.auth-modal-content h2');
            const authSubtitle = document.querySelector('.auth-modal-content p');
            const submitBtn = document.querySelector('.auth-submit-btn');

            authForms.forEach(form => {
                const signupFields = form.querySelector('.signup-fields');

                if (submitBtn.textContent === 'Login') {
                    // Switch to Sign Up
                    authTitle.textContent = 'Create Account';
                    authSubtitle.textContent = 'Join MM Esports';
                    submitBtn.textContent = 'Sign Up';
                    toggleTextContainer.childNodes[0].nodeValue = "Already have an account? ";
                    toggleBtn.textContent = "Login";
                    form.setAttribute('data-mode', 'signup');
                    if (signupFields) signupFields.style.display = 'block';
                } else {
                    // Switch to Login
                    authTitle.textContent = 'Welcome Back';
                    authSubtitle.textContent = 'Sign in to MM Esports';
                    submitBtn.textContent = 'Login';
                    toggleTextContainer.childNodes[0].nodeValue = "Don't have an account? ";
                    toggleBtn.textContent = "Sign up";
                    form.setAttribute('data-mode', 'login');
                    if (signupFields) signupFields.style.display = 'none';
                }
            });
        });
    }

    // Email/Password Form
    authForms.forEach(form => {
        // Default mode is login
        form.setAttribute('data-mode', 'login');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = form.querySelector('input[id="name"]');
            const name = nameInput ? nameInput.value : '';
            const ignInput = form.querySelector('input[id="ign"]');
            const ign = ignInput ? ignInput.value : '';
            const bgmiIdInput = form.querySelector('input[id="bgmi_id"]');
            const bgmi_id = bgmiIdInput ? bgmiIdInput.value : '';
            const discordInput = form.querySelector('input[id="discord"]');
            const discord = discordInput ? discordInput.value : '';
            const phoneInput = form.querySelector('input[id="phone"]');
            const phone = phoneInput ? phoneInput.value : '';

            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;

            const mode = form.getAttribute('data-mode');
            if (mode === 'signup') {
                // If we don't have basic details and we're in signup mode, alert
                if (!name || name.trim() === '' || !ign || ign.trim() === '' || !bgmi_id || bgmi_id.trim() === '') {
                    alert("Please fill in all required fields (Name, IGN, BGMI ID) to sign up.");
                    return;
                }
                signUpWithEmail(name, ign, bgmi_id, discord, phone, email, password);
            } else {
                loginWithEmail(email, password);
            }
        });
    });
});
