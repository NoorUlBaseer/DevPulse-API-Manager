const STORAGE_KEY = 'devpulse_users'; // key to store users in localStorage
const ALLOWED_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|icloud)\.com$/i; // only allow common email providers

function isAllowedEmail(email) { // validate email against allowed providers
  return ALLOWED_EMAIL_REGEX.test((email || '').trim());
}

function createUserId() { // create a unique user ID using timestamp and random string
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeUser(user) { // ensure user object has all required fields with defaults
  const safeUser = user && typeof user === 'object' ? user : {};
  return {
    id: safeUser.id || createUserId(),
    email: safeUser.email || '',
    password: safeUser.password || '',
    name: safeUser.name || '',
    role: safeUser.role || '',
    status: safeUser.status || ''
  };
}

function getStoredUsers() { // retrieve users from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];
    const normalized = parsed.map(normalizeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    return [];
  }
}

function saveUser(user) { // save a new user to localStorage; set defaults for missing fields
  const users = getStoredUsers();
  users.push(normalizeUser({
    ...user,
    role: user.role || 'Developer',
    status: user.status || 'Pending'
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  const users = getStoredUsers();
  return users.find(u => u.email === email) || null;
}

function setLoggedIn(flag, email) { // store status and email of logged in user
  localStorage.setItem('devpulse_loggedIn', flag ? 'true' : 'false');
  if (flag && email) localStorage.setItem('devpulse_loggedInUser', email);
  if (!flag) localStorage.removeItem('devpulse_loggedInUser');
}

function isLoggedIn() {
  return localStorage.getItem('devpulse_loggedIn') === 'true';
}

function protectRoute() { // call this on protected pages to redirect if not logged in
  if (!isLoggedIn()) {
    location.href = 'login.html';
  }
}

function redirectIfLoggedIn() { // call this on login/register page to redirect to dashboard if already logged in
  if (isLoggedIn()) {
    location.href = 'dashboard.html';
  }
}

function showFormMessage(container, msg, type = 'error') { // function to show messages in forms, type can be 'error' or 'success'
  container.textContent = msg;
  container.classList.remove('text-red-400', 'text-green-400');
  container.classList.add(type === 'error' ? 'text-red-400' : 'text-green-400');
}

window.auth = { // expose auth functions globally
  getStoredUsers,
  getStoredUser: function() { // get the currently logged in user's details (email and password) 
    const users = getStoredUsers();
    return users.length ? users[0] : null;
  },
  getMockUsers: function() {
    return _defaultMockUsers.map(u => ({ ...u }));
  },
  saveUser,
  findUserByEmail,
  isAllowedEmail,
  setLoggedIn,
  isLoggedIn,
  protectRoute,
  redirectIfLoggedIn,
  showFormMessage
};

function seedUsers(usersArray = [], force = false) { // helper to seed mock users for testing; set force=true to overwrite existing users
  const existing = getStoredUsers();
  if (existing.length && !force) return false;
  const toSave = usersArray.map(normalizeUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  return true;
}

const _defaultMockUsers = [  // default mock users for testing
  { email: 'ali@gmail.com', password: 'password123', name: 'Ali Raza', role: 'Admin', status: 'Active' },
  { email: 'ahmed@gmail.com', password: 'password1234', name: 'Ahmed Khan', role: 'Developer', status: 'Active' }
];

(function autoSeedIfEmpty() { // auto-seed mock users if no users are found in storage (for testing purposes)
  try {
    const users = getStoredUsers();
    if (!users.length) {
      seedUsers(_defaultMockUsers, false);
    }
  } catch (e) {
  }
})();

window.auth.seedUsers = seedUsers;
