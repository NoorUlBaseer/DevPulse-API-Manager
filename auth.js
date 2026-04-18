function getStoredUsers() {
  try {
    const raw = localStorage.getItem('devpulse_users');
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

function saveUser(user) {
  const users = getStoredUsers();
  users.push({ email: user.email, password: user.password });
  localStorage.setItem('devpulse_users', JSON.stringify(users));
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
  saveUser,
  findUserByEmail,
  setLoggedIn,
  isLoggedIn,
  protectRoute,
  redirectIfLoggedIn,
  showFormMessage
};

function seedUsers(usersArray = [], force = false) { // helper to seed mock users for testing; set force=true to overwrite existing users
  const existing = getStoredUsers();
  if (existing.length && !force) return false;
  const toSave = usersArray.map(u => ({ email: u.email, password: u.password }));
  localStorage.setItem('devpulse_users', JSON.stringify(toSave));
  return true;
}

const _defaultMockUsers = [  // default mock users for testing
  { email: 'ali@gmail.com', password: 'password123' },
  { email: 'ahmed@gmail.com', password: 'password1234' }
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
