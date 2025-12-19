// 等待 OpenCC 載入後執行
let converter = null;
let observerStarted = false;
let isConverted = false;

// 初始化轉換器
async function initConverter() {
  if (typeof OpenCC !== 'undefined') {
    converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  }
}

// 轉換文字節點
function convertTextNode(node) {
  if (!converter || !node.nodeValue) return;
  const original = node.nodeValue;
  const converted = converter(original);
  if (original !== converted) {
    node.nodeValue = converted;
  }
}

// 遍歷並轉換所有文字節點
function convertAllText(root = document.body) {
  if (!root) return;
  
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // 跳過 script, style, textarea, input 等元素
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'textarea', 'input', 'noscript'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  
  textNodes.forEach(convertTextNode);
}

// 監聽 DOM 變化，處理動態載入的內容
function startObserver() {
  if (observerStarted) return;
  observerStarted = true;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          convertTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          convertAllText(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 執行轉換
function doConvert() {
  convertAllText();
  startObserver();
  isConverted = true;
}

// 初始化：檢查是否開啟自動轉換
async function init() {
  await initConverter();
  
  chrome.storage.local.get(['autoConvert'], (result) => {
    if (result.autoConvert) {
      doConvert();
    }
  });
}

// 監聯來自 background 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    if (isConverted) {
      // 已轉換 → 重新載入恢復原文
      location.reload();
    } else {
      // 未轉換 → 執行轉換
      doConvert();
    }
  }
});

init();
