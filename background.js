// 點擊圖示時 → 切換轉換狀態
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});

