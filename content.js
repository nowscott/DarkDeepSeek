// 监听来自popup的主题变更消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'THEME_CHANGED') {
    applyTheme(message.theme);
    // 发送响应以确认消息已收到
    sendResponse({ success: true });
    return true; // 保持消息通道开放以进行异步响应
  }
});

// 从存储中获取当前主题设置
chrome.storage.sync.get(['theme'], (result) => {
  const theme = result.theme || 'system';
  applyTheme(theme);
});

// 如果是跟随系统模式，监听系统主题变更
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
systemThemeMedia.addEventListener('change', (e) => {
  chrome.storage.sync.get(['theme'], (result) => {
    if (result.theme === 'system') {
      applyTheme('system');
    }
  });
});

// 应用主题
function applyTheme(theme) {
  const isDark = theme === 'dark' || 
    (theme === 'system' && systemThemeMedia.matches);

  if (isDark) {
    document.body.setAttribute('data-ds-dark-theme', 'dark');
    // 设置聊天输入框的文字颜色
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.style.color = '#f8faff';
    }
  } else {
    document.body.removeAttribute('data-ds-dark-theme');
    // 恢复聊天输入框的默认文字颜色
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.style.color = '';
    }
  }
}

// 监听聊天框的DOM变化
const chatObserver = new MutationObserver(() => {
  chrome.storage.sync.get(['theme'], (result) => {
    const theme = result.theme || 'system';
    const isDark = theme === 'dark' || 
      (theme === 'system' && systemThemeMedia.matches);
    
    if (isDark) {
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.style.color = '#f8faff';
      }
    }
  });
});

// 开始观察聊天框的变化
const observerConfig = { childList: true, subtree: true };
const chatContainer = document.getElementById('chat-input');
if (chatContainer) {
  chatObserver.observe(chatContainer, observerConfig);
}