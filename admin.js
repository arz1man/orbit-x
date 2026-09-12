const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('admin-password');
const loginError = document.getElementById('login-error');
const loginScreen = document.getElementById('admin-login');
const dashboardScreen = document.getElementById('admin-dashboard');
const manifestBody = document.getElementById('manifest-body');
const emptyState = document.getElementById('empty-state');
const logoutBtn = document.getElementById('logout-btn');

// Simple fake auth for hackathon purposes
const SECRET_CODE = "admin123";

// Check if already authenticated in session
if (sessionStorage.getItem('orbitX_auth') === 'true') {
    showDashboard();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === SECRET_CODE) {
        sessionStorage.setItem('orbitX_auth', 'true');
        showDashboard();
    } else {
        loginError.style.display = 'block';
        gsap.fromTo(loginScreen, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });
        passwordInput.value = "";
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('orbitX_auth');
    gsap.to(dashboardScreen, { opacity: 0, duration: 0.3, onComplete: () => {
        dashboardScreen.style.display = 'none';
        loginScreen.style.display = 'block';
        gsap.to(loginScreen, { opacity: 1, duration: 0.3 });
    }});
});

function showDashboard() {
    gsap.to(loginScreen, { opacity: 0, duration: 0.3, onComplete: () => {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        gsap.fromTo(dashboardScreen, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
        loadManifest();
    }});
}

async function loadManifest() {
    manifestBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">Syncing with orbital relay...</td></tr>';
    
    let users = [];
    const DB_URL = 'https://kvdb.io/LiW4JtWa8oKyDbR5pvzKD6/users';
    
    try {
        const response = await fetch(DB_URL);
        if(response.ok) {
            users = await response.json();
        } else {
            // Fallback to local
            const raw = localStorage.getItem('orbitX_users');
            if(raw) users = JSON.parse(raw);
        }
    } catch(err) {
        // Fallback to local
        const raw = localStorage.getItem('orbitX_users');
        if(raw) users = JSON.parse(raw);
    }

    manifestBody.innerHTML = '';

    if (!users || users.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        // Sort newest first
        users.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            
            // Format timestamp nicely
            const date = new Date(user.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            tr.innerHTML = `
                <td style="font-weight: 500; color: #fff;">${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td style="font-family: monospace; font-size: 13px; color: #888;">${formattedDate}</td>
                <td><span class="status-badge">SECURED</span></td>
            `;
            manifestBody.appendChild(tr);

            // Stagger animate in
            gsap.fromTo(tr, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, delay: index * 0.1 });
        });
    }
}
