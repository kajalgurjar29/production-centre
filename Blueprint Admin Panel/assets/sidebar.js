// Shared sidebar + mobile drawer navigation: injected into the empty
// <aside id="sidebarDesktop"> and <aside id="mobileDrawer"> shells on every
// admin page, so the ~90 nav links live in one place instead of being
// copy-pasted into all 19 pages. Must run (and finish injecting) before
// header.js, since header.js's mobile-nav-link/close-drawer wiring queries
// this content on load - both use the same synchronous-XHR + <script src>
// document-order trick so that's guaranteed by load order alone.
(function () {
  function loadPartial(url, container) {
    if (!container) return;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    if (xhr.status === 200 || xhr.status === 0) {
      container.innerHTML = xhr.responseText;
    }
  }

  loadPartial('assets/sidebar-desktop-partial.html', document.getElementById('sidebarDesktop'));
  loadPartial('assets/sidebar-mobile-partial.html', document.getElementById('mobileDrawer'));

  var currentPage = location.pathname.split('/').pop() || 'index.html';

  function markActive(link) {
    link.classList.remove('hover:bg-muted');
    link.classList.add('relative', 'bg-accent', 'text-sm', 'font-medium', 'text-foreground', 'border', 'border-border');
    link.setAttribute('aria-current', 'page');

    var bar = document.createElement('span');
    bar.className = 'absolute left-0 top-2 bottom-2 w-1 rounded-r-lg bg-primary';
    bar.setAttribute('aria-hidden', 'true');
    link.insertBefore(bar, link.firstChild);

    var icon = link.querySelector('svg');
    if (icon) {
      icon.classList.remove('text-muted-foreground');
      icon.classList.add('text-primary', 'ml-2');
    }
  }

  document.querySelectorAll('.nav-link[data-page="' + currentPage + '"]').forEach(markActive);
})();
