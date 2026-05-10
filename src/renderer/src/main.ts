import './styles.css';

let isLogin = true,
  currentUser = null,
  fullHistory = [],
  filteredHistory = [],
  localSelectedIndex = 0;

const historyView = document.getElementById('history-view') as HTMLElement;
const settingsView = document.getElementById('settings-view') as HTMLElement;
const authForm = document.getElementById('auth-form') as HTMLElement;
const settingsToggle = document.getElementById('settings-toggle') as HTMLElement;
const settingsBack = document.getElementById('settings-back') as HTMLElement;
const authBack = document.getElementById('auth-back') as HTMLElement;
const formTitle = document.getElementById('form-title') as HTMLElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const toggleLink = document.getElementById('toggle-link') as HTMLElement;
const status = document.getElementById('status') as HTMLElement;
const authTriggerBtn = document.getElementById('auth-trigger-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const userEmailDisplay = document.getElementById('user-email') as HTMLElement;
const syncStatusDisplay = document.getElementById('sync-status') as HTMLElement;
const shortcutInput = document.getElementById('shortcut-input') as HTMLInputElement;
const saveShortcutBtn = document.getElementById('save-shortcut-btn') as HTMLButtonElement;
const shortcutStatus = document.getElementById('shortcut-status') as HTMLElement;
const historyList = document.getElementById('history-list') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

const renderHistory = (filter = '') => {
  historyList.innerHTML = '';
  filteredHistory = fullHistory.filter((t: string) =>
    t.toLowerCase().includes(filter.toLowerCase())
  );
  if (fullHistory.length === 0) {
    historyList.innerHTML =
      '<div class="text-mute text-center py-8 text-[13px] italic">[History empty]</div>';
    return;
  }
  if (filteredHistory.length === 0) {
    historyList.innerHTML =
      '<div class="text-mute text-center py-8 text-[13px] italic">[No matches]</div>';
    return;
  }
  if (localSelectedIndex >= filteredHistory.length) localSelectedIndex = filteredHistory.length - 1;

  filteredHistory.forEach((text: string, i: number) => {
    const item = document.createElement('div'),
      isSel = i === localSelectedIndex;
    item.className = `p-3 bg-surface-card border rounded-sm cursor-pointer group transition-all flex items-start gap-3 ${isSel ? 'border-accent ring-1 ring-accent' : 'border-hairline hover:border-accent'}`;
    item.innerHTML = `
      <span class="text-[10px] ${isSel ? 'text-accent font-bold' : 'text-mute'} font-mono mt-0.5">${i + 1}</span>
      <div class="flex-1 min-w-0"><div class="text-[13px] ${isSel ? 'text-accent font-bold' : 'text-primary'} break-words whitespace-pre-wrap">${text.length > 100 ? text.substring(0, 97) + '...' : text}</div></div>
      <div class="text-[10px] ${isSel ? 'text-accent' : 'text-mute'} group-hover:text-accent font-mono mt-0.5">${isSel ? '►' : '↵'}</div>`;
    item.onclick = () => {
      localSelectedIndex = i;
      (window as any).api.copyToClipboard(text);
    };
    historyList.appendChild(item);
    if (isSel) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
};

searchInput.oninput = (e: any) => {
  localSelectedIndex = 0;
  renderHistory(e.target.value);
};

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    return;
  }
  if (e.key === 'Escape') {
    if (document.activeElement === searchInput) searchInput.blur();
    else if (!authForm.classList.contains('hidden')) authBack.click();
    else if (!settingsView.classList.contains('hidden')) settingsBack.click();
    else {
      localSelectedIndex = -1;
      renderHistory(searchInput.value);
    }
    return;
  }
  if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const idx = parseInt(e.key) - 1;
    if (filteredHistory[idx]) (window as any).api.copyToClipboard(filteredHistory[idx]);
    return;
  }
  if (document.activeElement !== searchInput) {
    if (e.key === 'j') {
      localSelectedIndex = (localSelectedIndex + 1) % (filteredHistory.length || 1);
      renderHistory(searchInput.value);
    } else if (e.key === 'k') {
      localSelectedIndex =
        localSelectedIndex <= 0 ? (filteredHistory.length || 1) - 1 : localSelectedIndex - 1;
      renderHistory(searchInput.value);
    } else if (e.key === 'Enter' && localSelectedIndex !== -1)
      (window as any).api.copyToClipboard(filteredHistory[localSelectedIndex]);
  } else if (e.key === 'Enter' && filteredHistory.length > 0) {
    (window as any).api.copyToClipboard(
      filteredHistory[localSelectedIndex === -1 ? 0 : localSelectedIndex]
    );
  }
});

settingsToggle.onclick = () => {
  historyView.classList.add('hidden');
  settingsView.classList.remove('hidden');
  settingsToggle.classList.add('hidden');
};
settingsBack.onclick = () => {
  settingsView.classList.add('hidden');
  historyView.classList.remove('hidden');
  settingsToggle.classList.remove('hidden');
};
authTriggerBtn.onclick = () => authForm.classList.remove('hidden');
authBack.onclick = () => authForm.classList.add('hidden');

(window as any).api.onHistoryUpdate((h: string[]) => {
  fullHistory = h as any;
  renderHistory(searchInput.value);
});
(window as any).api.onFocusSearch(() => {
  searchInput.focus();
  searchInput.select();
});

const loadData = async () => {
  shortcutInput.value = await (window as any).api.getShortcut();
  fullHistory = await (window as any).api.getHistory();
  renderHistory();
};
loadData();

saveShortcutBtn.onclick = async () => {
  const val = shortcutInput.value.trim();
  if (!val) return;
  saveShortcutBtn.disabled = true;
  shortcutStatus.innerText = 'Updating...';
  const res = await (window as any).api.updateShortcut(val);
  shortcutStatus.innerText = res.success ? 'Updated!' : 'Error: ' + res.error;
  shortcutStatus.className = 'text-[10px] mt-2 ' + (res.success ? 'text-success' : 'text-danger');
  setTimeout(() => {
    shortcutStatus.innerText = '';
    saveShortcutBtn.disabled = false;
  }, 2000);
};

logoutBtn.onclick = async () => {
  await (window as any).api.logout();
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
  const email = (document.getElementById('email') as HTMLInputElement).value,
    pass = (document.getElementById('password') as HTMLInputElement).value;
  status.classList.remove('hidden');
  status.innerText = 'Processing...';
  const res = isLogin
    ? await (window as any).api.login({ email, password: pass })
    : await (window as any).api.register({ email, password: pass });
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
