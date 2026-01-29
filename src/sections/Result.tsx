import { useRef, useState, useMemo, useCallback } from 'react';
import type { UserInput } from '@/types';
import { FAMILY_SIZE_OPTIONS } from '@/types';
import { 
  calculateAncientIdentity, 
  calculatePurchasingPower, 
  generatePersonalizedComment,
  generateDailyLife,
  generateEnhancedVerdict,
  getOccupationTypeConfig
} from '@/data/levelMapping';
import { calculateLivingCosts } from '@/data/livingCost';
import { getCostNarrative } from '@/data/sceneContent';
import { generateShareText, copyToClipboard, getShareUrl } from '@/utils/shareConfig';
import { Share2, RotateCcw, Landmark, Sun, Download, Copy, Check, ImageIcon, Calculator } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { toPng } from 'html-to-image';

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
  const personalizedComment = generatePersonalizedComment(userInput);
  
  // 获取职业大类对应的配置
  const occupationConfig = useMemo(() => getOccupationTypeConfig(userInput.occupationType), [userInput.occupationType]);
  
  // 使用决策树生成一天的活动
  const dailyLifeParts = useMemo(() => generateDailyLife(
    userInput,
    identity.level
  ), [userInput, identity.level]);
  
  // 生成增强版判词
  const enhancedVerdict = useMemo(() => generateEnhancedVerdict(
    identity.verdict,
    userInput
  ), [identity.verdict, userInput]);
  
  // 计算生活成本
  const livingCosts = useMemo(() => calculateLivingCosts(
    identity.salaryInTael,
    userInput.familySize,
    userInput.cityTier
  ), [identity.salaryInTael, userInput.familySize, userInput.cityTier]);
  
  // 获取生活成本描述
  const costNarrative = useMemo(() => getCostNarrative(livingCosts.lifestyleLevel.id), [livingCosts.lifestyleLevel.id]);
  
  // 获取家庭人口描述
  const familySizeOption = useMemo(() => 
    FAMILY_SIZE_OPTIONS.find(opt => opt.value === userInput.familySize),
    [userInput.familySize]
  );
  
  // 获取显示用的职业名称
  const displayOccupation = userInput.occupationDetail || occupationConfig.label;
  
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

  // 原生分享
  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: '官途算略 - 我的古代身份',
      text: `我在古代居然是${identity.dynasty}朝的${identity.title}！岁入折合纹银${identity.salaryInTael}两。快来测测你的古代身份 →`,
      url: getShareUrl(),
    };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 用户取消分享
        console.log('分享取消');
      }
    } else {
      // 不支持原生分享，使用复制链接
      handleCopyLink();
    }
  }, [identity, handleCopyLink]);

  // 导出通关文牒图片
  const handleExportImage = useCallback(async () => {
    if (!resultRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(resultRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FDF8E8',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      
      const link = document.createElement('a');
      link.download = `官途算略-${displayOccupation}-通关文牒.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败', err);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  }, [displayOccupation, isExporting]);

  // 导出年度消费账本
  const handleExportAccountBook = useCallback(async () => {
    if (!accountBookRef.current || exportingBook) return;
    
    setExportingBook(true);
    try {
      const dataUrl = await toPng(accountBookRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        filter: (node) => {
          // 隐藏带有 data-export-ignore 属性的元素
          return !node.dataset?.exportIgnore;
        }
      });
      
      const link = document.createElement('a');
      link.download = `官途算略-${displayOccupation}-年度消费账本.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败', err);
      alert('导出失败，请重试');
    } finally {
      setExportingBook(false);
    }
  }, [displayOccupation, exportingBook]);

  // 导出账房算计图片
  const handleExportLivingCost = useCallback(async () => {
    if (!livingCostRef.current || exportingLivingCost) return;
    
    setExportingLivingCost(true);
    try {
      const dataUrl = await toPng(livingCostRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        filter: (node) => {
          return !node.dataset?.exportIgnore;
        }
      });
      
      const link = document.createElement('a');
      link.download = `官途算略-${displayOccupation}-账房算计.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出失败', err);
      alert('导出失败，请重试');
    } finally {
      setExportingLivingCost(false);
    }
  }, [displayOccupation, exportingLivingCost]);

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
                      今有<span className="font-bold text-[#2E4A62] mx-1 border-b border-[#2E4A62]">「{displayOccupation}」</span>一名，
                      岁入<span className="font-bold text-[#C9372C] mx-1">{(identity.totalIncome).toLocaleString()}</span>元。
                    </div>
                  </div>
                  
                  <div className="pl-4 sm:pl-8 border-l-2 border-[#C9A961]/30 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <span className="text-[#5A4A3A] text-sm sm:text-base">折合纹银</span>
                      <div className="flex items-center gap-1">
                        <img src="/silver-ingot.webp" alt="银两" className="w-6 h-6 sm:w-8 sm:h-8 inline-block" />
                        <span className="font-bold text-2xl sm:text-3xl text-[#C9372C] font-ancient">{identity.salaryInTael}</span>
                        <span className="text-[#5A4A3A] text-sm sm:text-base">两</span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-[#8B7355] bg-[#C9A961]/10 inline-block px-2 py-1 rounded">
                      按{userInput.exchangeRate}元/两换算
                    </div>
                  </div>
                  
                  {/* 古代角色对应 - 移动端优化 */}
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#2E4A62]/5 rounded border border-[#2E4A62]/10 relative">
                    <div className="absolute -left-1 top-3 sm:top-4 w-2 h-6 sm:h-8 bg-[#2E4A62] rounded-r"></div>
                    <div className="text-center sm:text-left">
                      <div className="text-[#8B7355] font-ancient text-sm mb-2">古今对照</div>
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                        <span className="font-bold text-[#2E4A62] text-base sm:text-lg">「{occupationConfig.label}」</span>
                        <span className="text-[#C9A961] text-lg sm:hidden">↓</span>
                        <span className="hidden sm:inline text-[#C9A961]">⇌</span>
                        <span className="font-bold text-[#C9372C] text-lg sm:text-xl font-ancient">「{occupationConfig.ancientRole}」</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5A4A3A] mt-2 sm:mt-3 opacity-80 leading-relaxed text-center sm:text-left sm:pl-2 sm:border-l-2 sm:border-[#2E4A62]/20">
                      {occupationConfig.desc}
                    </p>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 text-center sm:text-left">
                    查《醒贪简要录》，堪抵<span className="font-bold text-[#2E4A62] mx-1">{identity.dynasty}</span>朝
                    <span className="font-bold text-[#C9372C] text-xl sm:text-2xl font-ancient mx-1 sm:mx-2">{identity.title}</span>。
                  </div>
                  
                  {personalizedComment && (
                    <div className="mt-3 sm:mt-4 bg-[#C9A961]/10 p-3 sm:p-4 rounded-lg relative">
                      <span className="absolute -top-3 left-4 bg-[#FDF8E8] px-2 text-xs sm:text-sm text-[#8B7355] font-ancient">履历评述</span>
                      <p className="text-[#5A4A3A] italic text-sm sm:text-base">
                        "{personalizedComment}"
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <p className="text-[#2E4A62] font-medium text-xl font-ancient border-y border-[#2E4A62]/10 py-3">
                      「{enhancedVerdict}」
                    </p>
                  </div>
                  
                  {identity.historicalFigure && (
                    <div className="mt-4 text-center">
                      <p className="text-[#5A4A3A] text-sm">
                        <span className="font-bold text-[#2E4A62]">历史对照：</span>
                        与{identity.historicalFigure}相当
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
                作为{identity.dynasty}朝的「{occupationConfig.ancientRole}」
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
                <h3 className="font-ancient text-lg sm:text-xl relative z-10">年度消费账本</h3>
                <p className="text-xs sm:text-sm opacity-80 relative z-10 mt-1">{identity.dynasty}朝万历年间 · 若大胆消费 · 年收入{identity.salaryInTael}两白银可供</p>
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

                <div className="pt-3 sm:pt-4 border-t-2 border-dashed border-[#C9A961]/30 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#8B7355]">年度消费合计</span>
                    <span className="text-[#5A4A3A] font-medium">
                      {purchasingPower.totalCost.toFixed(1)} 两
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#C9372C]/5 p-2 sm:p-3 rounded">
                    <span className="text-[#2E4A62] font-bold text-sm sm:text-base">年收入总计</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#C9372C] flex items-center gap-1 sm:gap-2 font-ancient">
                      <img src="/silver-ingot.webp" alt="银两" className="w-5 h-5 sm:w-6 sm:h-6" />
                      {identity.salaryInTael}
                      <span className="text-xs sm:text-sm text-[#8B7355] font-sans">两白银</span>
                    </span>
                  </div>
                  {identity.salaryInTael - purchasingPower.totalCost > 0 && (
                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1 sm:pt-2">
                      <span className="text-[#8B7355]">可结余储蓄</span>
                      <span className="text-[#2E4A62] font-bold">
                        约 {(identity.salaryInTael - purchasingPower.totalCost).toFixed(1)} 两
                      </span>
                    </div>
                  )}
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
                    "{costNarrative.overall}"
                  </p>
                </div>

                {/* 支出明细 */}
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#5A4A3A] flex items-center gap-2">
                    <span className="w-1 h-3 sm:h-4 bg-[#8B7355]"></span>
                    年度支出明细
                  </h4>
                  
                  {livingCosts.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5 sm:py-2 border-b border-dotted border-[#C9A961]/30 last:border-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                        <span className="text-[#5A4A3A] text-sm sm:text-base">{item.name}</span>
                        <span className="text-[10px] sm:text-xs text-[#8B7355] opacity-70">{item.description}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-[#2E4A62] text-sm sm:text-base">{item.cost.toFixed(1)}</span>
                        <span className="text-[10px] sm:text-xs text-[#8B7355] ml-1">两/年</span>
                      </div>
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
                  <div className={`flex items-center justify-between p-2 sm:p-3 rounded ${
                    livingCosts.surplus >= 0 ? 'bg-[#2E4A62]/5' : 'bg-[#C9372C]/5'
                  }`}>
                    <span className={`font-bold ${livingCosts.surplus >= 0 ? 'text-[#2E4A62]' : 'text-[#C9372C]'}`}>
                      {livingCosts.surplus >= 0 ? '年度结余' : '年度亏空'}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold font-ancient flex items-center gap-1 ${
                      livingCosts.surplus >= 0 ? 'text-[#2E4A62]' : 'text-[#C9372C]'
                    }`}>
                      <img src="/silver-ingot.webp" alt="银两" className="w-5 h-5 sm:w-6 sm:h-6" />
                      {livingCosts.surplus >= 0 ? '+' : ''}{livingCosts.surplus.toFixed(1)}
                      <span className="text-xs sm:text-sm text-[#8B7355] font-sans">两</span>
                      <span className="text-[10px] sm:text-xs text-[#8B7355] font-sans ml-1">
                        ({livingCosts.surplusRatio.toFixed(0)}%)
                      </span>
                    </span>
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
                <p>基于《宛署杂记》《醒贪简要录》核算</p>
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
            <span>昭告天下</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-3 text-[#8B7355] hover:text-[#2E4A62] border border-[#8B7355]/30 hover:border-[#2E4A62]/50 rounded-full transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
          </button>
        </div>

        <div className="mt-8 text-center text-[#8B7355] text-xs space-y-2 opacity-70">
          <p>换算说明：{userInput.exchangeRate}元人民币 ≈ 1两白银（明朝万历年间购买力平价）</p>
          <p>数据来源：《宛署杂记》《醒贪简要录》等历史文献</p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
