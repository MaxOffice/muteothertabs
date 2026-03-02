async function queryTabs(queryInfo) {
  return await chrome.tabs.query(queryInfo);
}

async function updateMuted(tabId, muted) {
  try {
    await chrome.tabs.update(tabId, { muted });
  } catch {
    // Ignore tabs that cannot be updated (e.g., internal pages)
  }
}

async function muteAllTabs(muted) {
  const tabs = await queryTabs({});
  await Promise.all(tabs.map(t => updateMuted(t.id, muted)));
  return tabs.length;
}

async function soloCurrentTab() {
  const activeTabs = await queryTabs({ active: true, currentWindow: true });
  if (!activeTabs.length) return { total: 0, mutedOthers: 0 };
  const activeId = activeTabs[0].id;

  const tabs = await queryTabs({});
  await Promise.all(tabs.map(t => updateMuted(t.id, t.id !== activeId)));
  return { total: tabs.length, mutedOthers: Math.max(0, tabs.length - 1) };
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'mute_all_tabs') await muteAllTabs(true);
  if (command === 'unmute_all_tabs') await muteAllTabs(false);
  if (command === 'solo_current_tab') await soloCurrentTab();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.action === 'mute_all_tabs') {
        const n = await muteAllTabs(true);
        sendResponse({ ok: true, message: `Muted ${n} tab(s).` });
      } else if (msg.action === 'unmute_all_tabs') {
        const n = await muteAllTabs(false);
        sendResponse({ ok: true, message: `Unmuted ${n} tab(s).` });
      } else if (msg.action === 'solo_current_tab') {
        const res = await soloCurrentTab();
        sendResponse({ ok: true, message: `Solo mode: muted ${res.mutedOthers} tab(s).` });
      } else {
        sendResponse({ ok: false, message: 'Unknown action.' });
      }
    } catch {
      sendResponse({ ok: false, message: 'Error.' });
    }
  })();
  return true;
});
