// 微信环境检测和分享优化

/**
 * 检测是否在微信客户端中
 */
export function isWechat(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
}

/**
 * 检测是否在微信小程序中
 */
export function isWechatMiniProgram(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /miniprogram/.test(ua);
}

/**
 * 检测是否支持原生分享
 */
export function canNativeShare(): boolean {
  return !!(navigator.share && navigator.canShare);
}

/**
 * 显示微信分享提示
 * @param message 自定义提示信息
 */
export function showWechatShareTip(message?: string): void {
  const defaultMessage = message || '请点击右上角 "..." 菜单\n选择"分享给朋友"或"分享到朋友圈"';
  
  // 创建提示遮罩
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 20px;
    animation: fadeIn 0.3s ease;
  `;
  
  // 箭头指示
  const arrow = document.createElement('div');
  arrow.style.cssText = `
    position: absolute;
    top: 10px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 20px solid white;
    animation: bounce 1s infinite;
  `;
  
  // 提示文本
  const tipBox = document.createElement('div');
  tipBox.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px 25px;
    margin: 60px 20px 0 20px;
    max-width: 300px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  tipBox.innerHTML = `
    <div style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px;">
      📤 分享到微信
    </div>
    <div style="font-size: 14px; color: #666; line-height: 1.6; white-space: pre-line;">
      ${defaultMessage}
    </div>
    <button 
      onclick="this.getRootNode().host.remove()" 
      style="
        margin-top: 20px;
        padding: 12px 40px;
        background: #07C160;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
      "
    >
      我知道了
    </button>
  `;
  
  overlay.appendChild(arrow);
  overlay.appendChild(tipBox);
  
  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // 添加样式动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(overlay);
  
  // 3秒后自动移除按钮，改为点击任意处关闭
  setTimeout(() => {
    const button = tipBox.querySelector('button');
    if (button) {
      button.textContent = '点击任意处关闭';
    }
  }, 3000);
}

/**
 * 优化的分享处理
 * @param shareData 分享数据
 * @param onCopyFallback 复制链接的回调函数
 */
export async function handleOptimizedShare(
  shareData: {
    title: string;
    text: string;
    url: string;
  },
  onCopyFallback: () => Promise<void>
): Promise<void> {
  // 1. 检测微信环境
  if (isWechat()) {
    showWechatShareTip();
    return;
  }
  
  // 2. 尝试原生分享
  if (canNativeShare()) {
    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      // 用户取消分享或分享失败
      if ((err as Error).name !== 'AbortError') {
        console.warn('分享失败:', err);
      }
      return;
    }
  }
  
  // 3. Fallback到复制链接
  await onCopyFallback();
}

/**
 * 获取环境信息（用于调试）
 */
export function getEnvironmentInfo(): {
  isWechat: boolean;
  isWechatMiniProgram: boolean;
  canNativeShare: boolean;
  userAgent: string;
} {
  return {
    isWechat: isWechat(),
    isWechatMiniProgram: isWechatMiniProgram(),
    canNativeShare: canNativeShare(),
    userAgent: navigator.userAgent,
  };
}
