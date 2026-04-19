(function initDevPulseNotifications() { // Self-invoking function to encapsulate the notifications system and avoid polluting global scope
  const STORAGE_KEY = 'devpulse_notifications';

  function createId() {
    return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeNotification(item) { // Ensure a notification object has all required fields with defaults and correct types
    const safe = item && typeof item === 'object' ? item : {};
    return {
      id: String(safe.id || createId()),
      message: String(safe.message || 'System update available'),
      createdAt: Number(safe.createdAt) || Date.now(),
      read: Boolean(safe.read)
    };
  }

  function loadNotifications() { // Load notifications from localStorage, parse and normalize them, and sort by most recent
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeNotification).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }

  function saveNotifications(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(normalizeNotification).slice(0, 200)));
  }

  function addNotification(message, options) { // Add a new notification with the given message and options, save it, and re-render the notifications list
    const text = String(message || '').trim();
    if (!text) return null;

    const opts = options && typeof options === 'object' ? options : {};
    const items = loadNotifications();
    const next = [{
      id: createId(),
      message: text,
      createdAt: Date.now(),
      read: Boolean(opts.read)
    }, ...items];
    saveNotifications(next);
    renderNotifications();
    return next[0];
  }

  function formatTime(timestamp) { // Format a timestamp as a relative time string
    const diff = Math.max(0, Date.now() - Number(timestamp || Date.now()));
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function escapeHtml(text) { // Simple function to escape HTML special characters to prevent XSS in notification messages
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getElements() {
    return {
      desktopRoot: document.getElementById('notificationsRoot'),
      desktopBtn: document.getElementById('notificationsBtn'),
      desktopPanel: document.getElementById('notificationsDropdown'),
      desktopList: document.getElementById('notificationsList'),
      desktopBadge: document.getElementById('notificationsBadge'),
      mobileBtn: document.getElementById('mobileNotificationsBtn'),
      mobilePanel: document.getElementById('mobileNotificationsDropdown'),
      mobileList: document.getElementById('mobileNotificationsList'),
      mobileBadge: document.getElementById('mobileNotificationsBadge'),
      markAllReadBtn: document.getElementById('markAllReadBtn'),
      mobileMarkAllReadBtn: document.getElementById('mobileMarkAllReadBtn')
    };
  }

  function ensureMountedUI() { // Check if the notification UI elements already exist, and if not, create and insert them into the DOM in the appropriate places for desktop and mobile views
    const desktopExists = document.getElementById('notificationsRoot');
    const mobilePanelExists = document.getElementById('mobileNotificationsDropdown');
    if (desktopExists && mobilePanelExists) return;

    // Create desktop notification button and dropdown if they don't exist
    const desktopNav = document.querySelector('header nav.hidden.md\\:flex');
    if (desktopNav && !desktopExists) {
      const wrapper = document.createElement('div');
      wrapper.id = 'notificationsRoot';
      wrapper.className = 'relative shrink-0';
      wrapper.innerHTML = `
        <button id="notificationsBtn" class="notification-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Notifications">
          <svg class="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span id="notificationsBadge" class="hidden notification-badge">0</span>
        </button>
        <div id="notificationsDropdown" class="hidden absolute right-0 mt-3 z-[90] notifications-panel">
          <div class="notifications-panel-header">
            <p class="text-sm font-bold text-white">Notifications</p>
            <button id="markAllReadBtn" class="notifications-mark-all-btn" type="button">Mark All Read</button>
          </div>
          <div id="notificationsList" class="notifications-list custom-scrollbar"></div>
        </div>
      `;
      const userInfoNode = desktopNav.querySelector('#userInfo');
      const userBlock = userInfoNode ? userInfoNode.closest('div') : null;
      if (userBlock) {
        desktopNav.insertBefore(wrapper, userBlock);
      } else {
        const logoutBtn = desktopNav.querySelector('#logoutBtn');
        desktopNav.insertBefore(wrapper, logoutBtn || null);
      }
    }

    // Create mobile notification button and dropdown if they don't exist
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn && !document.getElementById('mobileNotificationsBtn')) {
      const menuButtonGroup = menuBtn.parentElement;
      if (menuButtonGroup) {
        menuButtonGroup.classList.add('flex', 'items-center', 'gap-2', 'shrink-0');
      }

      const mobileButtonWrap = document.createElement('div');
      mobileButtonWrap.className = 'relative shrink-0';
      mobileButtonWrap.innerHTML = `
        <button id="mobileNotificationsBtn" class="notification-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Notifications">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span id="mobileNotificationsBadge" class="hidden notification-badge">0</span>
        </button>
      `;
      menuBtn.parentElement.insertBefore(mobileButtonWrap, menuBtn);
    }

    // Create mobile notifications dropdown panel if it doesn't exist
    const header = document.querySelector('header');
    if (header && !mobilePanelExists) {
      const panel = document.createElement('div');
      panel.id = 'mobileNotificationsDropdown';
      panel.className = 'hidden md:hidden fixed left-4 right-4 z-[80] notifications-panel mobile-overlay-panel';
      panel.innerHTML = `
        <div class="notifications-panel-header">
          <p class="text-sm font-bold text-white">Notifications</p>
          <button id="mobileMarkAllReadBtn" class="notifications-mark-all-btn" type="button">Mark All Read</button>
        </div>
        <div id="mobileNotificationsList" class="notifications-list custom-scrollbar"></div>
      `;
      const mobileMenu = document.getElementById('mobileMenu');
      header.insertBefore(panel, mobileMenu || null);
    }
  }

  function renderNotifications() { // Load notifications, generate HTML for the latest 10, and update the desktop and mobile notification lists and badges accordingly
    const {
      desktopList,
      mobileList,
      desktopBadge,
      mobileBadge
    } = getElements();

    const notifications = loadNotifications();
    const latest = notifications.slice(0, 10);
    const unread = notifications.filter(item => !item.read).length;

    // Generate HTML for notifications, escaping message content and formatting timestamps, and include action buttons for unread notifications
    const html = latest.length
      ? latest.map(item => `
        <div class="notification-item ${item.read ? '' : 'is-unread'}">
          <div class="notification-body">
            <div class="notification-content">
              <p class="notification-message break-words">${escapeHtml(item.message)}</p>
              <p class="notification-time">${formatTime(item.createdAt)}</p>
            </div>
            <div class="notification-actions">
              ${item.read ? '' : `<button type="button" data-action="read" data-id="${item.id}" class="notification-action-btn read">Read</button>`}
              <button type="button" data-action="delete" data-id="${item.id}" class="notification-action-btn delete">Delete</button>
            </div>
          </div>
        </div>
      `).join('')
      : '<div class="notifications-empty">No notifications</div>';

    if (desktopList) desktopList.innerHTML = html;
    if (mobileList) mobileList.innerHTML = html;

    [desktopBadge, mobileBadge].forEach((badge) => {
      if (!badge) return;
      if (unread > 0) {
        badge.classList.remove('hidden');
        badge.textContent = unread > 99 ? '99+' : String(unread);
      } else {
        badge.classList.add('hidden');
      }
    });
  }

  function markAllRead() {
    const items = loadNotifications().map(item => ({ ...item, read: true }));
    saveNotifications(items);
    renderNotifications();
  }

  function readOne(id) {
    const items = loadNotifications().map(item => (item.id === id ? { ...item, read: true } : item));
    saveNotifications(items);
    renderNotifications();
  }

  function deleteOne(id) {
    const items = loadNotifications().filter(item => item.id !== id);
    saveNotifications(items);
    renderNotifications();
  }

  function togglePanel(panel, trigger, forceOpen) {
    if (!panel || !trigger) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !shouldOpen);
    panel.classList.toggle('is-open', shouldOpen);
    trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  }

  function wireEvents() {
    const {
      desktopRoot,
      desktopBtn,
      desktopPanel,
      desktopList,
      mobileBtn,
      mobilePanel,
      mobileList,
      markAllReadBtn,
      mobileMarkAllReadBtn
    } = getElements();

    if (desktopBtn && desktopPanel && !desktopBtn.dataset.notificationsBound) {
      desktopBtn.dataset.notificationsBound = 'true';
      desktopBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        togglePanel(mobilePanel, mobileBtn, false);
        togglePanel(desktopPanel, desktopBtn);
      });
    }

    if (mobileBtn && mobilePanel && !mobileBtn.dataset.notificationsBound) {
      mobileBtn.dataset.notificationsBound = 'true';
      mobileBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        togglePanel(desktopPanel, desktopBtn, false);
        togglePanel(mobilePanel, mobileBtn);
      });
    }

    [desktopList, mobileList].forEach((list) => { // Use event delegation to handle clicks on read/delete buttons for notifications, and mark all read button
      if (!list || list.dataset.notificationsBound) return;
      list.dataset.notificationsBound = 'true';
      list.addEventListener('click', (event) => {
        event.stopPropagation();
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (action === 'read') readOne(id);
        if (action === 'delete') deleteOne(id);
      });
    });

    if (markAllReadBtn && !markAllReadBtn.dataset.notificationsBound) {
      markAllReadBtn.dataset.notificationsBound = 'true';
      markAllReadBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        markAllRead();
      });
    }

    if (mobileMarkAllReadBtn && !mobileMarkAllReadBtn.dataset.notificationsBound) {
      mobileMarkAllReadBtn.dataset.notificationsBound = 'true';
      mobileMarkAllReadBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        markAllRead();
      });
    }

    if (desktopPanel && !desktopPanel.dataset.notificationsBound) {
      desktopPanel.dataset.notificationsBound = 'true';
      desktopPanel.addEventListener('click', event => event.stopPropagation());
    }

    if (mobilePanel && !mobilePanel.dataset.notificationsBound) {
      mobilePanel.dataset.notificationsBound = 'true';
      mobilePanel.addEventListener('click', event => event.stopPropagation());
    }

    if (!document.body.dataset.notificationsGlobalBound) { // Add global event listeners to close notification panels when clicking outside or pressing Escape
      document.body.dataset.notificationsGlobalBound = 'true';
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (desktopRoot && !desktopRoot.contains(target)) {
          togglePanel(desktopPanel, desktopBtn, false);
        }
        if (mobilePanel && mobileBtn && !mobilePanel.contains(target) && !mobileBtn.contains(target)) {
          togglePanel(mobilePanel, mobileBtn, false);
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        togglePanel(desktopPanel, desktopBtn, false);
        togglePanel(mobilePanel, mobileBtn, false);
      });
    }
  }

  function openNotificationsPane() {
    const { desktopPanel, desktopBtn, mobilePanel, mobileBtn } = getElements();
    if (desktopPanel && desktopBtn) {
      togglePanel(mobilePanel, mobileBtn, false);
      togglePanel(desktopPanel, desktopBtn, true);
      return;
    }
    if (mobilePanel && mobileBtn) {
      togglePanel(desktopPanel, desktopBtn, false);
      togglePanel(mobilePanel, mobileBtn, true);
    }
  }

  function closeNotificationsPane() {
    const { desktopPanel, desktopBtn, mobilePanel, mobileBtn } = getElements();
    togglePanel(desktopPanel, desktopBtn, false);
    togglePanel(mobilePanel, mobileBtn, false);
  }

  function mount() {
    ensureMountedUI();
    renderNotifications();
    wireEvents();
  }

  window.devpulseNotifications = {
    add: addNotification,
    getAll: loadNotifications,
    markAllRead,
    render: renderNotifications,
    mount,
    open: openNotificationsPane,
    close: closeNotificationsPane
  };

  if (document.readyState === 'loading') { // If the document is still loading, wait for DOMContentLoaded to mount the notifications system. Otherwise, mount immediately.
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
