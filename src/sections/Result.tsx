import { useRef, useState, useMemo, useCallback } from 'react';
import type { UserInput } from '@/types';
import { FAMILY_SIZE_OPTIONS } from '@/types';
import { 
  calculateAncientIdentity, 
  calculatePurchasingPower, 
  generateDailyLife,
  generateEnhancedVerdict,
  getAdjustedHistoricalFigure,
  calculateQualityOfLife,
  normalizeQoL,
  getQoLStars,
} from '@/data/levelMapping';
import { calculateLivingCosts } from '@/data/livingCost';
import { generateShareText, copyToClipboard, getShareUrl } from '@/utils/shareConfig';
import { classifyOccupationWithLevel } from '@/data/occupationClassifier';
import { getEncouragementMessage } from '@/data/encouragementMessages';
import { preloadImages, exportElementToImage, downloadImage, isMobileDevice } from '@/utils/imageExport';
import { handleOptimizedShare, isWechat } from '@/utils/wechatDetect';
import { Share2, RotateCcw, Landmark, Sun, Download, Copy, Check, ImageIcon, Calculator } from 'lucide-react';
import { Footer } from '@/components/Footer';

interface ResultProps {
  userInput: UserInput;
  onReset: () => void;
}

export default function Result({ userInput, onReset }: ResultProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const accountBookRef = useRef<HTMLDivElement>(null);
  const livingCostRef = useRef<HTMLDivElement>(null);
  const [showStamp, setShowStamp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingBook, setExportingBook] = useState(false);
  const [exportingLivingCost, setExportingLivingCost] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const identity = calculateAncientIdentity(
    userInput.annualSalary, 
    userInput.bonus,
    userInput.exchangeRate
  );
  const purchasingPower = calculatePurchasingPower(identity.salaryInTael);
  
  // 计算生活质量指数和动态历史人物对照
  const qol = useMemo(() => calculateQualityOfLife(userInput, identity.level), [userInput, identity.level]);
  const normalizedQol = useMemo(() => normalizeQoL(qol), [qol]);
  const qolStars = useMemo(() => getQoLStars(normalizedQol), [normalizedQol]);
  const adjustedHistoricalFigure = useMemo(() => 
    getAdjustedHistoricalFigure(identity.level, userInput), 
    [identity.level, userInput]
  );
  
  // 使用决策树生成一天的活动
  const dailyLifeParts = useMemo(() => generateDailyLife(
    userInput,
    identity.level
  ), [userInput, identity.level]);
  
  // 生成增强版判词
  const enhancedVerdict = useMemo(() => generateEnhancedVerdict(
    identity.verdict,
    userInput,
    identity.level
  ), [identity.verdict, userInput, identity.level]);
  
  // 计算官职类型和鼓励语
  const occupationCategory = useMemo(() => 
    classifyOccupationWithLevel(identity.title, identity.level),
    [identity.title, identity.level]
  );
  const encouragementMessage = useMemo(() => 
    getEncouragementMessage(occupationCategory),
    [occupationCategory]
  );
  
  // 计算生活成本
  const livingCosts = useMemo(() => calculateLivingCosts(
    identity.salaryInTael,
    userInput.familySize,
    userInput.cityTier
  ), [identity.salaryInTael, userInput.familySize, userInput.cityTier]);
  
  
  // 获取家庭人口描述
  const familySizeOption = useMemo(() => 
    FAMILY_SIZE_OPTIONS.find(opt => opt.value === userInput.familySize),
    [userInput.familySize]
  );
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  setTimeout(() => setShowStamp(true), 500);

  // 复制链接
  const handleCopyLink = useCallback(async () => {
    const shareText = generateShareText({
      title: `${identity.dynasty}朝的${identity.title}`,
      salaryInTael: identity.salaryInTael,
      lifestyle: livingCosts.lifestyleLevel.name,
    });
    
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('复制失败，请手动复制链接');
    }
  }, [identity, livingCosts]);

  // 原生分享（优化版，支持微信检测）
  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: '官途算略 - 我的古代身份',
      text: `我在古代居然是${identity.dynasty}朝的${identity.title}！岁入折合纹银${identity.salaryInTael}两。快来测测你的古代身份 →`,
      url: getShareUrl(),
    };
    
    // 使用优化的分享处理
    await handleOptimizedShare(shareData, handleCopyLink);
  }, [identity, handleCopyLink]);

  // 导出通关文牒图片（优化版）
  const handleExportImage = useCallback(async () => {
    if (!resultRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      // 1. 预加载图片
      const imageSources = [
        '/silver-ingot.webp',
        '/rice-sack.webp',
        '/pork-cut.webp',
        '/cloth-bolt.webp',
        '/house-ancient.webp',
      ];
      await preloadImages(imageSources);
      
      // 2. 导出图片
      const dataUrl = await exportElementToImage(resultRef.current, {
        backgroundColor: '#FDF8E8',
        scale: isMobileDevice() ? 2 : 3,
        quality: 0.95,
      });
      
      // 3. 下载图片
      downloadImage(dataUrl, `官途算略-${identity.title}-通关文牒.png`);
    } catch (err) {
      console.error('导出失败', err);
      alert(isMobileDevice() 
        ? '导出失败，请尝试截屏保存' 
        : '导出失败，请重试或使用截图功能'
      );
    } finally {
      setIsExporting(false);
    }
  }, [identity.title, isExporting]);

  // 导出年度消费账本（优化版）
  const handleExportAccountBook = useCallback(async () => {
    if (!accountBookRef.current || exportingBook) return;
    
    setExportingBook(true);
    try {
      // 预加载图片
      const imageSources = [
        '/rice-sack.webp',
        '/pork-cut.webp',
        '/cloth-bolt.webp',
        '/house-ancient.webp',
      ];
      await preloadImages(imageSources);
      
      const dataUrl = await exportElementToImage(accountBookRef.current, {
        backgroundColor: '#FFFFFF',
        scale: isMobileDevice() ? 2 : 3,
        filter: (node) => !node.dataset?.exportIgnore,
      });
      
      downloadImage(dataUrl, `官途算略-${identity.title}-年度消费账本.png`);
    } catch (err) {
      console.error('导出失败', err);
      alert(isMobileDevice() ? '导出失败，请尝试截屏保存' : '导出失败，请重试');
    } finally {
      setExportingBook(false);
    }
  }, [identity.title, exportingBook]);

  // 导出账房算计图片（优化版）
  const handleExportLivingCost = useCallback(async () => {
    if (!livingCostRef.current || exportingLivingCost) return;
    
    setExportingLivingCost(true);
    try {
      // 预加载图片
      await preloadImages(['/silver-ingot.webp']);
      
      const dataUrl = await exportElementToImage(livingCostRef.current, {
        backgroundColor: '#FFFFFF',
        scale: isMobileDevice() ? 2 : 3,
        filter: (node) => !node.dataset?.exportIgnore,
      });
      
      downloadImage(dataUrl, `官途算略-${identity.title}-账房算计.png`);
    } catch (err) {
      console.error('导出失败', err);
      alert(isMobileDevice() ? '导出失败，请尝试截屏保存' : '导出失败，请重试');
    } finally {
      setExportingLivingCost(false);
    }
  }, [identity.title, exportingLivingCost]);

  return (
    <div className="min-h-screen py-8 px-0 sm:px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-48 h-48 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <text x="50" y="60" textAnchor="middle" fill="#2E4A62" fontSize="60" className="font-ancient">牒</text>
          </svg>
        </div>
      </div>

      <div className="max-w-3xl mx-auto fade-in">
        {/* 通关文牒主体 */}
        <div 
          ref={resultRef}
          className="relative bg-gradient-to-b from-[#FDF8E8] to-[#F5E6C8] shadow-2xl overflow-hidden chinese-frame"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#C9A961]/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#C9A961]/20 to-transparent"></div>
          </div>

          <div className="relative pt-8 sm:pt-12 pb-4 sm:pb-6 text-center">
            <div className="inline-block relative">
              <h2 className="font-ancient text-3xl sm:text-4xl md:text-5xl text-[#2E4A62] tracking-[0.3em] sm:tracking-[0.5em] mb-2 font-bold">
                通关文牒
              </h2>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4">
                <div className="w-8 sm:w-12 h-0.5 bg-[#C9A961]"></div>
                <div className="w-2 h-2 rotate-45 bg-[#C9372C]"></div>
                <span className="text-[#8B7355] text-xs sm:text-sm font-ancient tracking-widest">{identity.dynasty}朝吏部核发</span>
                <div className="w-2 h-2 rotate-45 bg-[#C9372C]"></div>
                <div className="w-8 sm:w-12 h-0.5 bg-[#C9A961]"></div>
              </div>
            </div>
          </div>

          <div className="relative p-4 sm:p-6 md:p-12 space-y-8 sm:space-y-10">
            {/* 官阶判词 */}
            <div className="relative">
              {showStamp && (
                <div className="absolute -top-6 -right-6 stamp-drop z-20">
                  <div className="w-32 h-32 border-[6px] border-double border-[#C9372C] rounded-xl flex items-center justify-center transform rotate-12 bg-[#C9372C]/5 backdrop-blur-sm shadow-xl">
                    <div className="text-center p-2 border-2 border-[#C9372C] rounded-lg">
                      <div className="text-[#C9372C] font-ancient text-2xl font-bold leading-none mb-1">吏部</div>
                      <div className="text-[#C9372C] font-ancient text-2xl font-bold leading-none">考功</div>
                      <div className="text-[10px] text-[#C9372C] mt-1 tracking-widest">OFFICIAL</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#fffdf5] rounded-lg p-4 sm:p-6 md:p-8 border border-[#2E4A62]/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 hidden sm:block">
                   <Landmark className="w-24 h-24 text-[#2E4A62]" />
                </div>

                <h3 className="font-ancient text-xl sm:text-2xl text-[#2E4A62] mb-4 sm:mb-6 flex items-center gap-2 border-b border-[#2E4A62]/10 pb-2">
                  <div className="w-1 h-5 sm:h-6 bg-[#C9372C]"></div>
                  官阶判词
                </h3>
                
                <div className="space-y-4 sm:space-y-6 text-[#1A1A1A] leading-relaxed sm:leading-loose text-base sm:text-lg font-serif">
                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-[#8B7355] font-ancient text-lg sm:text-xl min-w-[3em] mb-1 sm:mb-0">照得：</span>
                    <div>
                      今有士子一名，岁入<span className="font-bold text-[#C9372C] mx-1">{(identity.totalIncome).toLocaleString()}</span>元。
                    </div>
                  </div>
                  
                  <div className="pl-4 sm:pl-8 border-l-2 border-[#C9A961]/30 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <span className="text-[#5A4A3A] text-sm sm:text-base">折合纹银</span>
                      <div className="flex items-center gap-1">
                        <img src="/silver-ingot.webp" alt="银两" className="w-6 h-6 sm:w-8 sm:h-8 inline-block" crossOrigin="anonymous" />
                        <span className="font-bold text-2xl sm:text-3xl text-[#C9372C] font-ancient">{identity.salaryInTael}</span>
                        <span className="text-[#5A4A3A] text-sm sm:text-base">两</span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-[#8B7355] bg-[#C9A961]/10 inline-block px-2 py-1 rounded">
                      按{userInput.exchangeRate}元/两换算
                    </div>
                  </div>
                  
                  {/* 生活质量指数 */}
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#2E4A62]/5 rounded border border-[#2E4A62]/10 relative">
                    <div className="absolute -left-1 top-3 sm:top-4 w-2 h-6 sm:h-8 bg-[#2E4A62] rounded-r"></div>
                    <div className="text-center sm:text-left">
                      <div className="text-[#8B7355] font-ancient text-sm mb-2">生活质量</div>
                      <p className="text-sm sm:text-base text-[#5A4A3A] leading-relaxed">
                        综合加班强度、居所所在、仕途资历、工作环境及朝廷恩赏，
                        生活质量指数为 <span className="font-bold text-[#C9372C] mx-1">{normalizedQol}</span> 分
                        <span className="text-[#C9A961] ml-2">{qolStars}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 text-center sm:text-left">
                    查《醒贪简要录》，若论岁入，堪比<span className="font-bold text-[#2E4A62] mx-1">{identity.dynasty}</span>朝
                    <span className="font-bold text-[#C9372C] text-xl sm:text-2xl font-ancient mx-1 sm:mx-2">{identity.title}</span>。
                  </div>
                  
                  
                  <div className="mt-6 text-center">
                    <p className="text-[#2E4A62] font-medium text-xl font-ancient border-y border-[#2E4A62]/10 py-3">
                      「{enhancedVerdict}」
                    </p>
                  </div>
                  
                  {adjustedHistoricalFigure && (
                    <div className="mt-4 text-center">
                      <p className="text-[#5A4A3A] text-sm">
                        <span className="font-bold text-[#2E4A62]">历史对照：</span>
                        与{adjustedHistoricalFigure}相当
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-8 text-right">
                    <p className="font-ancient text-lg">特赐此牒，以照身份。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 你可能的一天 */}
            <div className="bg-[#FFF8E7] rounded-lg p-4 sm:p-6 border border-[#C9A961]/40 shadow-inner relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A961]/40 to-transparent"></div>
              
              <h3 className="font-ancient text-lg sm:text-xl text-[#2E4A62] mb-3 sm:mb-4 flex items-center gap-2">
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A961]" />
                你可能的一天
              </h3>
              <p className="text-xs sm:text-sm text-[#8B7355] mb-4 sm:mb-6 pl-1 italic">
                作为{identity.dynasty}朝的「{identity.title}」
                {dailyLifeParts.mood && <span className="ml-2">—— {dailyLifeParts.mood}</span>}
              </p>
              
              <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-[9px] sm:before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C9A961]/30">
                <div className="relative group">
                  <div className="absolute -left-[25px] sm:-left-[29px] w-5 h-5 sm:w-6 sm:h-6 bg-[#FFF8E7] border-2 border-[#C9A961] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C9A961] rounded-full"></div>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[#8B7355] font-ancient font-bold bg-[#C9A961]/10 px-2 py-0.5 rounded">卯时 · 清晨</span>
                    <p className="text-[#5A4A3A] mt-2 leading-relaxed text-sm sm:text-base">{dailyLifeParts.morning}</p>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute -left-[25px] sm:-left-[29px] w-5 h-5 sm:w-6 sm:h-6 bg-[#FFF8E7] border-2 border-[#C9A961] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C9A961] rounded-full"></div>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[#8B7355] font-ancient font-bold bg-[#C9A961]/10 px-2 py-0.5 rounded">未时 · 午后</span>
                    <p className="text-[#5A4A3A] mt-2 leading-relaxed text-sm sm:text-base">{dailyLifeParts.afternoon}</p>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute -left-[25px] sm:-left-[29px] w-5 h-5 sm:w-6 sm:h-6 bg-[#FFF8E7] border-2 border-[#C9A961] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C9A961] rounded-full"></div>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-[#8B7355] font-ancient font-bold bg-[#C9A961]/10 px-2 py-0.5 rounded">酉时 · 傍晚</span>
                    <p className="text-[#5A4A3A] mt-2 leading-relaxed text-sm sm:text-base">{dailyLifeParts.evening}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 购买力清单 - 年度消费账本 */}
            <div ref={accountBookRef} className="bg-white rounded overflow-hidden border border-[#2E4A62]/20">
              <div className="bg-[#2E4A62] text-white p-3 sm:p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <h3 className="font-ancient text-lg sm:text-xl relative z-10">购买力清单</h3>
                <p className="text-xs sm:text-sm opacity-80 relative z-10 mt-1">{identity.dynasty}朝万历年间 · 若不计日常开支，肆意消费 · 年俸{identity.salaryInTael}两可购</p>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="text-center pb-3 sm:pb-4 border-b border-dashed border-[#C9A961]/40">
                  <p className="text-[#5A4A3A] text-xs sm:text-sm">生活水平评级</p>
                  <p className="text-xl sm:text-2xl text-[#2E4A62] font-ancient font-bold mt-1">{purchasingPower.lifestyle}</p>
                </div>

                {/* 物品清单 - 网格布局 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {purchasingPower.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#FDF8E8] rounded border border-[#F5E6C8] hover:border-[#C9A961] transition-colors">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-white rounded overflow-hidden shadow-sm border border-gray-100 p-1">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2E4A62] text-xs sm:text-sm">{item.name}</span>
                          <span className="text-base sm:text-lg font-bold text-[#C9372C] font-ancient">
                            {item.quantity.toLocaleString()}
                            <span className="text-[10px] sm:text-xs text-[#8B7355] ml-1 font-sans">{item.unit}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] sm:text-xs text-[#8B7355] truncate flex-1">{item.modernEquivalent}</span>
                          <span className="text-[10px] sm:text-xs text-[#C9A961] font-medium ml-2 bg-white px-1 rounded">
                            {item.cost.toFixed(1)}两
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 田地 */}
                  {purchasingPower.landArea && purchasingPower.landArea > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#2E4A62]/5 rounded sm:col-span-2 border border-dashed border-[#2E4A62]/30">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-white rounded overflow-hidden shadow-sm p-1">
                        <img 
                          src="/farmland.webp" 
                          alt="京郊良田"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <span className="font-bold text-[#2E4A62] text-sm sm:text-base">京郊良田</span>
                            <span className="text-[10px] sm:text-xs text-[#8B7355] ml-1 sm:ml-2">（参考置业能力）</span>
                          </div>
                          <span className="text-lg sm:text-xl font-bold text-[#2E4A62] font-ancient">
                            {purchasingPower.landArea.toLocaleString()}
                            <span className="text-xs sm:text-sm text-[#8B7355] ml-1 font-sans">亩</span>
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-[#8B7355] mt-1">
                          40两/亩，约等于现代{purchasingPower.landArea}平米一线城市房价
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 sm:pt-4 border-t-2 border-dashed border-[#C9A961]/30 space-y-3 sm:space-y-4">
                  <p className="text-center text-xs sm:text-sm text-[#8B7355]">
                    以上物品合计需银 <span className="font-bold text-[#5A4A3A]">{purchasingPower.totalCost.toFixed(1)}</span> 两
                  </p>
                  <div className="bg-[#C9372C]/5 p-3 sm:p-4 rounded">
                    <p className="text-center text-xs sm:text-sm text-[#5A4A3A] leading-relaxed">
                      年俸 <span className="font-bold text-[#C9372C] text-base sm:text-lg font-ancient">{identity.salaryInTael}</span> 两，
                      若购置以上物品，
                      {identity.salaryInTael > purchasingPower.totalCost 
                        ? <>尚余 <span className="font-bold text-[#2E4A62]">{(identity.salaryInTael - purchasingPower.totalCost).toFixed(1)}</span> 两可作他用</>
                        : '略有不足'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="h-2 sm:h-3 bg-[#C9A961]/20 border-t border-[#C9A961]/30"></div>
            </div>

            {/* 账房算计 - 生活成本分析 */}
            <div ref={livingCostRef} className="bg-white rounded overflow-hidden border border-[#8B7355]/20">
              <div className="bg-[#8B7355] text-white p-3 sm:p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <h3 className="font-ancient text-lg sm:text-xl relative z-10 flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  账房算计
                </h3>
                <p className="text-xs sm:text-sm opacity-80 relative z-10 mt-1">
                  {familySizeOption?.label || `${userInput.familySize}口之家`} · 若精打细算 · 年度收支明细
                </p>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* 生活水平判定 */}
                <div className="text-center pb-3 sm:pb-4 border-b border-dashed border-[#8B7355]/30">
                  <p className="text-[#5A4A3A] text-xs sm:text-sm">家计评级</p>
                  <p className={`text-xl sm:text-2xl font-ancient font-bold mt-1 ${
                    livingCosts.surplus >= 0 ? 'text-[#2E4A62]' : 'text-[#C9372C]'
                  }`}>
                    {livingCosts.lifestyleLevel.name} · {livingCosts.lifestyleLevel.description}
                  </p>
                  <p className="text-xs sm:text-sm text-[#8B7355] mt-2 italic">
                    {livingCosts.lifestyleLevel.description}
                  </p>
                </div>

                {/* 支出明细 */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#5A4A3A] flex items-center gap-2">
                    <span className="w-1 h-3 sm:h-4 bg-[#8B7355]"></span>
                    年度支出明细
                  </h4>
                  
                  {livingCosts.items.map((item, index) => (
                    <div key={index} className="py-1.5 sm:py-2 border-b border-dotted border-[#C9A961]/30 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                          <span className="text-[#5A4A3A] text-sm sm:text-base">{item.name}</span>
                          <span className="text-[10px] sm:text-xs text-[#8B7355] opacity-70">{item.description}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-[#2E4A62] text-sm sm:text-base">{item.cost.toFixed(1)}</span>
                          <span className="text-[10px] sm:text-xs text-[#8B7355] ml-1">两/年</span>
                        </div>
                      </div>
                      {item.comment && (
                        <div className="mt-1 pl-2 border-l-2 border-[#C9A961]/30">
                          <span className="text-[10px] sm:text-xs text-[#8B7355] italic">
                            · {item.comment}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 汇总 */}
                <div className="pt-3 sm:pt-4 border-t-2 border-[#8B7355]/20 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#8B7355]">年度支出合计</span>
                    <span className="text-[#5A4A3A] font-medium">{livingCosts.totalCost.toFixed(1)} 两</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#8B7355]">年度收入</span>
                    <span className="text-[#5A4A3A] font-medium">{livingCosts.income} 两</span>
                  </div>
                  <div className={`p-2 sm:p-3 rounded ${
                    livingCosts.surplus >= 0 ? 'bg-[#2E4A62]/5' : 'bg-[#C9372C]/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${livingCosts.surplus >= 0 ? 'text-[#2E4A62]' : 'text-[#C9372C]'}`}>
                        {livingCosts.surplus >= 0 ? '年度结余' : '年度亏空'}
                      </span>
                      <span className={`text-lg sm:text-xl font-bold font-ancient flex items-center gap-1 ${
                        livingCosts.surplus >= 0 ? 'text-[#2E4A62]' : 'text-[#C9372C]'
                      }`}>
                        <img src="/silver-ingot.webp" alt="银两" className="w-5 h-5 sm:w-6 sm:h-6" crossOrigin="anonymous" />
                        {livingCosts.surplus >= 0 ? '+' : ''}{livingCosts.surplus.toFixed(1)}
                        <span className="text-xs sm:text-sm text-[#8B7355] font-sans">两</span>
                        <span className="text-[10px] sm:text-xs text-[#8B7355] font-sans ml-1">
                          ({livingCosts.surplusRatio.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    {livingCosts.surplus < 0 && (
                      <div className="mt-2 pt-2 border-t border-[#C9372C]/20">
                        <p className="text-xs sm:text-sm text-[#C9372C] italic text-center font-ancient">
                          「{encouragementMessage}」
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 恩格尔系数 */}
                <div className="pt-3 sm:pt-4 border-t border-dashed border-[#8B7355]/20">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-[#8B7355]">恩格尔系数</span>
                      <span className="text-xs text-[#8B7355] opacity-60 ml-2">（食物支出占比）</span>
                    </div>
                    <span className="font-bold text-[#5A4A3A]">{livingCosts.engleCoefficient.toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                    {/* 古代平均水平标记线 */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-[#C9372C]/60 z-10"
                      style={{ left: '65%' }}
                      title="明朝普通百姓平均约65%"
                    ></div>
                    <div 
                      className={`h-full transition-all ${
                        livingCosts.engleCoefficient > 60 ? 'bg-[#C9372C]' :
                        livingCosts.engleCoefficient > 50 ? 'bg-[#C9A961]' :
                        livingCosts.engleCoefficient > 40 ? 'bg-[#8B7355]' :
                        'bg-[#2E4A62]'
                      }`}
                      style={{ width: `${Math.min(livingCosts.engleCoefficient, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs text-[#8B7355] mt-1">
                    <span>豪富</span>
                    <span>富裕</span>
                    <span>小康</span>
                    <span>温饱</span>
                    <span>贫困</span>
                  </div>
                  {/* 古代参考 */}
                  <div className="mt-2 text-xs text-[#8B7355] flex flex-wrap items-center gap-1 opacity-70">
                    <span className="inline-block w-2 h-2 bg-[#C9372C]/60 rounded-sm"></span>
                    <span>相对而言，明朝约九成百姓恩格尔系数超60%</span>
                    {livingCosts.engleCoefficient < 50 && (
                      <span className="ml-1">· 您的恩格尔数值较低，是因为现代收入换算后相对较高</span>
                    )}
                  </div>
                </div>

                {/* 与基准对比 */}
                <div className="text-xs text-[#8B7355] text-center pt-2 opacity-70">
                  参考：五口之家年支出基准约{livingCosts.vsBaseFamily.baseCost}两
                  {livingCosts.vsBaseFamily.ratio !== 1 && (
                    <span>，您的支出约为基准的{(livingCosts.vsBaseFamily.ratio * 100).toFixed(0)}%</span>
                  )}
                </div>

              </div>
              
              <div className="h-2 sm:h-3 bg-[#8B7355]/20 border-t border-[#8B7355]/30"></div>
            </div>

            {/* 保存按钮组 - 平级排列 */}
            <div data-export-ignore="true" className="flex justify-center gap-2 sm:gap-4 flex-wrap">
              <button
                onClick={handleExportAccountBook}
                disabled={exportingBook}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#8B7355] hover:text-[#2E4A62] border border-[#8B7355]/30 hover:border-[#2E4A62]/50 rounded-full transition-all disabled:opacity-50"
              >
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                {exportingBook ? '正在生成...' : '保存年度账本'}
              </button>
              <button
                onClick={handleExportLivingCost}
                disabled={exportingLivingCost}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#8B7355] hover:text-[#2E4A62] border border-[#8B7355]/30 hover:border-[#2E4A62]/50 rounded-full transition-all disabled:opacity-50"
              >
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                {exportingLivingCost ? '正在生成...' : '保存账房算计'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 pt-6 sm:pt-8 border-t-2 border-[#C9A961]/20">
              <div className="text-[#8B7355] text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 text-center sm:text-left">
                <p>官途算略 · 看看你穿越回古代的生活待遇如何</p>
                <p>
                  {userInput.calculationMode === 'ppp' ? (
                    <span className="text-[#2E4A62] font-medium">PPP购买力平价模式 · 基于《宛署杂记》《醒贪简要录》核算</span>
                  ) : (
                    <span className="text-[#C9372C]">克重换算模式 · 未考虑购买力变化，结果仅供参考</span>
                  )}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="font-ancient text-xl sm:text-2xl text-[#C9372C] relative inline-block px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[#C9372C] rounded-sm transform -rotate-2">
                  吏部 押
                  <div className="absolute inset-0 border border-[#C9372C] m-0.5 rounded-sm opacity-50"></div>
                </div>
                <div className="text-[#8B7355] mt-2 font-ancient text-sm sm:text-base">
                  {year}年{month}月{day}日
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 text-[#5A4A3A] hover:text-[#C9372C] border border-[#5A4A3A]/30 hover:border-[#C9372C]/50 rounded-full transition-all group"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            <span className="font-ancient">重新测算</span>
          </button>
          
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-[#C9372C] text-white rounded-full hover:bg-[#B52E24] transition-colors shadow-md font-ancient disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span>{isExporting ? '正在生成...' : '保存通关文牒'}</span>
          </button>
          
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-6 py-3 bg-[#2E4A62] text-[#F5E6C8] rounded-full hover:bg-[#1E3A52] transition-colors shadow-md font-ancient"
          >
            <Share2 className="w-5 h-5" />
            <span>{isWechat() ? '分享' : '昭告天下'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-3 text-[#8B7355] hover:text-[#2E4A62] border border-[#8B7355]/30 hover:border-[#2E4A62]/50 rounded-full transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
          </button>
        </div>
        
        {/* 移动端和微信环境提示 */}
        {(isMobileDevice() || isWechat()) && (
          <div className="mt-4 text-center text-[#8B7355] text-xs bg-[#FDF8E8] p-3 rounded-lg border border-[#C9A961]/20 space-y-2">
            {isMobileDevice() && !isWechat() && (
              <p>📱 点击"保存通关文牒"后，图片将在新窗口打开，请长按保存</p>
            )}
            {isWechat() && (
              <p>在微信中分享：点击右上角"..."菜单，选择"分享给朋友"</p>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-[#8B7355] text-xs space-y-2 opacity-70">
          <p>换算说明：{userInput.exchangeRate}元人民币 ≈ 1两白银（明朝万历年间购买力平价）</p>
          <p>数据来源：《宛署杂记》《醒贪简要录》等历史文献</p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
