const toggleBtn = document.getElementById('toggleBtn');
const label = document.getElementById('label');

let isEnabled = false;

// 讀取目前狀態
chrome.storage.local.get(['enabled'], (result) => {
  isEnabled = result.enabled ?? false;
  updateUI();
});

// 點擊切換
toggleBtn.addEventListener('click', async () => {
  isEnabled = !isEnabled;
  
  // 儲存狀態
  chrome.storage.local.set({ enabled: isEnabled });
  updateUI();
  
  // 通知 content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle', enabled: isEnabled });
  }
});

function updateUI() {
  label.textContent = isEnabled ? '已啟用' : '已停用';
  toggleBtn.className = 'toggle-btn ' + (isEnabled ? 'active' : 'inactive');
}
