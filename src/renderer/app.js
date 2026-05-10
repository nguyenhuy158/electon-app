let isLogin = true,
  currentUser = null,
  fullHistory = [],
  filteredHistory = [],
  localSelectedIndex = 0,
  lastGTime = 0,
  i18n = {};

const historyView = document.getElementById('history-view'),
  settingsView = document.getElementById('settings-view'),
  authForm = document.getElementById('auth-form'),
  helpView = document.getElementById('help-view');
const settingsToggle = document.getElementById('settings-toggle'),
  helpToggle = document.getElementById('help-toggle'),
  minimizeBtn = document.getElementById('minimize-btn'),
  quitBtn = document.getElementById('quit-btn'),
  settingsBack = document.getElementById('settings-back'),
  authBack = document.getElementById('auth-back'),
  helpClose = document.getElementById('help-close');
const formTitle = document.getElementById('form-title'),
  submitBtn = document.getElementById('submit-btn'),
  toggleLink = document.getElementById('toggle-link'),
  status = document.getElementById('status');
const authTriggerBtn = document.getElementById('auth-trigger-btn'),
  logoutBtn = document.getElementById('logout-btn'),
  userEmailDisplay = document.getElementById('user-email'),
  syncStatusDisplay = document.getElementById('sync-status');
const soundToggle = document.getElementById('sound-toggle'),
  statsToggle = document.getElementById('stats-toggle'),
  appearanceSelect = document.getElementById('appearance-select'),
  cleanupStrategy = document.getElementById('cleanup-strategy'),
  cleanupValue = document.getElementById('cleanup-value'),
  syncToggle = document.getElementById('sync-toggle'),
  forceSyncBtn = document.getElementById('force-sync-btn');

const shortcutInput = document.getElementById('shortcut-input'),
  pinShortcutInput = document.getElementById('pin-shortcut-input'),
  saveShortcutBtn = document.getElementById('save-shortcut-btn'),
  shortcutStatus = document.getElementById('shortcut-status');
const historyList = document.getElementById('history-list'),
  searchInput = document.getElementById('search-input');

window.api = {
  onHistoryUpdate: (cb) => {
    window.onHistoryUpdate = cb;
  },
  onFocusSearch: (cb) => {
    window.onFocusSearch = cb;
  },
  onSyncComplete: (cb) => {
    window.onSyncComplete = cb;
  },
  getHistory: () =>
    window.pywebview ? window.pywebview.api.get_history() : Promise.resolve([]),
  copyToClipboard: (t) =>
    window.pywebview
      ? window.pywebview.api.copy_to_clipboard(t)
      : Promise.resolve(true),
  togglePin: (id) =>
    window.pywebview ? window.pywebview.api.toggle_pin(id) : Promise.resolve(true),
  getTranslations: () =>
    window.pywebview ? window.pywebview.api.get_translations() : Promise.resolve({}),
  getShortcut: () =>
    window.pywebview ? window.pywebview.api.get_shortcut() : Promise.resolve({}),
  updateShortcut: (d) =>
    window.pywebview
      ? window.pywebview.api.update_shortcut(d)
      : Promise.resolve({ success: true }),
  getSettings: () =>
    window.pywebview ? window.pywebview.api.get_settings() : Promise.resolve({}),
  updateSettings: (d) =>
    window.pywebview
      ? window.pywebview.api.update_settings(d)
      : Promise.resolve({ success: true }),
  login: (d) =>
    window.pywebview ? window.pywebview.api.login(d) : Promise.resolve({ success: true }),
  register: (d) =>
    window.pywebview
      ? window.pywebview.api.register(d)
      : Promise.resolve({ success: true }),
  logout: () =>
    window.pywebview ? window.pywebview.api.logout() : Promise.resolve(true),
  forceSync: () =>
    window.pywebview
      ? window.pywebview.api.force_sync()
      : Promise.resolve({ success: true }),
  getSystemAppearance: () =>
    window.pywebview
      ? window.pywebview.api.get_system_appearance()
      : Promise.resolve('light'),
  getLastSyncTime: () =>
    window.pywebview
      ? window.pywebview.api.get_last_sync_time()
      : Promise.resolve(null)
};

