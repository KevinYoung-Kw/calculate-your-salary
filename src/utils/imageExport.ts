// 图片导出工具 - 使用 modern-screenshot（移动端兼容性更好）

import { domToPng, domToBlob } from 'modern-screenshot';

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * 检测是否为iOS设备
 */
export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * 预加载图片（确保图片在导出前已加载）
 * @param urls 图片URL数组
 * @returns Promise
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`图片预加载失败: ${url}`);
        resolve(); // 失败也继续
      };
      // 处理相对路径
      img.src = url.startsWith('/') ? window.location.origin + url : url;
    });
  });
  
  await Promise.all(promises);
}

/**
 * 等待DOM完全渲染
 * @param ms 等待毫秒数
 */
async function waitForRender(ms: number = 100): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, ms);
    });
  });
}

/**
 * 导出元素为PNG图片（主函数）
 * @param element DOM元素
 * @param options 导出选项
 * @returns 图片DataURL
 */
export async function exportElementToImage(
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    scale?: number;
    quality?: number;
    filter?: (node: HTMLElement) => boolean;
  } = {}
): Promise<string> {
  const {
    backgroundColor = '#FFFFFF',
    scale = isMobileDevice() ? 2 : 3,
    quality = 0.95,
    filter,
  } = options;
  
  // 等待DOM渲染完成
  await waitForRender(200);
  
  try {
    // 使用 modern-screenshot 导出
    const dataUrl = await domToPng(element, {
      backgroundColor,
      scale,
      quality,
      filter: filter ? (node) => {
        if (node instanceof HTMLElement) {
          return filter(node);
        }
        return true;
      } : undefined,
      // 关键选项：处理外部资源
      fetchRequestInit: {
        mode: 'cors',
        credentials: 'omit',
      },
      // 嵌入字体
      embedWebFonts: true,
      // 处理图片
      onCloneNode: (node) => {
        // 确保图片有 crossOrigin 属性
        if (node instanceof HTMLImageElement) {
          node.crossOrigin = 'anonymous';
        }
        return node;
      },
    });
    
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      throw new Error('生成的图片无效');
    }
    
    return dataUrl;
  } catch (error) {
    console.error('modern-screenshot 导出失败:', error);
    throw error;
  }
}

/**
 * 导出元素为Blob（用于更好的移动端兼容性）
 */
export async function exportElementToBlob(
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    scale?: number;
    quality?: number;
    filter?: (node: HTMLElement) => boolean;
  } = {}
): Promise<Blob> {
  const {
    backgroundColor = '#FFFFFF',
    scale = isMobileDevice() ? 2 : 3,
    quality = 0.95,
    filter,
  } = options;
  
  await waitForRender(200);
  
  const blob = await domToBlob(element, {
    backgroundColor,
    scale,
    quality,
    filter: filter ? (node) => {
      if (node instanceof HTMLElement) {
        return filter(node);
      }
      return true;
    } : undefined,
    fetchRequestInit: {
      mode: 'cors',
      credentials: 'omit',
    },
    embedWebFonts: true,
  });
  
  if (!blob) {
    throw new Error('生成Blob失败');
  }
  
  return blob;
}

/**
 * 下载图片（统一处理PC和移动端）
 * @param dataUrl 图片DataURL
 * @param filename 文件名
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const isMobile = isMobileDevice();
  
  if (isMobile) {
    // 移动端：打开新窗口让用户长按保存
    openImageInNewWindow(dataUrl, filename);
  } else {
    // PC端：直接下载
    downloadViaLink(dataUrl, filename);
  }
}

/**
 * 在新窗口打开图片（移动端用）
 */
function openImageInNewWindow(dataUrl: string, filename: string): void {
  const newWindow = window.open('', '_blank');
  
  if (newWindow) {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
          <title>${filename}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .container {
              max-width: 100%;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              background: white;
            }
            .tip-card {
              background: white;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.15);
              max-width: 320px;
              width: 100%;
            }
            .tip-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .tip-title {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 12px;
            }
            .tip-desc {
              font-size: 14px;
              color: #666;
              line-height: 1.6;
            }
            .tip-highlight {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 600;
            }
            .close-btn {
              margin-top: 20px;
              padding: 14px 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 25px;
              font-size: 16px;
              font-weight: 500;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${dataUrl}" alt="${filename}" />
            <div class="tip-card">
              <div class="tip-icon">📱</div>
              <div class="tip-title">保存图片</div>
              <div class="tip-desc">
                <span class="tip-highlight">长按上方图片</span><br/>
                选择"保存图片"或"存储图像"<br/>
                即可保存到手机相册
              </div>
              <button class="close-btn" onclick="window.close()">完成</button>
            </div>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  } else {
    // 无法打开新窗口时，尝试直接下载
    alert('请长按下方区域保存图片，或使用截屏功能');
    downloadViaLink(dataUrl, filename);
  }
}

/**
 * 通过链接下载（PC端用）
 */
function downloadViaLink(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // 延迟移除，确保下载开始
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

/**
 * 使用 Blob URL 下载（备用方案）
 */
export async function downloadViaBlob(
  element: HTMLElement,
  filename: string,
  options?: {
    backgroundColor?: string;
    scale?: number;
    filter?: (node: HTMLElement) => boolean;
  }
): Promise<void> {
  try {
    const blob = await exportElementToBlob(element, options);
    const blobUrl = URL.createObjectURL(blob);
    
    if (isMobileDevice()) {
      openImageInNewWindow(blobUrl, filename);
    } else {
      downloadViaLink(blobUrl, filename);
    }
    
    // 延迟释放 URL
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (error) {
    console.error('Blob下载失败:', error);
    throw error;
  }
}
