document.addEventListener('DOMContentLoaded', () => {
  // 从存储中获取当前主题设置
  chrome.storage.sync.get(['theme'], (result) => {
    const theme = result.theme || 'system';
    document.querySelector(`#${theme}`).checked = true;

    // 初始化时应用主题样式
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.body.setAttribute('data-ds-dark-theme', 'dark');
    } else {
      document.body.removeAttribute('data-ds-dark-theme');
    }
  });

  // 监听主题切换
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const theme = e.target.value;
      
      // 保存主题设置
      chrome.storage.sync.set({ theme });

      // 更新popup界面的主题
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.body.setAttribute('data-ds-dark-theme', 'dark');
      } else {
        document.body.removeAttribute('data-ds-dark-theme');
      }

      // 向content script发送主题变更消息
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'THEME_CHANGED', theme })
            .catch((error) => {
              console.log('主题更新消息发送失败:', error);
            });
        }
      });
    });
  });
});