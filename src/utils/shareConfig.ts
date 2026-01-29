/**
 * 分享配置工具
 * 自动检测当前域名，生成正确的分享链接
 */

// 获取当前网站的基础 URL
export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
};

// 生成分享链接
export const getShareUrl = (path: string = ''): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

// 生成分享文本
export interface ShareTextParams {
  title: string;           // 古代官职/职业
  salaryInTael: number;    // 折合纹银
  lifestyle?: string;      // 生活水平（可选）
}

export const generateShareText = (params: ShareTextParams): string => {
  const { title, salaryInTael, lifestyle } = params;
  const url = getShareUrl();
  
  let text = `我在古代居然是${title}！岁入折合纹银${salaryInTael}两`;
  
  if (lifestyle) {
    text += `，生活水平：${lifestyle}`;
  }
  
  text += `。快来测测你的古代身份 → ${url}`;
  
  return text;
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器（HTTPS 环境）
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 兼容方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};

// 分享到社交平台（预留接口）
export const shareToSocial = (platform: 'wechat' | 'weibo' | 'qq', text: string) => {
  const encodedText = encodeURIComponent(text);
  const url = getShareUrl();
  const encodedUrl = encodeURIComponent(url);
  
  const shareUrls: Record<string, string> = {
    wechat: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`,
    weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}`,
    qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedText}`,
  };
  
  return shareUrls[platform];
};

// 域名配置（用于SEO和分享）
export const DOMAIN_CONFIG = {
  production: 'gt.kw-aigc.cn',
  productionUrl: 'https://gt.kw-aigc.cn',
  isDevelopment: () => {
    if (typeof window === 'undefined') return true;
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  },
  isProduction: () => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname === DOMAIN_CONFIG.production;
  },
  getCanonicalUrl: () => {
    return DOMAIN_CONFIG.isProduction() 
      ? DOMAIN_CONFIG.productionUrl 
      : getBaseUrl();
  },
};
