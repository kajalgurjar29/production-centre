// Shared "AI Assistant" side panel, injected on every AITransformation page
// that includes <div id="help-widget-root"></div> + this script before
// </body>. Mirrors the Admin Panel's header.js pattern (synchronous XHR of a
// partial into a placeholder div) so every page gets the same widget from
// one source instead of copy-pasting the chat UI 12 times.
//
// tailwind.css on this site is a pre-compiled/purged build with no build
// tooling in this folder - verified class-by-class against the compiled CSS
// (Tailwind backslash-escapes ":"/"." in the selector, e.g. "hover:bg-muted"
// -> ".hover\:bg-muted", accounted for when checking). Anything not already
// compiled in (message bubbles, action icons, the pill input row, the
// slide-in/backdrop animation) is hand-written CSS below instead, scoped
// under #help-widget-panel/.hw-* so it can't leak into the host page.
(function () {
  var root = document.getElementById('help-widget-root');
  if (!root) return;

  var STYLE = ''
    + '#help-widget-panel{--background:#FFFFFF;--foreground:#092B5A;--primary:#0066CC;--primary-foreground:#FFFFFF;'
    + '--secondary:#E6F0FA;--secondary-foreground:#092B5A;--muted:#F8FAFC;--muted-foreground:#475569;'
    + '--accent:#D6E7F7;--accent-foreground:#092B5A;--card:#FFFFFF;--card-foreground:#092B5A;'
    + '--border:#E6F0FA;--input:#D6E7F7;--ring:#0066CC;}'
    + '#help-widget-panel .bg-card{color:var(--card-foreground);}'
    + '#help-widget-panel .bg-primary{color:var(--primary-foreground);}'
    + '#help-widget-panel .bg-secondary{color:var(--secondary-foreground);}'
    // Backdrop/scroll-lock are mobile-only now (full-screen takeover there
    // still needs them) - desktop uses a non-modal docked card instead, per
    // reference: no dimming, page stays fully interactive around it, closed
    // by clicking outside instead of a backdrop.
    + '#help-widget-backdrop{position:fixed;inset:0;z-index:60;background:rgba(15,23,42,.5);opacity:0;pointer-events:none;visibility:hidden;transition:opacity .2s ease,visibility 0s linear .2s;}'
    + '#help-widget-backdrop.is-open{opacity:1;pointer-events:auto;visibility:visible;transition:opacity .2s ease;}'
    // visibility:hidden alongside the transform - being off-canvas via
    // translateX alone still leaves the box in normal paint/hit-testing, so
    // a rounding/zoom edge case (or an ancestor's overflow behaving
    // differently for fixed-position descendants) can leave a sliver of it
    // visible/clickable at the viewport edge before it's ever opened.
    // visibility:hidden removes it from paint entirely regardless of that;
    // the visibility transition is delayed on the way out so the slide
    // animation still plays, but applied immediately on the way in.
    + '#help-widget-panel{position:fixed;top:0;right:0;height:100vh;width:100vw;max-width:100vw;z-index:61;'
    + 'background:var(--background,#fff);display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(15,23,42,.18);overflow:hidden;'
    + 'transform:translateX(100%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s;color:var(--foreground);font-family:inherit;}'
    + '#help-widget-panel.is-open{transform:translateX(0);visibility:visible;transition:transform .25s ease;}'
    + '@media (min-width:1024px){'
    + '#help-widget-backdrop{display:none;}'
    // height must be a definite length here, not "auto" - the messages list
    // and chat body inside use flex:1 to fill the panel, which only works
    // against a definite ancestor height. "auto" left them sized to content
    // (near-zero until something else forced a reflow), making the panel
    // render as a thin sliver until e.g. a message came in.
    + '#help-widget-panel{top:auto;bottom:5.75rem;right:1.5rem;height:min(600px,calc(100vh - 8rem));'
    + 'width:420px;max-width:92vw;border-radius:1rem;box-shadow:0 20px 50px rgba(15,23,42,.25);}'
    + '}'
    + 'body.help-widget-locked{overflow:hidden;}'
    // Quick-topic chips: only "min-height" wasn't in the compiled CSS.
    + '#help-widget-panel .hw-chip{min-height:2.25rem;}'
    // Pill input row: hand-rolled since Tailwind's px-1/pl-1/pr-1.5/py-1.5
    // aren't in the compiled CSS (never used elsewhere on this site).
    + '#help-widget-form{padding:.375rem .375rem .375rem .25rem;}'
    + '#help-widget-input{background:transparent;border:0;padding:0 .375rem;min-height:2.25rem;}'
    // Message list + bubbles, Copilot-style: plain assistant text, a small
    // pill for the user's own messages, and an icon-only action row under
    // each assistant reply.
    + '#help-widget-messages{min-height:0;}'
    + '.hw-msg-user{display:flex;justify-content:flex-end;}'
    + '.hw-msg-user p{display:inline-block;max-width:88%;background:var(--secondary);color:var(--secondary-foreground);border-radius:.9rem;padding:.5rem .875rem;margin:0;}'
    + '.hw-msg-assistant p{color:var(--foreground);margin:0;}'
    + '.hw-actions{display:flex;align-items:center;gap:.125rem;margin-top:.5rem;margin-left:-.375rem;}'
    + '.hw-icon-btn{height:1.75rem;width:1.75rem;display:inline-flex;align-items:center;justify-content:center;'
    + 'border-radius:9999px;color:var(--muted-foreground);border:0;background:transparent;font-size:.95rem;cursor:pointer;padding:0;}'
    + '.hw-icon-btn:hover{background:var(--muted);color:var(--foreground);}'
    + '.hw-icon-btn[aria-pressed="true"]{color:var(--primary);background:var(--accent);}'
    + '.hw-typing p{color:var(--muted-foreground);}'
    // Pre-chat details form: same hand-rolled-input pattern as elsewhere in
    // this file, for the same reason (border-input/bg-background/h-10 combo
    // as plain classes isn't what's compiled - easier and more robust to
    // define the one input look once here).
    + '#help-widget-chatbody{min-height:0;}'
    + '.hw-field{display:block;width:100%;height:2.5rem;border-radius:0.5rem;border:1px solid var(--input);'
    + 'background:var(--background,#fff);padding:0 0.75rem;font-size:0.875rem;color:var(--foreground);outline:none;}'
    + '.hw-field:focus{border-color:var(--ring);}'
    + '.hw-field.hw-field-error{border-color:var(--destructive);}'
    + '.hw-btn-outline{height:2.5rem;border-radius:0.5rem;border:1px solid var(--input);background:transparent;'
    + 'font-size:0.875rem;font-weight:500;color:var(--foreground);cursor:pointer;}'
    + '.hw-btn-outline:hover{background:var(--muted);}'
    // Homepage welcome tray: deliberately NOT scoped under #help-widget-panel
    // so it picks up the host page's own design tokens (--primary etc.) -
    // it's sitting on top of the page as a teaser, not part of the chat
    // sub-theme. Positioned to sit just above the FAB (bottom-5/6 right-5/6,
    // h-14 w-14 on this site's pages) with a small gap; non-modal (no
    // backdrop, no scroll lock, page stays fully interactive underneath).
    + '#help-welcome-tray{position:fixed;z-index:59;bottom:5.5rem;right:1.25rem;width:320px;max-width:calc(100vw - 2.5rem);'
    + 'background:var(--background,#fff);border-radius:1rem;box-shadow:0 12px 30px rgba(15,23,42,.18);'
    + 'border:1px solid var(--border);transform:translateX(120%);opacity:0;visibility:hidden;pointer-events:none;'
    + 'transition:transform .3s ease,opacity .3s ease,visibility 0s linear .3s;}'
    + '#help-welcome-tray.is-open{transform:translateX(0);opacity:1;visibility:visible;pointer-events:auto;transition:transform .3s ease,opacity .3s ease;}'
    + '@media (min-width:640px){#help-welcome-tray{bottom:5.75rem;right:1.5rem;}}'
    // Launcher: a soft "avatar" badge (light circle + colour icon) rather
    // than a solid-colour icon button, matching the same avatar treatment
    // used for the assistant everywhere else in this widget (header, tray,
    // message bubbles) instead of looking like an unrelated generic button.
    + '#ai-help-fab:hover{filter:brightness(0.97);}';
  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // Synchronous so the panel exists in the DOM before we wire it up below -
  // same technique as the Admin Panel's header.js.
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'assets/help-widget.html', false);
  xhr.send(null);
  if (xhr.status !== 200 && xhr.status !== 0) return;
  root.innerHTML = xhr.responseText;

  var backdrop = document.getElementById('help-widget-backdrop');
  var panel = document.getElementById('help-widget-panel');
  var messagesEl = document.getElementById('help-widget-messages');
  var form = document.getElementById('help-widget-form');
  var input = document.getElementById('help-widget-input');
  var submitBtn = document.getElementById('help-widget-submit');
  var closeBtn = document.getElementById('help-widget-close');
  var newChatBtn = document.getElementById('help-widget-newchat');
  var micBtn = document.getElementById('help-widget-mic');
  var welcomeTray = document.getElementById('help-welcome-tray');
  var welcomeCloseBtn = document.getElementById('help-welcome-close');
  var welcomeStartBtn = document.getElementById('help-welcome-start');
  var fab = document.getElementById('ai-help-fab');
  var precallSection = document.getElementById('help-widget-precall');
  var precallForm = document.getElementById('help-widget-precall-form');
  var precallCancelBtn = document.getElementById('help-widget-precall-cancel');
  var firstNameInput = document.getElementById('help-widget-firstname');
  var lastNameInput = document.getElementById('help-widget-lastname');
  var precallEmailInput = document.getElementById('help-widget-precall-email');
  var chatBody = document.getElementById('help-widget-chatbody');
  if (!backdrop || !panel || !messagesEl || !form || !input) return;

  var CHAT_API_URL = '/api/chat';
  var SESSION_STORAGE_KEY = 'aitp-help-session-id';
  var HISTORY_STORAGE_KEY = 'aitp-help-history';
  var WELCOME_SHOWN_KEY = 'aitp-help-welcome-shown';
  var VISITOR_STORAGE_KEY = 'aitp-help-visitor';
  var MAX_HISTORY_MESSAGES = 10;
  var NETWORK_ERROR_MESSAGE = "Sorry, I'm having trouble reaching the assistant right now. Please check your connection and try again, or visit our Contact Us page.";

  var conversationHistory = [];
  var isSending = false;
  var lastFocusedEl = null;
  var lastAssistantEl = null; // only the newest assistant reply offers "regenerate"
  var speakingUtterance = null;

  function getSessionId() {
    var sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (tag) {
      var chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return chars[tag] || tag;
    });
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendUserMessage(text) {
    var msg = document.createElement('div');
    msg.className = 'hw-msg-user';
    msg.innerHTML = '<p class="text-sm">' + escapeHTML(text) + '</p>';
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  // sourceUserText is what re-asking on "regenerate" should resend - kept as
  // a closure argument rather than re-derived from conversationHistory so
  // regenerate can't drift if history is trimmed (MAX_HISTORY_MESSAGES).
  function appendAssistantMessage(text, sourceUserText) {
    var msg = document.createElement('div');
    msg.className = 'hw-msg-assistant';
    msg.innerHTML = '<p class="text-sm">' + escapeHTML(text) + '</p>';

    if (sourceUserText) {
      if (lastAssistantEl) {
        var prevActions = lastAssistantEl.querySelector('.hw-actions');
        if (prevActions) prevActions.remove();
      }
      msg.appendChild(buildActionsRow(text, sourceUserText, msg));
      lastAssistantEl = msg;
    }

    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function buildActionsRow(text, sourceUserText, msgEl) {
    var row = document.createElement('div');
    row.className = 'hw-actions';
    row.innerHTML = ''
      + '<button type="button" class="hw-icon-btn" data-action="like" aria-label="Good response" aria-pressed="false"><iconify-icon icon="lucide:thumbs-up"></iconify-icon></button>'
      + '<button type="button" class="hw-icon-btn" data-action="dislike" aria-label="Poor response" aria-pressed="false"><iconify-icon icon="lucide:thumbs-down"></iconify-icon></button>'
      + '<button type="button" class="hw-icon-btn" data-action="share" aria-label="Share response"><iconify-icon icon="lucide:share-2"></iconify-icon></button>'
      + '<button type="button" class="hw-icon-btn" data-action="copy" aria-label="Copy response"><iconify-icon icon="lucide:copy"></iconify-icon></button>'
      + '<button type="button" class="hw-icon-btn" data-action="speak" aria-label="Read aloud" aria-pressed="false"><iconify-icon icon="lucide:volume-2"></iconify-icon></button>'
      + '<button type="button" class="hw-icon-btn" data-action="regenerate" aria-label="Regenerate response"><iconify-icon icon="lucide:refresh-cw"></iconify-icon></button>';

    var likeBtn = row.querySelector('[data-action="like"]');
    var dislikeBtn = row.querySelector('[data-action="dislike"]');
    likeBtn.addEventListener('click', function () {
      var next = likeBtn.getAttribute('aria-pressed') !== 'true';
      likeBtn.setAttribute('aria-pressed', String(next));
      if (next) dislikeBtn.setAttribute('aria-pressed', 'false');
    });
    dislikeBtn.addEventListener('click', function () {
      var next = dislikeBtn.getAttribute('aria-pressed') !== 'true';
      dislikeBtn.setAttribute('aria-pressed', String(next));
      if (next) likeBtn.setAttribute('aria-pressed', 'false');
    });

    row.querySelector('[data-action="copy"]').addEventListener('click', function (event) {
      var btn = event.currentTarget;
      var icon = btn.querySelector('iconify-icon');
      var restore = function () { icon.setAttribute('icon', 'lucide:copy'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          icon.setAttribute('icon', 'lucide:check');
          setTimeout(restore, 1500);
        }).catch(function () {});
      }
    });

    var shareBtn = row.querySelector('[data-action="share"]');
    if (navigator.share) {
      shareBtn.addEventListener('click', function () {
        navigator.share({ text: text }).catch(function () {});
      });
    } else {
      shareBtn.classList.add('hidden');
    }

    var speakBtn = row.querySelector('[data-action="speak"]');
    if (window.speechSynthesis) {
      speakBtn.addEventListener('click', function () {
        var icon = speakBtn.querySelector('iconify-icon');
        var isSpeaking = speakBtn.getAttribute('aria-pressed') === 'true';
        window.speechSynthesis.cancel();
        if (isSpeaking) {
          speakBtn.setAttribute('aria-pressed', 'false');
          icon.setAttribute('icon', 'lucide:volume-2');
          speakingUtterance = null;
          return;
        }
        document.querySelectorAll('.hw-icon-btn[data-action="speak"]').forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
          b.querySelector('iconify-icon').setAttribute('icon', 'lucide:volume-2');
        });
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = function () {
          speakBtn.setAttribute('aria-pressed', 'false');
          icon.setAttribute('icon', 'lucide:volume-2');
        };
        speakingUtterance = utterance;
        speakBtn.setAttribute('aria-pressed', 'true');
        icon.setAttribute('icon', 'lucide:square');
        window.speechSynthesis.speak(utterance);
      });
    } else {
      speakBtn.classList.add('hidden');
    }

    row.querySelector('[data-action="regenerate"]').addEventListener('click', function () {
      if (isSending) return;
      // Drop this reply (and its history entry) and ask again - only ever
      // wired on the newest assistant message, so history stays a clean
      // trailing sequence with nothing "orphaned" after it.
      conversationHistory.pop();
      msgEl.remove();
      if (lastAssistantEl === msgEl) lastAssistantEl = null;
      sendUserMessage(sourceUserText, { skipUserBubble: true });
    });

    return row;
  }

  function appendTypingIndicator() {
    var msg = document.createElement('div');
    msg.id = 'help-widget-typing';
    msg.className = 'hw-msg-assistant hw-typing';
    msg.innerHTML = '<p class="text-sm">Typing…</p>';
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    var indicator = document.getElementById('help-widget-typing');
    if (indicator) indicator.remove();
  }

  function setSending(sending) {
    isSending = sending;
    input.disabled = sending;
    if (submitBtn) submitBtn.disabled = sending;
  }

  function persistHistory() {
    try {
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-MAX_HISTORY_MESSAGES)));
    } catch (err) {
      // sessionStorage unavailable (e.g. private browsing) - chat still works, just won't persist on reload.
    }
  }

  async function requestAssistantReply(message) {
    var response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        history: conversationHistory.slice(-MAX_HISTORY_MESSAGES),
        sessionId: getSessionId(),
        siteKey: 'aitransformation',
      }),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.message || data.error || 'The assistant could not process that request.');
    return data.reply;
  }

  async function sendUserMessage(text, options) {
    if (isSending) return;
    var cleanText = text.trim();
    if (!cleanText) return;
    var skipUserBubble = options && options.skipUserBubble;

    if (!skipUserBubble) appendUserMessage(cleanText);
    conversationHistory.push({ role: 'user', content: cleanText });
    persistHistory();

    setSending(true);
    appendTypingIndicator();

    try {
      var reply = await requestAssistantReply(cleanText);
      removeTypingIndicator();
      appendAssistantMessage(reply, cleanText);
      conversationHistory.push({ role: 'assistant', content: reply });
      persistHistory();
    } catch (err) {
      removeTypingIndicator();
      appendAssistantMessage(err.message || NETWORK_ERROR_MESSAGE, cleanText);
    } finally {
      setSending(false);
    }
  }

  function getGreeting() {
    var visitor = getStoredVisitor();
    var name = visitor && visitor.firstName ? visitor.firstName + ', ' : '';
    return 'Hello, ' + name + 'I am the AI Transformation Help Assistant. Ask me anything about our services.';
  }

  function greet() {
    lastAssistantEl = null;
    appendAssistantMessage(getGreeting(), null);
  }

  function restoreHistory() {
    try {
      var stored = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) {
          conversationHistory = parsed;
          var pendingUserText = null;
          parsed.forEach(function (entry) {
            if (entry.role === 'user') {
              appendUserMessage(entry.content);
              pendingUserText = entry.content;
            } else if (entry.role === 'assistant') {
              appendAssistantMessage(entry.content, pendingUserText);
              pendingUserText = null;
            }
          });
          return;
        }
      }
    } catch (err) {
      conversationHistory = [];
    }
    greet();
  }

  function clearChat() {
    window.speechSynthesis && window.speechSynthesis.cancel();
    conversationHistory = [];
    persistHistory();
    messagesEl.innerHTML = '';
    greet();
    input.focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = input.value;
    input.value = '';
    updateSendAffordance();
    sendUserMessage(text);
  });

  root.querySelectorAll('[data-prompt]').forEach(function (btn) {
    btn.addEventListener('click', function () { sendUserMessage(btn.getAttribute('data-prompt')); });
  });

  if (newChatBtn) newChatBtn.addEventListener('click', clearChat);

  // Send/mic swap: an empty box offers voice input (where supported), a
  // typed message offers send - avoids showing a mic button that does
  // nothing on browsers without SpeechRecognition.
  var SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null;
  if (SpeechRecognitionCtor && micBtn) {
    recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event) {
      var transcript = event.results[0][0].transcript;
      input.value = transcript;
      updateSendAffordance();
      input.focus();
    };
    recognition.onaudiostart = function () { micBtn.setAttribute('aria-pressed', 'true'); };
    recognition.onend = function () { micBtn.setAttribute('aria-pressed', 'false'); };
    recognition.onerror = function () { micBtn.setAttribute('aria-pressed', 'false'); };
    micBtn.addEventListener('click', function () {
      try { recognition.start(); } catch (err) { /* already listening */ }
    });
  }

  function updateSendAffordance() {
    // Only swap send<->mic when a mic is actually available as the
    // alternative - otherwise always show send, or an empty input would
    // leave no visible action at all.
    if (!recognition) return;
    var hasText = input.value.trim().length > 0;
    if (submitBtn) submitBtn.classList.toggle('hidden', !hasText);
    if (micBtn) micBtn.classList.toggle('hidden', hasText);
  }
  input.addEventListener('input', updateSendAffordance);

  // Pre-chat details gate: first-time visitors this session see the details
  // form before the conversation is usable; returning visitors (visitor
  // info already in sessionStorage) skip straight to chat.
  function getStoredVisitor() {
    try {
      var raw = sessionStorage.getItem(VISITOR_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function setStoredVisitor(visitor) {
    try { sessionStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitor)); } catch (err) { /* private browsing */ }
  }

  function showChatBody() {
    if (precallSection) precallSection.classList.add('hidden');
    if (chatBody) {
      chatBody.classList.remove('hidden');
      chatBody.classList.add('flex');
    }
  }

  function initChatArea() {
    showChatBody();
    restoreHistory();
    updateSendAffordance();
  }

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(fieldEl, errorEl, hasError) {
    fieldEl.classList.toggle('hw-field-error', hasError);
    errorEl.classList.toggle('hidden', !hasError);
  }

  function validatePrecallForm() {
    var valid = true;
    var firstName = firstNameInput.value.trim();
    var lastName = lastNameInput.value.trim();
    var email = precallEmailInput.value.trim();
    var firstNameError = document.getElementById('help-widget-firstname-error');
    var lastNameError = document.getElementById('help-widget-lastname-error');
    var emailError = document.getElementById('help-widget-precall-email-error');

    setFieldError(firstNameInput, firstNameError, !firstName);
    if (!firstName) valid = false;

    setFieldError(lastNameInput, lastNameError, !lastName);
    if (!lastName) valid = false;

    var emailInvalid = Boolean(email) && !EMAIL_PATTERN.test(email);
    setFieldError(precallEmailInput, emailError, emailInvalid);
    if (emailInvalid) valid = false;

    return valid;
  }

  // Best-effort save to the backend so it shows up in AppCentre Admin - never
  // awaited and never blocks/fails the chat gate, same "side effect can't
  // hold up the primary action" rule the enquiry notification emails follow.
  function saveLeadToBackend(visitor) {
    fetch('/api/ai-assistant-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        email: visitor.email || undefined,
        sessionId: getSessionId(),
        siteKey: 'aitransformation',
      }),
    }).catch(function () { /* chat still works without this */ });
  }

  if (precallForm) {
    precallForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validatePrecallForm()) return;
      var visitor = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: precallEmailInput.value.trim(),
      };
      setStoredVisitor(visitor);
      saveLeadToBackend(visitor);
      initChatArea();
      setTimeout(function () { input.focus(); }, 50);
    });
  }
  if (precallCancelBtn) precallCancelBtn.addEventListener('click', closeHelpWidget);

  function isDesktopViewport() {
    return window.matchMedia('(min-width: 1024px)').matches;
  }

  // Desktop is a non-modal docked card (per reference: no dimming, page
  // stays interactive) - closed by clicking outside instead of a backdrop.
  // Deferred by a tick so the click that *opened* the widget (e.g. the FAB)
  // doesn't immediately bubble into this same listener and close it again.
  function onOutsideClick(event) {
    if (panel.contains(event.target) || event.target === fab || (fab && fab.contains(event.target))) return;
    closeHelpWidget();
  }

  function openHelpWidget() {
    dismissWelcomeTray();
    lastFocusedEl = document.activeElement;
    panel.classList.add('is-open');
    document.addEventListener('keydown', onKeydown);
    if (isDesktopViewport()) {
      setTimeout(function () { document.addEventListener('click', onOutsideClick, true); }, 0);
    } else {
      backdrop.classList.add('is-open');
      document.body.classList.add('help-widget-locked');
    }
    setTimeout(function () {
      var precallShowing = precallSection && !precallSection.classList.contains('hidden');
      (precallShowing && firstNameInput ? firstNameInput : input).focus();
    }, 260);
  }

  function closeHelpWidget() {
    backdrop.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.classList.remove('help-widget-locked');
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onOutsideClick, true);
    window.speechSynthesis && window.speechSynthesis.cancel();
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  }

  function onKeydown(event) {
    if (event.key === 'Escape') closeHelpWidget();
  }

  backdrop.addEventListener('click', closeHelpWidget);
  if (closeBtn) closeBtn.addEventListener('click', closeHelpWidget);

  // Every "Help" entry point on the page (top nav, mobile nav, footer nav,
  // and the floating chat-bubble FAB) already links to TransformHelp.html -
  // intercepting that one href pattern covers all of them without touching
  // each link individually.
  document.querySelectorAll('a[href="TransformHelp.html"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      openHelpWidget();
    });
  });

  if (fab) {
    fab.addEventListener('click', function () { openHelpWidget(); });
    // Fade the launcher out while the page footer is in view, so it never
    // sits on top of footer content - previously duplicated verbatim in an
    // inline <script> on every page; now lives here once since the FAB
    // itself moved into this shared, injected widget.
    var footer = document.querySelector('footer');
    if (footer && 'IntersectionObserver' in window) {
      var footerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          fab.style.opacity = entry.isIntersecting ? '0' : '1';
          fab.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
        });
      });
      footerObserver.observe(footer);
    }
  }

  // Homepage-only welcome tray: a non-modal teaser that introduces the
  // assistant on first arrival, then gets out of the way. Gated by
  // data-welcome="true" on #help-widget-root (only set on the homepage
  // pages) and a once-per-session flag so navigating back to the homepage
  // later in the same session doesn't repeat the intro.
  var welcomeShowTimer = null;
  var welcomeRetractTimer = null;

  function dismissWelcomeTray() {
    if (!welcomeTray) return;
    clearTimeout(welcomeShowTimer);
    clearTimeout(welcomeRetractTimer);
    welcomeTray.classList.remove('is-open');
    try { sessionStorage.setItem(WELCOME_SHOWN_KEY, '1'); } catch (err) { /* private browsing */ }
  }

  function onWelcomeKeydown(event) {
    if (event.key === 'Escape' && welcomeTray.classList.contains('is-open')) dismissWelcomeTray();
  }

  function setupWelcomeTray() {
    if (!welcomeTray) return;
    var alreadyShown = false;
    try { alreadyShown = sessionStorage.getItem(WELCOME_SHOWN_KEY) === '1'; } catch (err) { /* private browsing - just show it */ }
    if (alreadyShown) return;

    if (welcomeCloseBtn) welcomeCloseBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      dismissWelcomeTray();
    });
    var start = function (event) {
      if (event) event.stopPropagation();
      dismissWelcomeTray();
      openHelpWidget();
    };
    if (welcomeStartBtn) welcomeStartBtn.addEventListener('click', start);
    welcomeTray.addEventListener('click', start);
    document.addEventListener('keydown', onWelcomeKeydown);

    // Let the page settle first, then slide the tray in - it must never
    // block the page (no backdrop, no scroll lock) or force a dismissal.
    welcomeShowTimer = setTimeout(function () {
      welcomeTray.classList.add('is-open');
      welcomeRetractTimer = setTimeout(dismissWelcomeTray, 5000);
    }, 1500);
  }

  if (root.dataset.welcome === 'true') setupWelcomeTray();

  // Skip the pre-chat form entirely if this visitor already completed it
  // earlier in the session (or the form markup isn't present for some
  // reason) - otherwise leave it showing, wired above to reveal chat on submit.
  if (getStoredVisitor() || !precallSection || !chatBody) {
    initChatArea();
  }

  window.openHelpWidget = openHelpWidget;
  window.closeHelpWidget = closeHelpWidget;
})();
