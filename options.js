const autoConvert = document.getElementById('autoConvert');
const savedMsg = document.getElementById('savedMsg');

// 載入設定
chrome.storage.local.get(['autoConvert'], (result) => {
  autoConvert.checked = result.autoConvert ?? false;
});

// 儲存設定
autoConvert.addEventListener('change', () => {
  const value = autoConvert.checked;
  
  chrome.storage.local.set({ autoConvert: value }, () => {
    // 如果開啟自動轉換，同時啟用轉換功能
    if (value) {
      chrome.storage.local.set({ enabled: true });
    }
    showSaved();
  });
});

function showSaved() {
  savedMsg.classList.add('show');
  setTimeout(() => {
    savedMsg.classList.remove('show');
  }, 1500);
}

