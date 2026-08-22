// Shared top navbar: injected into <header id="siteHeader"></header> on every
// admin page so the search/website-selector/notifications/profile markup and
// behaviour live in one place instead of being copy-pasted per page.
(function () {
  var container = document.getElementById('siteHeader');
  if (!container) return;

  // Synchronous XHR (not fetch) so the header exists in the DOM before this
  // script returns - later inline <script> tags on the page can then safely
  // call document.getElementById('siteSelect') etc. without waiting on an event.
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'assets/header-partial.html', false);
  xhr.send(null);
  if (xhr.status === 200 || xhr.status === 0) {
    container.innerHTML = xhr.responseText;
  } else {
    return;
  }

  // Website selector: persist the choice across page loads (each admin page
  // reinjects this header from scratch, so without this the selector would
  // silently reset to "AI Transformation" every time you navigate).
  //
  // There are two <select> instances in the markup - #siteSelect (desktop,
  // inline in the header row) and #siteSelectMobile (its own full-width row,
  // lg:hidden) - because a single element can't be both without one context
  // squeezing into a layout it doesn't fit. #siteSelect stays the one and
  // only value every page's own inline script reads (see e.g.
  // ReviewsMgt.html's `document.getElementById('siteSelect').value`), so
  // whichever select the user actually touches, its value is mirrored onto
  // #siteSelect before saving/dispatching - the mobile select never needs to
  // be read directly anywhere else.
  var SITE_STORAGE_KEY = 'appcentre_selected_site';
  var siteSelect = document.getElementById('siteSelect');
  var siteSelectMobile = document.getElementById('siteSelectMobile');
  var siteSelects = [siteSelect, siteSelectMobile].filter(Boolean);
  if (siteSelect) {
    var savedSite = localStorage.getItem(SITE_STORAGE_KEY);
    if (savedSite && Array.prototype.some.call(siteSelect.options, function (opt) { return opt.value === savedSite; })) {
      siteSelects.forEach(function (el) { el.value = savedSite; });
    } else {
      localStorage.setItem(SITE_STORAGE_KEY, siteSelect.value);
    }
    siteSelects.forEach(function (el) {
      el.addEventListener('change', function () {
        siteSelects.forEach(function (other) { other.value = el.value; });
        localStorage.setItem(SITE_STORAGE_KEY, siteSelect.value);
        window.dispatchEvent(new CustomEvent('appcentre:site-changed', { detail: { site: siteSelect.value } }));
      });
    });
  }

  try {
    var raw = localStorage.getItem('appcentre_admin');
    if (raw) {
      var admin = JSON.parse(raw);
      var nameEl = document.getElementById('headerAdminName');
      var initialsEl = document.getElementById('headerAdminInitials');
      var roleEl = document.getElementById('headerAdminRole');
      if (admin && admin.name) {
        if (nameEl) nameEl.textContent = admin.name;
        if (initialsEl) {
          var parts = admin.name.trim().split(/\s+/);
          var initials = (parts[0] ? parts[0][0] : '') + (parts[1] ? parts[1][0] : '');
          initialsEl.textContent = initials.toUpperCase() || 'AD';
        }
        if (roleEl && admin.role) {
          roleEl.textContent = admin.role.charAt(0) + admin.role.slice(1).toLowerCase();
        }
      }
    }
  } catch (err) {
    // Ignore malformed localStorage content - header falls back to defaults.
  }

  var body = document.body;
  var menuButton = document.getElementById('menuButton');
  var sidebarToggle = document.getElementById('sidebarToggle');
  var desktopAside = document.querySelector('aside:not(#mobileDrawer)');
  var mobileDrawer = document.getElementById('mobileDrawer');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var drawerClose = document.getElementById('drawerClose');
  var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  var notificationButton = document.getElementById('notificationButton');
  var notificationPanel = document.getElementById('notificationPanel');
  var profileButton = document.getElementById('profileButton');
  var profilePanel = document.getElementById('profilePanel');

  function applySidebarState(collapsed) {
    if (!desktopAside || !sidebarToggle) return;
    desktopAside.style.display = collapsed ? 'none' : '';
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  }
  applySidebarState(localStorage.getItem('sidebarCollapsed') === 'true');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      var collapsed = desktopAside.style.display !== 'none';
      applySidebarState(collapsed);
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    });
  }

  function closeDrawer() {
    if (!mobileDrawer || !mobileOverlay) return;
    mobileDrawer.classList.add('hidden');
    mobileOverlay.classList.add('hidden');
    body.classList.remove('overflow-hidden');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  }

  function openDrawer() {
    if (!mobileDrawer || !mobileOverlay) return;
    mobileDrawer.classList.remove('hidden');
    mobileOverlay.classList.remove('hidden');
    body.classList.add('overflow-hidden');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
  }

  function closePanel(button, panel) {
    if (!button || !panel) return;
    button.setAttribute('aria-expanded', 'false');
    panel.classList.add('hidden');
  }

  function openPanel(button, panel) {
    button.setAttribute('aria-expanded', 'true');
    panel.classList.remove('hidden');
  }

  function togglePanel(button, panel, otherButton, otherPanel) {
    var isOpen = button.getAttribute('aria-expanded') === 'true';
    closePanel(otherButton, otherPanel);
    if (isOpen) {
      closePanel(button, panel);
    } else {
      openPanel(button, panel);
    }
  }

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeDrawer(); else openDrawer();
    });
  }
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);
  mobileNavLinks.forEach(function (link) { link.addEventListener('click', closeDrawer); });

  if (notificationButton && profileButton) {
    notificationButton.addEventListener('click', function (event) {
      event.stopPropagation();
      togglePanel(notificationButton, notificationPanel, profileButton, profilePanel);
    });
    profileButton.addEventListener('click', function (event) {
      event.stopPropagation();
      togglePanel(profileButton, profilePanel, notificationButton, notificationPanel);
    });
  }
  if (notificationPanel) notificationPanel.addEventListener('click', function (event) { event.stopPropagation(); });
  if (profilePanel) profilePanel.addEventListener('click', function (event) { event.stopPropagation(); });

  document.addEventListener('click', function (event) {
    if (notificationPanel && notificationButton && !notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
      closePanel(notificationButton, notificationPanel);
    }
    if (profilePanel && profileButton && !profilePanel.contains(event.target) && !profileButton.contains(event.target)) {
      closePanel(profileButton, profilePanel);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closePanel(notificationButton, notificationPanel);
      closePanel(profileButton, profilePanel);
      closeDrawer();
    }
  });

  document.querySelectorAll('a[href="adminlogin.html"]').forEach(function (link) {
    link.addEventListener('click', function () {
      localStorage.removeItem('appcentre_admin_token');
      localStorage.removeItem('appcentre_admin');
    });
  });
})();