window.addEventListener('pywebviewready', () => {
  const pyApi = window.pywebview.api;
  window.api = {
    onHistoryUpdate: (cb) => {
      window.onHistoryUpdate = cb;
    },
    onFocusSearch: (cb) => {
      window.onFocusSearch = cb;
    },
    onSyncComplete: (cb) => {
      window.onSyncComplete = cb;
    },
    getHistory: () => pyApi.get_history(),
    copyToClipboard: (t) => pyApi.copy_to_clipboard(t),
    togglePin: (id) => pyApi.toggle_pin(id),
    getTranslations: () => pyApi.get_translations(),
    getShortcut: () => pyApi.get_shortcut(),
    updateShortcut: (d) => pyApi.update_shortcut(d),
    getSettings: () => pyApi.get_settings(),
    updateSettings: (d) => pyApi.update_settings(d),
    login: (d) => pyApi.login(d),
    register: (d) => pyApi.register(d),
    logout: () => pyApi.logout(),
    forceSync: () => pyApi.force_sync(),
    getSystemAppearance: () => pyApi.get_system_appearance(),
    getLastSyncTime: () => pyApi.get_last_sync_time()
  };

  window.api.onHistoryUpdate((h) => {
    fullHistory = h;
    renderHistory(searchInput.value);
  });

  loadData();
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const applyTheme = async (theme) => {
  const root = document.documentElement;
  let effectiveTheme = theme;

  if (theme === 'system') {
    const systemTheme = await window.api.getSystemAppearance();
    effectiveTheme = systemTheme;
  }

  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const translate = (key, params = {}) => {
  const keys = key.split('.');
  let value = i18n;
  for (const k of keys) {
    value = value ? value[k] : null;
  }
  if (!value) return key;

  let result = value;
  for (const p in params) {
    result = result.replace(`{${p}}`, params[p]);
  }
  return result;
};

const updateLastSyncDisplay = (timestamp) => {
  const lastSyncEl = document.getElementById('last-sync-time');
  if (!lastSyncEl) return;

  if (!timestamp) {
    lastSyncEl.innerText = translate('SETTINGS.LAST_SYNCED', {
      time: translate('SETTINGS.NEVER')
    });
    return;
  }

  lastSyncEl.innerText = translate('SETTINGS.LAST_SYNCED', {
    time: formatDate(timestamp)
  });
};

const loadData = async () => {
  try {
    i18n = await window.api.getTranslations();

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerText = translate(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = translate(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = translate(el.getAttribute('data-i18n-title'));
    });

    const shortcuts = await window.api.getShortcut();
    shortcutInput.value = shortcuts.open_picker || '';
    pinShortcutInput.value = shortcuts.toggle_pin || '';

    const settings = await window.api.getSettings();
    soundToggle.checked = settings.sound_enabled;
    statsToggle.checked = settings.show_stats;
    syncToggle.checked = settings.auto_sync;
    if (appearanceSelect) appearanceSelect.value = settings.appearance || 'system';
    cleanupStrategy.value = settings.cleanup_strategy || 'limit';
    cleanupValue.value = settings.cleanup_value || 100;

    fullHistory = await window.api.getHistory();
    renderHistory();

    const lastSyncTime = await window.api.getLastSyncTime();
    updateLastSyncDisplay(lastSyncTime);
  } catch (e) {
    console.error('Failed to load data:', e);
    if (historyList) {
      historyList.innerHTML = `<div class="text-danger p-4">Error loading data: ${e.message}<br>${e.stack}</div>`;
    }
  }
};

const renderHistory = (filter = '') => {
  historyList.innerHTML = '';
  filteredHistory = fullHistory.filter(
    (item) =>
      item &&
      typeof item.content === 'string' &&
      item.content.toLowerCase().includes(filter.toLowerCase())
  );
  if (fullHistory.length === 0) {
    historyList.innerHTML = `<div class="text-mute text-center py-8 text-[13px] italic">${translate('HISTORY.EMPTY')}</div>`;
    return;
  }
  if (filteredHistory.length === 0) {
    historyList.innerHTML = `<div class="text-mute text-center py-8 text-[13px] italic">${translate('HISTORY.NO_MATCHES')}</div>`;
    return;
  }
  if (localSelectedIndex >= filteredHistory.length)
    localSelectedIndex = filteredHistory.length - 1;

  filteredHistory.forEach((itemData, i) => {
    const item = document.createElement('div'),
      isSel = i === localSelectedIndex,
      isPinned = itemData.is_pinned,
      showStats = statsToggle.checked;

    let statsHtml = '';
    if (showStats) {
      const content = itemData.content || '';
      const charCount = content.length;
      const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;
      const isFormatted = content.includes('\n') || content.includes('\t');

      // Simple code detection
      const isCode = /[{}[\];]|function\s+\w+|import\s+.*from|const\s+\w+\s*=|def\s+\w+\(|if\s+.*:/.test(
        content
      );
      const contentType = isCode ? 'Code' : isFormatted ? 'Rich' : 'Text';

      statsHtml = `
                <span class="text-[10px] ${isSel ? 'text-accent/70' : 'text-mute'} flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14.5 2 14.5 7.5 20 7.5"></polyline></svg>
                  ${contentType}
                </span>
                <span class="text-[10px] ${isSel ? 'text-accent/70' : 'text-mute'} flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="12" y1="20" x2="12" y2="4"></line><line x1="9" y1="20" x2="15" y2="20"></line></svg>
                  ${charCount}
                </span>
                <span class="text-[10px] ${isSel ? 'text-accent/70' : 'text-mute'} flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
                  ${wordCount}
                </span>
            `;
    }

    item.className = `p-[11px] bg-surface-card border-2 rounded-md cursor-pointer group transition-all flex items-start gap-3 ${isSel ? 'border-accent' : 'border-hairline hover:border-accent'}`;
    item.innerHTML = `
            <span class="text-[10px] ${isSel ? 'text-accent font-bold' : 'text-mute'} font-mono mt-0.5">${i + 1}</span>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] ${isSel ? 'text-accent font-bold' : 'text-primary'} break-words whitespace-pre-wrap">${itemData.content.length > 100 ? itemData.content.substring(0, 97) + '...' : itemData.content}</div>
              <div class="flex items-center gap-3 mt-1 flex-wrap">
                <span class="text-[10px] ${isSel ? 'text-accent/70' : 'text-mute'} flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${formatDate(itemData.timestamp)}
                </span>
                <span class="text-[10px] ${isSel ? 'text-accent/70' : 'text-mute'} flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  ${itemData.source_app || 'Unknown'}
                </span>
                ${statsHtml}
              </div>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
               <button class="pin-btn p-1 hover:bg-surface-soft rounded-full transition-colors ${isPinned ? 'text-accent' : 'text-mute opacity-0 group-hover:opacity-100'}" title="${isPinned ? translate('HISTORY.UNPIN') : translate('HISTORY.PIN')}">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2a2 2 0 0 0 1.27 1.87L12 18.22l7.73-6.35A2 2 0 0 0 21 10z"></path><line x1="12" y1="18" x2="12" y2="22"></line></svg>
               </button>
               <div class="text-[10px] ${isSel ? 'text-accent' : 'text-mute'} group-hover:text-accent font-mono">${isSel ? '►' : '↵'}</div>
            </div>`;

    item.onclick = (e) => {
      if (e.target.closest('.pin-btn')) {
        e.stopPropagation();
        window.api.togglePin(itemData.id);
        return;
      }
      localSelectedIndex = i;
      window.api.copyToClipboard(itemData.content);
    };
    historyList.appendChild(item);
    if (isSel) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
};

searchInput.oninput = (e) => {
  localSelectedIndex = 0;
  renderHistory(e.target.value);
};

settingsToggle.onclick = () => {
  settingsView.classList.remove('hidden');
};

settingsBack.onclick = () => {
  settingsView.classList.add('hidden');
};

authTriggerBtn.onclick = () => {
  authForm.classList.remove('hidden');
};

authBack.onclick = () => {
  authForm.classList.add('hidden');
};

helpToggle.onclick = () => {
  helpView.classList.toggle('hidden');
};

helpClose.onclick = () => {
  helpView.classList.add('hidden');
};

minimizeBtn.onclick = () => window.api.minimize();
quitBtn.onclick = () => window.api.quit();

saveShortcutBtn.onclick = async () => {
  const openPicker = shortcutInput.value.trim();
  const togglePin = pinShortcutInput.value.trim();

  saveShortcutBtn.disabled = true;
  shortcutStatus.innerText = 'Updating...';

  const res = await window.api.updateShortcut({
    open_picker: openPicker,
    toggle_pin: togglePin
  });

  shortcutStatus.innerText = res.success ? 'Updated!' : 'Error: ' + res.error;
  shortcutStatus.className = 'text-[10px] mt-2 ' + (res.success ? 'text-success' : 'text-danger');

  setTimeout(() => {
    shortcutStatus.innerText = '';
    saveShortcutBtn.disabled = false;
  }, 2000);
};

soundToggle.onchange = async () => {
  await window.api.updateSettings({ sound_enabled: soundToggle.checked });
};

statsToggle.onchange = async () => {
  await window.api.updateSettings({ show_stats: statsToggle.checked });
  renderHistory(searchInput.value);
};

if (appearanceSelect) {
  appearanceSelect.onchange = async () => {
    await window.api.updateSettings({ appearance: appearanceSelect.value });
    applyTheme(appearanceSelect.value);
  };
}

syncToggle.onchange = async () => {
  await window.api.updateSettings({ auto_sync: syncToggle.checked });
};

forceSyncBtn.onclick = async () => {
  forceSyncBtn.disabled = true;
  const originalText = forceSyncBtn.innerText;
  forceSyncBtn.innerText = translate('SETTINGS.SYNCING');

  const res = await window.api.forceSync();

  if (res.success) {
    forceSyncBtn.innerText = translate('SETTINGS.SYNCED');
    updateLastSyncDisplay(res.last_sync_time);
    setTimeout(() => {
      forceSyncBtn.innerText = originalText;
      forceSyncBtn.disabled = false;
    }, 2000);
    fullHistory = await window.api.getHistory();
    renderHistory(searchInput.value);
  } else {
    forceSyncBtn.innerText = 'Error!';
    setTimeout(() => {
      forceSyncBtn.innerText = originalText;
      forceSyncBtn.disabled = false;
    }, 2000);
  }
};

window.api.onSyncComplete((timestamp) => {
  updateLastSyncDisplay(timestamp);
});

cleanupStrategy.onchange = async () => {
  await window.api.updateSettings({ cleanup_strategy: cleanupStrategy.value });
};

cleanupValue.oninput = async () => {
  if (cleanupValue.value) {
    await window.api.updateSettings({ cleanup_value: parseInt(cleanupValue.value) });
  }
};

logoutBtn.onclick = async () => {
  await window.api.logout();
  currentUser = null;
  userEmailDisplay.innerText = 'Guest';
  syncStatusDisplay.innerText = 'Offline mode: local storage';
  authTriggerBtn.classList.remove('hidden');
  logoutBtn.classList.add('hidden');
  loadData();
  settingsBack.click();
};

toggleLink.onclick = () => {
  isLogin = !isLogin;
  formTitle.innerText = isLogin ? 'Login' : 'Register';
  submitBtn.innerText = isLogin ? 'Login' : 'Register';
  toggleLink.innerText = isLogin ? '[+] No account? Register' : '[+] Have account? Login';
};

submitBtn.onclick = async () => {
  const email = document.getElementById('email').value,
    pass = document.getElementById('password').value;
  status.classList.remove('hidden');
  status.innerText = 'Processing...';
  const res = isLogin
    ? await window.api.login({ email, password: pass })
    : await window.api.register({ email, password: pass });
  if (res.success) {
    currentUser = res.user;
    authForm.classList.add('hidden');
    userEmailDisplay.innerText = res.user.email;
    syncStatusDisplay.innerText = 'Cloud sync active';
    authTriggerBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    loadData();
  } else {
    status.innerText = 'Error: ' + res.error;
    status.classList.add('text-danger');
  }
};

document.addEventListener('keydown', (e) => {
  const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
  if (e.key === '?' && !isInput) {
    e.preventDefault();
    helpView.classList.toggle('hidden');
    return;
  }
  if (e.key === '/' && !isInput) {
    e.preventDefault();
    helpView.classList.add('hidden');
    searchInput.focus();
    return;
  }
  if (e.key === 'Escape') {
    if (!helpView.classList.contains('hidden')) helpView.classList.add('hidden');
    else if (isInput) document.activeElement.blur();
    else if (!authForm.classList.contains('hidden')) authBack.click();
    else if (!settingsView.classList.contains('hidden')) settingsBack.click();
    else {
      localSelectedIndex = -1;
      renderHistory(searchInput.value);
    }
    return;
  }
  if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInput) {
    const idx = parseInt(e.key) - 1;
    if (filteredHistory[idx]) window.api.copyToClipboard(filteredHistory[idx].content);
    return;
  }
  if (!isInput) {
    if (e.key === 'j') {
      localSelectedIndex = (localSelectedIndex + 1) % (filteredHistory.length || 1);
      renderHistory(searchInput.value);
      lastGTime = 0;
    } else if (e.key === 'k') {
      localSelectedIndex =
        localSelectedIndex <= 0 ? (filteredHistory.length || 1) - 1 : localSelectedIndex - 1;
      renderHistory(searchInput.value);
      lastGTime = 0;
    } else if (e.key === 'G') {
      localSelectedIndex = filteredHistory.length - 1;
      renderHistory(searchInput.value);
      lastGTime = 0;
    } else if (e.key === 'g') {
      const now = Date.now();
      if (now - lastGTime < 500) {
        localSelectedIndex = 0;
        renderHistory(searchInput.value);
        lastGTime = 0;
      } else {
        lastGTime = now;
      }
    } else if (e.key === 'Enter') {
      lastGTime = 0;
      if (e.ctrlKey || e.metaKey) {
        // Check if current shortcut matches (default to Ctrl/Cmd + Enter)
        if (localSelectedIndex !== -1) {
          window.api.togglePin(filteredHistory[localSelectedIndex].id);
        }
      } else if (localSelectedIndex !== -1) {
        window.api.copyToClipboard(filteredHistory[localSelectedIndex].content);
      }
    }
  } else if (
    e.key === 'Enter' &&
    document.activeElement === searchInput &&
    filteredHistory.length > 0
  ) {
    if (e.ctrlKey || e.metaKey) {
      window.api.togglePin(filteredHistory[localSelectedIndex === -1 ? 0 : localSelectedIndex].id);
    } else {
      window.api.copyToClipboard(
        filteredHistory[localSelectedIndex === -1 ? 0 : localSelectedIndex].content
      );
    }
  }
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (appearanceSelect && appearanceSelect.value === 'system') {
    applyTheme('system');
  }
});
