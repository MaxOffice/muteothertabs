const statusEl = document.getElementById('status');
const muteAllBtn = document.getElementById('muteAllBtn');
const soloBtn = document.getElementById('soloBtn');
const unmuteAllBtn = document.getElementById('unmuteAllBtn');

const kbdMuteAll = document.getElementById('kbdMuteAll');
const kbdSolo = document.getElementById('kbdSolo');
const kbdUnmuteAll = document.getElementById('kbdUnmuteAll');

function setStatus(msg, ok=true) {
  statusEl.style.color = ok ? '#065f46' : '#b91c1c';
  statusEl.textContent = msg;
  window.setTimeout(() => { statusEl.textContent = ''; }, 1800);
}

function send(action) {
  chrome.runtime.sendMessage({ action }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus('Action failed.', false);
      return;
    }
    if (resp && resp.ok) setStatus(resp.message || 'Done.');
    else setStatus('Action failed.', false);
  });
}

function showCurrentShortcuts() {
  if (!chrome.commands || !chrome.commands.getAll) return;

  chrome.commands.getAll((cmds) => {
    const map = new Map(cmds.map(c => [c.name, c.shortcut || '']));
    if (map.get('mute_all_tabs')) kbdMuteAll.textContent = map.get('mute_all_tabs');
    if (map.get('solo_current_tab')) kbdSolo.textContent = map.get('solo_current_tab');
    if (map.get('unmute_all_tabs')) kbdUnmuteAll.textContent = map.get('unmute_all_tabs');
  });
}

muteAllBtn.addEventListener('click', () => send('mute_all_tabs'));
soloBtn.addEventListener('click', () => send('solo_current_tab'));
unmuteAllBtn.addEventListener('click', () => send('unmute_all_tabs'));

showCurrentShortcuts();
